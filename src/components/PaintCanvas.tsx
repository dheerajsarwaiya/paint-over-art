import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Point } from "../types/canvas";
import type { ToolType } from "./BrushControls";
import {
  // getCursorPosition,
  drawLine,
  drawSpray,
  loadImageToCanvas,
} from "../utils/canvasHelpers";
import { getCanvasImageData } from "../utils/canvasSerializer";
import { base64ToImageData } from "../utils/canvasSerializer";

interface PaintCanvasProps {
  sketchImageDataUrl: string | null;
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  toolType: ToolType;
  isPanMode: boolean;
  scale: number;
  offsetX: number;
  offsetY: number;
  onPan: (deltaX: number, deltaY: number) => void;
  // imageOpacity: number;
  onHistoryUpdate: (imageData: ImageData) => void;
  triggerUndo: number;
  triggerRedo: number;
  onUndoRedoComplete: () => void;
  undoHistory: ImageData[];
  historyStep: number;
  loadedPaintLayer?: string | null; // Base64 encoded paint layer to restore
}

export interface PaintCanvasRef {
  getCurrentImageData: () => ImageData | null;
}

const PaintCanvas = forwardRef<PaintCanvasRef, PaintCanvasProps>((props, ref) => {
  const {
    sketchImageDataUrl,
    brushSize,
    brushColor,
    brushOpacity,
    toolType,
    isPanMode,
    scale,
    offsetX,
    offsetY,
    onPan,
    onHistoryUpdate,
    triggerUndo,
    triggerRedo,
    onUndoRedoComplete,
    undoHistory,
    historyStep,
    loadedPaintLayer,
  } = props;

  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentImageData: () => {
      if (!drawingCanvasRef.current) return null;
      return getCanvasImageData(drawingCanvasRef.current);
    },
  }));

  // Track if we've already loaded a paint layer to avoid re-initializing
  const hasLoadedPaintLayerRef = useRef(false);
  const lastSketchUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const setupCanvases = async () => {
      if (
        sketchImageDataUrl &&
        backgroundCanvasRef.current &&
        drawingCanvasRef.current
      ) {
        try {
          // Check if this is a new sketch image (new upload vs. loaded project)
          const isNewSketchImage = lastSketchUrlRef.current !== sketchImageDataUrl;
          if (isNewSketchImage && !loadedPaintLayer) {
            // Only reset if it's a new sketch without a paint layer to load
            hasLoadedPaintLayerRef.current = false;
          }
          lastSketchUrlRef.current = sketchImageDataUrl;

          // Wait for the background image to load and set canvas dimensions
          await loadImageToCanvas(
            sketchImageDataUrl,
            backgroundCanvasRef.current
          );

          // Now set the drawing canvas to match the background canvas dimensions
          const backgroundCanvas = backgroundCanvasRef.current;
          const drawingCanvas = drawingCanvasRef.current;

          drawingCanvas.width = backgroundCanvas.width;
          drawingCanvas.height = backgroundCanvas.height;

          const ctx = drawingCanvas.getContext("2d");
          if (!ctx) return;

          // Load paint layer after canvas is set up
          if (loadedPaintLayer && !hasLoadedPaintLayerRef.current) {
            console.log("Loading paint layer from saved file...");
            try {
              const imageData = await base64ToImageData(loadedPaintLayer);
              ctx.putImageData(imageData, 0, 0);
              // Add to history
              onHistoryUpdate(imageData);
              hasLoadedPaintLayerRef.current = true;
              console.log("Paint layer loaded successfully!");
            } catch (error) {
              console.error("Failed to restore paint layer:", error);
            }
          } else if (!loadedPaintLayer && undoHistory.length === 0 && !hasLoadedPaintLayerRef.current) {
            // Initialize the drawing canvas only if we haven't loaded a paint layer
            console.log("Initializing empty canvas...");
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            const imageData = ctx.getImageData(
              0,
              0,
              drawingCanvas.width,
              drawingCanvas.height
            );
            onHistoryUpdate(imageData);
            hasLoadedPaintLayerRef.current = true;
          }
        } catch (error) {
          console.error("Failed to load image to canvas:", error);
        }
      }
    };

    setupCanvases();
  }, [sketchImageDataUrl, loadedPaintLayer]);

  useEffect(() => {
    if (triggerUndo > 0 && drawingCanvasRef.current) {
      performUndo();
      onUndoRedoComplete();
    }
  }, [triggerUndo]);

  useEffect(() => {
    if (triggerRedo > 0 && drawingCanvasRef.current) {
      performRedo();
      onUndoRedoComplete();
    }
  }, [triggerRedo]);

  const performUndo = () => {
    if (historyStep > 0 && drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      if (ctx) {
        const previousState = undoHistory[historyStep - 1];
        ctx.putImageData(previousState, 0, 0);
      }
    }
  };

  const performRedo = () => {
    if (historyStep < undoHistory.length - 1 && drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      if (ctx) {
        const nextState = undoHistory[historyStep + 1];
        ctx.putImageData(nextState, 0, 0);
      }
    }
  };

  const saveToHistory = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(
          0,
          0,
          drawingCanvasRef.current.width,
          drawingCanvasRef.current.height
        );
        onHistoryUpdate(imageData);
      }
    }
  };

  const getCanvasCoordinates = useCallback(
    (event: React.MouseEvent | React.TouchEvent): Point | null => {
      if (!drawingCanvasRef.current || !containerRef.current) return null;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      let clientX: number, clientY: number;

      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      // Calculate the position relative to the container
      const containerX = clientX - containerRect.left;
      const containerY = clientY - containerRect.top;

      // Account for the transform: scale(scale) translate(offsetX/scale, offsetY/scale)
      // To reverse: first undo the translate, then undo the scale
      const canvasX = (containerX - offsetX) / scale;
      const canvasY = (containerY - offsetY) / scale;

      return { x: canvasX, y: canvasY };
    },
    [scale, offsetX, offsetY]
  );

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    if (isPanMode) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      let clientX: number, clientY: number;
      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      setIsPanning(true);
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    const point = getCanvasCoordinates(event);
    if (!point || !drawingCanvasRef.current) return;

    setIsDrawing(true);
    setLastPoint(point);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    if (isPanMode && isPanning && lastPanPoint) {
      let clientX: number, clientY: number;
      if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const deltaX = clientX - lastPanPoint.x;
      const deltaY = clientY - lastPanPoint.y;

      onPan(deltaX, deltaY);
      setLastPanPoint({ x: clientX, y: clientY });
      return;
    }

    if (!isDrawing || !drawingCanvasRef.current || !lastPoint) {
      return;
    }

    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const currentPoint = getCanvasCoordinates(event);
    if (!currentPoint) {
      return;
    }

    if (toolType === "spray") {
      // For spray paint, draw at current point
      drawSpray(ctx, currentPoint.x, currentPoint.y, brushColor, brushSize, brushOpacity);
    } else {
      // For brush and eraser, draw lines
      drawLine(
        ctx,
        lastPoint.x,
        lastPoint.y,
        currentPoint.x,
        currentPoint.y,
        brushColor,
        brushSize,
        toolType === "eraser",
        brushOpacity
      );
    }

    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      saveToHistory();
    }
  };

  if (!sketchImageDataUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <p className="text-lg text-gray-500">
          Upload an image to start painting
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-200 rounded-lg shadow-inner ${
        isPanMode ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
      style={{ width: "100%", height: "100%" }}
      {...(isPanMode && {
        onMouseDown: startDrawing,
        onMouseMove: draw,
        onMouseUp: stopDrawing,
        onMouseLeave: stopDrawing,
        onTouchStart: startDrawing,
        onTouchMove: draw,
        onTouchEnd: stopDrawing,
      })}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${offsetX / scale}px, ${
            offsetY / scale
          }px)`,
          transformOrigin: "0 0",
          position: "relative",
        }}
      >
        <canvas
          ref={backgroundCanvasRef}
          className="absolute top-0 left-0"
          style={{ imageRendering: "auto" }}
        />
        <canvas
          ref={drawingCanvasRef}
          className={`absolute top-0 left-0 ${
            isPanMode 
              ? "pointer-events-none" 
              : toolType === "brush" 
                ? "cursor-brush" 
                : toolType === "spray" 
                  ? "cursor-spray" 
                  : "cursor-eraser"
          }`}
          {...(!isPanMode && {
            onMouseDown: startDrawing,
            onMouseMove: draw,
            onMouseUp: stopDrawing,
            onMouseLeave: stopDrawing,
            onTouchStart: startDrawing,
            onTouchMove: draw,
            onTouchEnd: stopDrawing,
          })}
        />
      </div>
    </div>
  );
});

export default PaintCanvas;

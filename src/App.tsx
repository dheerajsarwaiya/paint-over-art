import { useState, useCallback } from "react";
import { Palette } from "lucide-react";
import ImageUploader from "./components/ImageUploader";
import PaintCanvas from "./components/PaintCanvas";
import ColorPalette from "./components/ColorPalette";
import BrushControls from "./components/BrushControls";
import CanvasControls from "./components/CanvasControls";
import HistoryControls from "./components/HistoryControls";
import ColorHighlightOverlay from "./components/ColorHighlightOverlay";

function App() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [sketchImageDataUrl, setSketchImageDataUrl] = useState<string | null>(
    null
  );
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(0.3);
  const [isEraser, setIsEraser] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  // const [imageLocked, setImageLocked] = useState(false);
  // const [imageOpacity, setImageOpacity] = useState(0.5);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [triggerUndo, setTriggerUndo] = useState(0);
  const [triggerRedo, setTriggerRedo] = useState(0);
  const [isColorHighlightEnabled, setIsColorHighlightEnabled] = useState(false);

  const handleImageUpload = (
    dataUrl: string,
    sketchUrl: string,
    colors?: string[]
  ) => {
    setImageDataUrl(dataUrl);
    setSketchImageDataUrl(sketchUrl);
    setDominantColors(colors || []);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setHistory([]);
    setHistoryStep(-1);
    setIsColorHighlightEnabled(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.1));
  };

  const handleResetZoom = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    setOffsetX((prev) => prev + deltaX);
    setOffsetY((prev) => prev + deltaY);
  };

  const handleHistoryUpdate = useCallback(
    (imageData: ImageData) => {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(imageData);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    },
    [history, historyStep]
  );

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1);
      setTriggerUndo((prev) => prev + 1);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep((prev) => prev + 1);
      setTriggerRedo((prev) => prev + 1);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all your painting?")) {
      setHistory([]);
      setHistoryStep(-1);
      setImageDataUrl(imageDataUrl);
      setSketchImageDataUrl(sketchImageDataUrl);
    }
  };

  const handleUndoRedoComplete = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Palette className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Paint Over Art
                </h1>
                <p className="text-sm text-gray-600">
                  Upload, trace, and create beautiful artwork
                </p>
              </div>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Top bar with brush and canvas controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="min-w-0 ">
            <BrushControls
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              brushOpacity={brushOpacity}
              onBrushOpacityChange={setBrushOpacity}
              isEraser={isEraser}
              onToggleEraser={() => setIsEraser(!isEraser)}
            />
          </div>
          <div className="min-w-0 ">
            <CanvasControls
              scale={scale}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              isPanMode={isPanMode}
              onTogglePan={() => setIsPanMode(!isPanMode)}
              // imageLocked={imageLocked}
              // onToggleLock={() => setImageLocked(!imageLocked)}
              // imageOpacity={imageOpacity}
              // onOpacityChange={setImageOpacity}
            />
          </div>
          <div className="min-w-0 ">
            <HistoryControls
              canUndo={historyStep > 0}
              canRedo={historyStep < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClear={handleClear}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            {imageDataUrl && (
              <div className="p-4 bg-white rounded-lg shadow-sm">
                {/* <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Original Image
                </h3> */}
                <ColorHighlightOverlay
                  imageDataUrl={imageDataUrl}
                  brushColor={brushColor}
                  isEnabled={isColorHighlightEnabled}
                  onToggle={() =>
                    setIsColorHighlightEnabled(!isColorHighlightEnabled)
                  }
                />
              </div>
            )}
            <ColorPalette
              selectedColor={brushColor}
              onColorChange={setBrushColor}
              dominantColors={dominantColors}
            />
          </div>

          <div className="space-y-4 lg:col-span-3">
            {/* Canvas area */}
            <div
              className="p-6 bg-white rounded-lg shadow-lg"
              style={{ height: "calc(100vh - 260px)" }}
            >
              <PaintCanvas
                sketchImageDataUrl={sketchImageDataUrl}
                brushSize={brushSize}
                brushColor={brushColor}
                brushOpacity={brushOpacity}
                isEraser={isEraser}
                isPanMode={isPanMode}
                scale={scale}
                offsetX={offsetX}
                offsetY={offsetY}
                onPan={handlePan}
                // imageOpacity={imageOpacity}
                onHistoryUpdate={handleHistoryUpdate}
                triggerUndo={triggerUndo}
                triggerRedo={triggerRedo}
                onUndoRedoComplete={handleUndoRedoComplete}
                undoHistory={history}
                historyStep={historyStep}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

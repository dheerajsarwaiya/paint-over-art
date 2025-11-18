import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Palette, HelpCircle } from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import { saveProject, loadProject } from "../utils/projectSave";
import { exportCanvasAsImage } from "../utils/exportCanvas";
import PaintCanvas from "../components/PaintCanvas";
import ColorPalette from "../components/ColorPalette";
import BrushControls, { ToolType } from "../components/BrushControls";
import CanvasControls from "../components/CanvasControls";
import HistoryControls from "../components/HistoryControls";
import ColorHighlightOverlay from "../components/ColorHighlightOverlay";
// import { Analytics } from "@vercel/analytics/next";

function Home() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [sketchImageDataUrl, setSketchImageDataUrl] = useState<string | null>(
    null
  );
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(0.3);
  const [toolType, setToolType] = useState<ToolType>("brush");
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
  const [loadedPaintLayer, setLoadedPaintLayer] = useState<string | null>(null);
  const paintCanvasRef = useRef<{
    getCurrentImageData: () => ImageData | null;
  }>(null);

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
    setLoadedPaintLayer(null); // Reset loaded paint layer for new uploads
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.1));
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

  const handleSaveProgress = async (): Promise<void> => {
    try {
      const currentImageData = paintCanvasRef.current?.getCurrentImageData();

      if (!currentImageData || !imageDataUrl || !sketchImageDataUrl) {
        alert(
          "No project data to save. Please upload an image and start painting first."
        );
        return;
      }

      const result = await saveProject(
        imageDataUrl,
        sketchImageDataUrl,
        dominantColors,
        currentImageData,
        {
          brushSize,
          brushColor,
          brushOpacity,
          scale,
          offsetX,
          offsetY,
          isEraser: toolType === "eraser",
          isPanMode,
          isColorHighlightEnabled,
        }
      );

      if (result.success) {
        alert(`Progress saved successfully as ${result.filename}`);
      } else {
        alert(`Failed to save progress: ${result.error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An unexpected error occurred while saving.");
    }
  };

  const handleLoadProgress = async (file: File): Promise<void> => {
    try {
      const result = await loadProject(file);

      if (!result.success || !result.data) {
        alert(`Failed to load project: ${result.error}`);
        return;
      }

      const { data } = result;

      // Restore project images and settings
      setImageDataUrl(data.project.originalImage);
      setSketchImageDataUrl(data.project.sketchImage);
      setDominantColors(data.project.dominantColors);

      // Restore UI settings
      setBrushSize(data.settings.brushSize);
      setBrushColor(data.settings.brushColor);
      setBrushOpacity(data.settings.brushOpacity);
      setScale(data.settings.scale);
      setOffsetX(data.settings.offsetX);
      setOffsetY(data.settings.offsetY);
      setToolType(data.settings.isEraser ? "eraser" : "brush");
      setIsPanMode(data.settings.isPanMode);
      setIsColorHighlightEnabled(data.settings.isColorHighlightEnabled);

      // Clear history for fresh start
      setHistory([]);
      setHistoryStep(-1);

      // Set the loaded paint layer - PaintCanvas will restore it
      setLoadedPaintLayer(data.canvas.paintLayer);

      alert("Project loaded successfully!");
    } catch (error) {
      console.error("Load error:", error);
      alert("An unexpected error occurred while loading the project.");
    }
  };

  const handleExportImage = async (): Promise<void> => {
    try {
      const currentImageData = paintCanvasRef.current?.getCurrentImageData();

      if (!currentImageData || !sketchImageDataUrl) {
        alert(
          "No canvas data to export. Please upload an image and start painting first."
        );
        return;
      }

      // Ask user if they want to include the original colored/posterized image
      const includeOriginal = window.confirm(
        "Do you want to include the original colored image in the export?\n\n" +
          "Click OK to export with the original colored/posterized image as background.\n" +
          "Click Cancel to export with only the grayscale sketch outline and your painting."
      );

      await exportCanvasAsImage(sketchImageDataUrl, currentImageData, {
        includeOriginal,
        originalImageDataUrl: imageDataUrl || undefined,
        filename: "my-painting.png",
      });

      alert("Image exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("An error occurred while exporting the image.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-300 to-gray-800">
                <Palette className="text-[#39FF14]" size={24} />
              </div>
              <div>
                <h1 className="flex gap-2 text-2xl font-bold text-amber-500">
                  Paint By{" "}
                  <span className="text-[#39FF14] [-webkit-text-stroke:1px_#374151] [text-stroke:1px_#374151]">
                    {" "}
                    Neon
                  </span>
                </h1>
                <p className="text-sm text-gray-600">
                  Upload, trace, and create beautiful artwork
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/why-and-how"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <HelpCircle size={16} />
                Why and How?
              </Link>
              <ImageUploader
                onImageUpload={handleImageUpload}
                onProjectLoad={handleLoadProgress}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Welcome message for new users */}
        {!imageDataUrl && !sketchImageDataUrl && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="max-w-2xl p-8 text-center bg-white shadow-lg rounded-2xl">
              <h2 className="mb-4 text-3xl font-bold text-gray-500">
                Welcome to <span className="text-amber-500">Paint By</span>
                <span className="text-[#39FF14] [-webkit-text-stroke:1px_#374151] [text-stroke:1px_#374151]">
                  {" "}
                  Neon
                </span>
              </h2>
              <img
                src="/images/home.webp"
                alt="Paint By Neon"
                className="w-full mx-auto mb-4"
              />
              {/* <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-600">
                <Palette className="text-[#39FF14]" size={40} />
              </div> */}
              <p className="mt-6 mb-6 text-lg font-bold leading-relaxed text-gray-600">
                Transform any image into a masterpiece and bring it to life with
                your creativity.
              </p>
              <div className="p-6 mb-6 text-left bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <h3 className="mb-3 text-xl font-semibold text-gray-800">
                  Getting Started:
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 ">
                    <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                      1
                    </span>
                    <span className="pt-0.5 flex items-center gap-2">
                      <ImageUploader
                        onImageUpload={handleImageUpload}
                        onProjectLoad={handleLoadProgress}
                      />
                      to choose a photo you'd like to paint
                    </span>
                  </li>{" "}
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                      2
                    </span>
                    <span className="pt-0.5">
                      <strong>Start painting</strong> - We create a sketch,
                      provide a color palette, and a color highlighter tool that
                      can help you paint the right color in the right places.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                      3
                    </span>
                    <span className="pt-0.5">
                      <strong>Paint offline</strong> - If you prefer hardcopy,
                      take a printout of the sketch and use our mixer tool to
                      get the right color for offline painting.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white rounded-full w-7 h-7 bg-amber-500">
                      4
                    </span>
                    <span className="pt-0.5">
                      <strong>Save your progress</strong> - Export your artwork
                      or save your work file to continue later
                    </span>
                  </li>
                </ol>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <div className="text-sm text-gray-500">
                  Already have a saved project?
                </div>
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".paintbyneon,.paintoverart";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        handleLoadProgress(file);
                      }
                    };
                    input.click();
                  }}
                  className="px-6 py-2 text-sm font-medium text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-800"
                >
                  Load Existing Work
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main workspace - only shown after upload/load */}
        {(imageDataUrl || sketchImageDataUrl) && (
          <>
            {/* Top bar with brush and canvas controls */}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:flex-wrap sm:gap-4 sm:mb-6">
              <div className="w-full overflow-x-auto sm:w-auto">
                <BrushControls
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  brushOpacity={brushOpacity}
                  onBrushOpacityChange={setBrushOpacity}
                  toolType={toolType}
                  onToolChange={setToolType}
                />
              </div>
              <div className="w-full overflow-x-auto sm:w-auto">
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
              <div className="w-full overflow-x-auto sm:w-auto">
                <HistoryControls
                  canUndo={historyStep > 0}
                  canRedo={historyStep < history.length - 1}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClear}
                  onSave={handleSaveProgress}
                  onLoad={handleLoadProgress}
                  onExport={handleExportImage}
                  canSave={!!imageDataUrl && !!sketchImageDataUrl}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Canvas area - shows first on mobile, second on desktop */}
              <div className="order-1 space-y-4 lg:order-2 lg:col-span-3">
                {/* Canvas area */}
                <div
                  className="p-3 bg-white rounded-lg shadow-lg sm:p-6"
                  style={{ height: "calc(100vh - 260px)", minHeight: "400px" }}
                >
                  <PaintCanvas
                    ref={paintCanvasRef}
                    sketchImageDataUrl={sketchImageDataUrl}
                    brushSize={brushSize}
                    brushColor={brushColor}
                    brushOpacity={brushOpacity}
                    toolType={toolType}
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
                    loadedPaintLayer={loadedPaintLayer}
                  />
                </div>
              </div>

              {/* Sidebar - shows second on mobile, first on desktop */}
              <div className="order-2 space-y-4 lg:order-1 lg:col-span-1">
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;

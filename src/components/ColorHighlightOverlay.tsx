import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createColorHighlightImage } from "../utils/colorHighlight";

interface ColorHighlightOverlayProps {
  imageDataUrl: string;
  brushColor: string;
  isEnabled: boolean;
  onToggle: () => void;
  scale: number;
  offsetX: number;
  offsetY: number;
}

const ColorHighlightOverlay: React.FC<ColorHighlightOverlayProps> = ({
  imageDataUrl,
  brushColor,
  isEnabled,
  onToggle,
  scale,
  offsetX,
  offsetY,
}) => {
  const [highlightedImageUrl, setHighlightedImageUrl] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizeRatio, setSizeRatio] = useState<number>(1);

  const generateHighlight = useCallback(async () => {
    if (!imageDataUrl || !brushColor) return;

    setIsProcessing(true);
    try {
      const highlighted = await createColorHighlightImage(
        imageDataUrl,
        brushColor,
        30
      );
      setHighlightedImageUrl(highlighted);
    } catch (error) {
      console.error("Error creating color highlight:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageDataUrl, brushColor]);

  const handleToggle = async () => {
    if (!isEnabled) {
      // If we're enabling the highlight, generate it first
      if (!highlightedImageUrl) {
        await generateHighlight();
      }
    }
    onToggle();
  };

  // Regenerate highlight when brush color changes and highlight is enabled
  useEffect(() => {
    if (isEnabled && imageDataUrl) {
      generateHighlight();
    }
  }, [brushColor, imageDataUrl, isEnabled, generateHighlight]);

  // Calculate size ratio between sidebar and main canvas
  // Main canvas is in lg:col-span-3, sidebar is in lg:col-span-1
  // So the ratio is approximately 1:3, but we'll measure actual widths
  useEffect(() => {
    const updateSizeRatio = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // The main canvas takes ~75% of the row (3/4 columns)
        // The sidebar takes ~25% (1/4 column)
        // So sidebar is about 1/3 the size of the canvas
        // We calculate the ratio as sidebar_width / canvas_width
        // Approximate canvas width is containerWidth * 3
        const estimatedCanvasWidth = containerWidth * 3;
        setSizeRatio(containerWidth / estimatedCanvasWidth);
      }
    };

    updateSizeRatio();
    window.addEventListener('resize', updateSizeRatio);
    return () => window.removeEventListener('resize', updateSizeRatio);
  }, []);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isProcessing || !imageDataUrl}
        className={`mb-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          isEnabled
            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {isEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
            Color Highlighter
          </>
        )}
      </button>

      {/* Image Display */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-gray-100 rounded-lg aspect-square">
        {/* Transformed image container to match main canvas viewport */}
        <div
          style={{
            transform: `scale(${scale}) translate(${(offsetX * sizeRatio) / scale}px, ${
              (offsetY * sizeRatio) / scale
            }px)`,
            transformOrigin: "0 0",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Show highlighted image when enabled, otherwise show original */}
          <img
            src={
              isEnabled && highlightedImageUrl
                ? highlightedImageUrl
                : imageDataUrl
            }
            alt={
              isEnabled
                ? "Image with color highlights"
                : "Original uploaded image"
            }
            className="object-contain w-full h-full"
          />
        </div>

        {/* Status indicator */}
        {isEnabled && (
          <div className="absolute z-10 top-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-600 rounded">
              <Eye size={12} />
              Highlighting: {brushColor}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorHighlightOverlay;

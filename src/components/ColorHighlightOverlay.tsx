import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createColorHighlightImage } from "../utils/colorHighlight";

interface ColorHighlightOverlayProps {
  imageDataUrl: string;
  brushColor: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const ColorHighlightOverlay: React.FC<ColorHighlightOverlayProps> = ({
  imageDataUrl,
  brushColor,
  isEnabled,
  onToggle,
}) => {
  const [highlightedImageUrl, setHighlightedImageUrl] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

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
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
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
      <div className="w-full overflow-hidden bg-gray-100 rounded-lg aspect-square relative">
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

        {/* Status indicator */}
        {isEnabled && (
          <div className="absolute top-2 left-2">
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

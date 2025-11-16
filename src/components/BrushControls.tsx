import { Brush, Eraser, SprayCan } from "lucide-react";

export type ToolType = "brush" | "spray" | "eraser";

interface BrushControlsProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushOpacity: number;
  onBrushOpacityChange: (opacity: number) => void;
  toolType: ToolType;
  onToolChange: (tool: ToolType) => void;
}

// const BRUSH_SIZES = [2, 5, 10, 15, 20, 30, 40, 50];

export default function BrushControls({
  brushSize,
  onBrushSizeChange,
  brushOpacity,
  onBrushOpacityChange,
  toolType,
  onToolChange,
}: BrushControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {/* Tool Selection Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onToolChange("brush")}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md transition-colors ${
            toolType === "brush"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          <Brush size={16} />
          <span className="hidden text-xs font-medium sm:text-sm xs:inline">Brush</span>
        </button>

        <button
          onClick={() => onToolChange("spray")}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md transition-colors ${
            toolType === "spray"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          <SprayCan size={16} />
          <span className="hidden text-xs font-medium sm:text-sm xs:inline">Spray</span>
        </button>

        <button
          onClick={() => onToolChange("eraser")}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md transition-colors ${
            toolType === "eraser"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          <Eraser size={16} />
          <span className="hidden text-xs font-medium sm:text-sm xs:inline">Eraser</span>
        </button>
      </div>

      {/* Brush Size Control */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-700 sm:text-sm min-w-fit">
          {brushSize}px
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer sm:w-28 md:w-32 slider"
        />
      </div>

      {/* Brush Opacity Control */}
      <div className="flex items-center gap-2">
        <label className="hidden text-xs font-medium text-gray-700 sm:text-sm min-w-fit sm:inline">
          Opacity
        </label>
        <select
          value={brushOpacity}
          onChange={(e) => onBrushOpacityChange(Number(e.target.value))}
          className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={1}>100%</option>
          <option value={0.9}>90%</option>
          <option value={0.8}>80%</option>
          <option value={0.7}>70%</option>
          <option value={0.6}>60%</option>
          <option value={0.5}>50%</option>
          <option value={0.4}>40%</option>
          <option value={0.3}>30%</option>
          <option value={0.2}>20%</option>
          <option value={0.1}>10%</option>
        </select>
      </div>
    </div>
  );
}

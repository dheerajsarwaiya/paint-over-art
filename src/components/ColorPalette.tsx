import { useState } from "react";
import { Palette } from "lucide-react";
import ColorMixer from "./ColorMixer";
import colorPalette from "../data/color-palette-mixer.json";

interface ColorPaletteProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  dominantColors?: string[];
}

// Transform the imported color palette data
const PALETTE_COLORS = colorPalette.map((color) => ({
  name: color.name,
  value: color.hex,
}));

export default function ColorPalette({
  selectedColor,
  onColorChange,
  dominantColors,
}: ColorPaletteProps) {
  const [showColorMixer, setShowColorMixer] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Brush Color</h3>
        <button
          onClick={() => setShowColorMixer(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 hover:shadow-md"
          title="Find mixing recipe for selected color"
        >
          <Palette size={14} />
          Color Mixer
        </button>
      </div>
      {dominantColors && dominantColors.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-600">Image Colors</p>
          <div className="grid grid-cols-7 gap-2 pb-4 mb-4 border-b border-gray-200">
            {dominantColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                  selectedColor === color
                    ? "border-gray-900 ring-2 ring-offset-2 ring-gray-900"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
      <p className="mb-2 text-xs font-medium text-gray-600">
        More Colors ({PALETTE_COLORS.length} available)
      </p>
      {/* <div className="grid grid-cols-11 gap-1 max-h-[400px] overflow-y-auto pr-1">
        {PALETTE_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
              selectedColor === color.value
                ? "border-gray-900 ring-2 ring-offset-2 ring-gray-900"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={color.name}
          />
        ))}
      </div> */}

      {/* Color Mixer Modal */}
      {showColorMixer && (
        <ColorMixer
          selectedColor={selectedColor}
          onClose={() => setShowColorMixer(false)}
        />
      )}
    </div>
  );
}

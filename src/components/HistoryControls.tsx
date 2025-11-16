import { Undo2, Redo2, RotateCcw, Download } from "lucide-react";
import SaveProgressControls from "./SaveProgressControls";

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => Promise<void>;
  onLoad: (file: File) => Promise<void>;
  onExport: () => Promise<void>;
  canSave: boolean;
}

export default function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onLoad,
  onExport,
  canSave,
}: HistoryControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* History Controls */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            canUndo
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={` flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            canRedo
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Redo2 size={16} />
        </button>
        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 px-3 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={onExport}
          disabled={!canSave}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            canSave
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Export as Image"
        >
          <Download size={16} />
        </button>{" "}
        {/* Save/Load Controls */}
        <SaveProgressControls
          onSave={onSave}
          onLoad={onLoad}
          disableSave={!canSave}
          disableLoad={false}
        />
      </div>
    </div>
  );
}

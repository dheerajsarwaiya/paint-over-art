import { useState } from "react";
import { Save, Upload } from "lucide-react";

interface SaveProgressControlsProps {
  onSave: () => Promise<void>;
  onLoad: (file: File) => Promise<void>;
  disableSave?: boolean;
  disableLoad?: boolean;
}

export default function SaveProgressControls({
  onSave,
  onLoad,
  disableSave = false,
  disableLoad = false,
}: SaveProgressControlsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (disableSave || isSaving) return;

    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || isLoading || disableLoad) return;

    setIsLoading(true);
    try {
      await onLoad(file);
    } catch (error) {
      console.error("Load failed:", error);
    } finally {
      setIsLoading(false);
      // Clear the input to allow loading the same file again
      event.target.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={disableSave || isSaving}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          disableSave || isSaving
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
        title="Save progress to file"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span className="text-sm font-medium">Save</span>
          </>
        )}
      </button>

      {/* Load Button */}
      <label
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          disableLoad || isLoading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        title="Load progress from file"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span className="text-sm font-medium">Load</span>
          </>
        )}
        <input
          type="file"
          accept=".paintoverart"
          onChange={handleFileChange}
          disabled={disableLoad || isLoading}
          className="hidden"
        />
      </label>
    </div>
  );
}

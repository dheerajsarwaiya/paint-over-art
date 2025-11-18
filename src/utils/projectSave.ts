import { PaintOverArtSave, SaveResult, LoadResult } from "../types/projectSave";
import { imageDataToBase64, base64ToImageData } from "./canvasSerializer";

const CURRENT_VERSION = "1.0.0";
const FILE_EXTENSION = ".paintbyneon";

/**
 * Generate a filename for the save file
 */
export function generateSaveFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, "-");
  return `paint-over-art-${timestamp}${FILE_EXTENSION}`;
}

/**
 * Save current project state to a .paintoverart file
 */
export async function saveProject(
  originalImage: string,
  sketchImage: string,
  dominantColors: string[],
  paintLayerImageData: ImageData | null,
  settings: {
    brushSize: number;
    brushColor: string;
    brushOpacity: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    isEraser: boolean;
    isPanMode: boolean;
    isColorHighlightEnabled: boolean;
  }
): Promise<SaveResult> {
  try {
    if (!paintLayerImageData) {
      return {
        success: false,
        error: "No paint layer data to save",
      };
    }

    const paintLayerBase64 = imageDataToBase64(paintLayerImageData);

    const saveData: PaintOverArtSave = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      project: {
        originalImage,
        sketchImage,
        dominantColors,
      },
      canvas: {
        paintLayer: paintLayerBase64,
        dimensions: {
          width: paintLayerImageData.width,
          height: paintLayerImageData.height,
        },
      },
      settings,
    };

    const jsonString = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const filename = generateSaveFilename();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error("Error saving project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Load project state from a .paintoverart file
 */
export async function loadProject(file: File): Promise<LoadResult> {
  try {
    // Validate file extension
    if (!file.name.endsWith(FILE_EXTENSION)) {
      return {
        success: false,
        error: `Invalid file format. Expected ${FILE_EXTENSION} file.`,
      };
    }

    // Read file content
    const jsonString = await readFileAsText(file);
    const data: PaintOverArtSave = JSON.parse(jsonString);

    // Validate file structure
    const validationError = validateSaveData(data);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error loading project:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load project file",
    };
  }
}

/**
 * Restore canvas ImageData from saved paint layer
 */
export async function restorePaintLayer(
  paintLayerBase64: string
): Promise<ImageData> {
  return base64ToImageData(paintLayerBase64);
}

/**
 * Read file as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Validate save data structure
 */
function validateSaveData(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return "Invalid file format";
  }

  const saveData = data as Record<string, unknown>;

  if (!saveData.version || typeof saveData.version !== "string") {
    return "Missing or invalid version information";
  }

  if (!saveData.project || typeof saveData.project !== "object") {
    return "Missing project data";
  }

  const project = saveData.project as Record<string, unknown>;
  if (!project.originalImage || !project.sketchImage) {
    return "Missing required image data";
  }

  if (!saveData.canvas || typeof saveData.canvas !== "object") {
    return "Missing canvas data";
  }

  const canvas = saveData.canvas as Record<string, unknown>;
  if (!canvas.paintLayer) {
    return "Missing paint layer data";
  }

  if (!saveData.settings || typeof saveData.settings !== "object") {
    return "Missing settings data";
  }

  // Check version compatibility (for future use)
  if (saveData.version !== CURRENT_VERSION) {
    console.warn(
      `File version ${saveData.version} may not be fully compatible with current version ${CURRENT_VERSION}`
    );
  }

  return null;
}

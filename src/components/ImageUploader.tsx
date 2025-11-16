import { Upload } from "lucide-react";
import { posterizeImage } from "../utils/imageProcessing";
import { useState } from "react";
import { blurImage } from "../utils/blurImage";
// import { createOutlineImage } from "../utils/createOutlineImage";
import { toGrayscale } from "../utils/grayscale";

interface ImageUploaderProps {
  onImageUpload: (
    imageDataUrl: string,
    sketchUrl: string,
    dominantColors?: string[]
  ) => void;
  onProjectLoad?: (projectFile: File) => void;
}

export default function ImageUploader({
  onImageUpload,
  onProjectLoad,
}: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a .paintoverart file
    if (file.name.endsWith(".paintoverart")) {
      if (onProjectLoad) {
        onProjectLoad(file);
      }
      return;
    }

    // Handle regular image files
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setIsProcessing(true);
        try {
          // 1. BLUR THE IMAGE
          const blurredDataUrl = await blurImage(result);

          const { imageDataUrl: posterizedDataUrl, dominantColors } =
            await posterizeImage(blurredDataUrl, 6, 70);

          const grayscaleDataUrl = await toGrayscale(posterizedDataUrl);
          // const { imageDataUrl: finalBwTemplateUrl } = await posterizeImage(
          //   grayscaleDataUrl,
          //   4, // Use 3-5 levels for limited shades of gray
          //   10 // Threshold doesn't matter much here since colors are already 1D (grayscale)
          // );

          // // 3. CREATE THE OUTLINE IMAGE (Uses the posterized image as input)
          // const outlineDataUrl = await createOutlineImage(
          //   posterizedDataUrl,
          //   40 // Adjust this for line quality
          // );
          // onImageUpload(posterizedDataUrl, dominantColors);
          onImageUpload(posterizedDataUrl, grayscaleDataUrl, dominantColors);
        } catch (error) {
          console.error("Failed to process image:", error);
          onImageUpload(result, result);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label
        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
          isProcessing
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        <Upload size={18} />
        <span className="font-medium">
          {isProcessing ? "Processing..." : "Upload Image"}
        </span>
        <input
          type="file"
          accept="image/*,.paintoverart"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
        />
      </label>
    </div>
  );
}

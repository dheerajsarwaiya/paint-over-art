/**
 * Utility functions for color highlighting in images
 */

/**
 * Check if two colors match within a given tolerance
 */
export function colorsMatch(
  color1: string,
  color2: string,
  tolerance: number = 30
): boolean {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

/**
 * Convert RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Create a highlighted version of an image where pixels matching the target color are highlighted in neon green
 * All other pixels remain unchanged from the original
 */
export function createColorHighlightImage(
  imageDataUrl: string,
  targetColor: string,
  tolerance: number = 30
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Neon green color (bright, vibrant green)
      const neonGreen = { r: 57, g: 255, b: 20 }; // #39FF14

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const pixelColor = rgbToHex(r, g, b);

        if (colorsMatch(pixelColor, targetColor, tolerance)) {
          // Replace matching pixels with neon green
          data[i] = neonGreen.r; // Red
          data[i + 1] = neonGreen.g; // Green
          data[i + 2] = neonGreen.b; // Blue
          // Keep original alpha (data[i + 3])
        }
        // Non-matching pixels remain unchanged
      }

      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to data URL
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageDataUrl;
  });
}

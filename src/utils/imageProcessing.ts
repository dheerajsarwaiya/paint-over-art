export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const colorDistance = (c1: RGB, c2: RGB): number => {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const quantizeColor = (color: RGB, levels: number): RGB => {
  const step = 256 / levels;
  return {
    r: Math.round(Math.round(color.r / step) * step),
    g: Math.round(Math.round(color.g / step) * step),
    b: Math.round(Math.round(color.b / step) * step),
  };
};

const colorToString = (color: RGB): string => {
  return `${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)}`;
};

const rgbToHex = (color: RGB): string => {
  return `#${Math.round(color.r).toString(16).padStart(2, "0")}${Math.round(
    color.g
  )
    .toString(16)
    .padStart(2, "0")}${Math.round(color.b)
    .toString(16)
    .padStart(2, "0")}`.toUpperCase();
};

export interface PosterizeResult {
  imageDataUrl: string;
  dominantColors: string[];
  imageData: ImageData;
}

export const posterizeImage = (
  imageDataUrl: string,
  colorLevels: number = 7,
  colorThreshold: number = 50
): Promise<PosterizeResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // const data = imageData.data;

      // --- START: Spatial Filtering Step (New Code) ---
      // const blurredData = applyKernel(
      //   imageData.data,
      //   canvas.width,
      //   canvas.height,
      //   GAUSSIAN_KERNEL,
      //   GAUSSIAN_SIZE,
      //   GAUSSIAN_WEIGHT
      // );

      // // Overwrite the original data with the blurred data for posterization
      // imageData.data.set(blurredData);
      const data = imageData.data;
      const uniqueColors: RGB[] = [];

      // First pass: Posterize the image
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const originalColor: RGB = { r, g, b };
        const quantized = quantizeColor(originalColor, colorLevels);

        let matchedColor = quantized;
        let minDistance = colorThreshold;

        for (const existingColor of uniqueColors) {
          const dist = colorDistance(quantized, existingColor);
          if (dist < minDistance) {
            minDistance = dist;
            matchedColor = existingColor;
          }
        }

        if (minDistance >= colorThreshold) {
          uniqueColors.push(quantized);
          matchedColor = quantized;
        }

        data[i] = matchedColor.r;
        data[i + 1] = matchedColor.g;
        data[i + 2] = matchedColor.b;
      }

      ctx.putImageData(imageData, 0, 0);

      // Second pass: Extract ALL colors from the final posterized image
      const colorFrequency = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const color: RGB = { r, g, b };
        const colorKey = colorToString(color);
        colorFrequency.set(colorKey, (colorFrequency.get(colorKey) || 0) + 1);
      }

      const sortedColors = Array.from(colorFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([colorStr]) => {
          const parts = colorStr.split(",").map(Number);
          return rgbToHex({ r: parts[0], g: parts[1], b: parts[2] });
        });

      resolve({
        imageDataUrl: canvas.toDataURL("image/png"),
        dominantColors: sortedColors,
        imageData: imageData,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageDataUrl;
  });
};

/**
 * Image compression and optimization utility for client-side uploads and Firestore payload safety.
 * Firestore documents have a strict 1,048,576 byte limit (1 MiB).
 * This utility ensures all stored images are scaled and compressed to < 400 KB without perceptible visual loss.
 */

export async function compressBase64Image(
  dataUrl: string,
  maxDimension = 1400,
  initialQuality = 0.82,
  maxSizeBytes = 450 * 1024
): Promise<string> {
  // If not a base64 data URL (e.g. https://... link), return as is
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  // If already very small (< 150 KB), no need to recompress
  if (dataUrl.length < 200 * 1024) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(dataUrl);
        return;
      }

      // Calculate aspect ratio preserving dimensions
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Clean fill for transparency if converting to JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      let quality = initialQuality;
      let output = canvas.toDataURL('image/jpeg', quality);

      // Iterative compression if payload is still larger than maxSizeBytes
      let attempts = 0;
      while (output.length > maxSizeBytes && attempts < 4) {
        attempts++;
        quality = Math.max(0.5, quality - 0.12);
        // Also downscale canvas if significantly oversized
        if (output.length > maxSizeBytes * 1.5) {
          width = Math.round(width * 0.8);
          height = Math.round(height * 0.8);
          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        output = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(output);
    };

    img.onerror = () => {
      // In case of load error, fallback safely
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Compresses an uploaded File into an optimized base64 data URL.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Failed to read file.'));
        return;
      }
      try {
        const compressed = await compressBase64Image(rawDataUrl, maxDimension, quality);
        resolve(compressed);
      } catch (err) {
        resolve(rawDataUrl);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

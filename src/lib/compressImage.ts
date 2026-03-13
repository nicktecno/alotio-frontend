const MAX_IMAGE_BYTES = 20 * 1024; // 20KB for images
const MAX_PDF_BYTES = 200 * 1024; // 200KB for PDFs
const MAX_DIMENSION = 800;
const MIN_QUALITY = 0.1;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao comprimir imagem'))),
      type,
      quality,
    );
  });
}

function formatSize(bytes: number): string {
  return bytes < 1024 ? `${bytes}B` : `${Math.round(bytes / 1024)}KB`;
}

export class FileTooLargeError extends Error {
  constructor(fileName: string, fileSize: number, maxSize: number) {
    super(
      `O arquivo "${fileName}" tem ${formatSize(fileSize)}, mas o limite para PDF é ${formatSize(maxSize)}. ` +
      `Reduza o arquivo ou envie uma foto/imagem do documento (que será comprimida automaticamente).`,
    );
    this.name = 'FileTooLargeError';
  }
}

/**
 * Compresses an image file to fit within 20KB.
 * For PDFs, validates that the file is under 200KB (no browser-side PDF compression).
 * Throws FileTooLargeError if a PDF exceeds the limit.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === 'application/pdf') {
    if (file.size > MAX_PDF_BYTES) {
      throw new FileTooLargeError(file.name, file.size, MAX_PDF_BYTES);
    }
    return file;
  }

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  if (file.size <= MAX_IMAGE_BYTES) {
    return file;
  }

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  const outputType = 'image/jpeg';
  let quality = 0.8;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > MAX_IMAGE_BYTES && quality > MIN_QUALITY) {
    quality -= 0.05;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  if (blob.size > MAX_IMAGE_BYTES) {
    const scale = Math.sqrt(MAX_IMAGE_BYTES / blob.size);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.drawImage(img.complete ? img : await loadImage(file), 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, outputType, MIN_QUALITY);
  }

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: outputType });
}

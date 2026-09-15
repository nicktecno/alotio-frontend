import type { CardFormat, DigitalCardData } from '@/lib/digital-card';
import { CARD_FORMATS, cardImageSrc, formatPhoneDisplay } from '@/lib/digital-card';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  let line = '';
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]!;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i]!;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawContainImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  padding: number,
) {
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;
  const imgRatio = img.width / img.height;
  const boxRatio = innerW / innerH;
  let dw = innerW;
  let dh = innerH;

  if (imgRatio > boxRatio) {
    dw = innerW;
    dh = innerW / imgRatio;
  } else {
    dh = innerH;
    dw = innerH * imgRatio;
  }

  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export async function exportDigitalCardPng(
  data: DigitalCardData,
  format: CardFormat,
): Promise<Blob> {
  const spec = CARD_FORMATS.find((f) => f.id === format) ?? CARD_FORMATS[0]!;
  const { w, h } = spec;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#5b21b6');
  grad.addColorStop(0.5, '#8257e5');
  grad.addColorStop(1, '#04d361');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const pad = Math.round(w * 0.06);
  const footH = Math.round(h * 0.12);
  const cardX = pad;
  const cardY = Math.round(h * 0.06);
  const cardW = w - pad * 2;
  const cardH = h - cardY - footH - Math.round(h * 0.03);

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  const imageSrc = cardImageSrc(data);
  const isCustomImage = Boolean(data.showImage && data.imageUrl);
  const imageH = imageSrc ? Math.round(cardH * 0.34) : 0;
  let contentY = cardY + 36;

  if (imageSrc) {
    const imgX = cardX;
    const imgY = cardY;
    ctx.save();
    roundRect(ctx, imgX, imgY, cardW, imageH + 8, 28);
    ctx.clip();
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(imgX, imgY, cardW, imageH + 8);
    try {
      const photo = await loadImage(
        imageSrc.startsWith('/') ? `${window.location.origin}${imageSrc}` : imageSrc,
      );
      if (isCustomImage) {
        drawCoverImage(ctx, photo, imgX, imgY, cardW, imageH + 8);
      } else {
        drawContainImage(ctx, photo, imgX, imgY, cardW, imageH + 8, Math.round(w * 0.04));
      }
    } catch {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(imgX, imgY, cardW, imageH + 8);
    }
    ctx.restore();
    contentY = imgY + imageH + 40;
  }

  const textPad = 36;
  const textMaxW = cardW - textPad * 2;

  ctx.fillStyle = '#04d361';
  ctx.font = `bold ${Math.round(w * 0.026)}px system-ui, sans-serif`;
  ctx.fillText('TRANSPORTE ESCOLAR', cardX + textPad, contentY);

  ctx.fillStyle = '#1f2937';
  ctx.font = `bold ${Math.round(w * 0.058)}px system-ui, sans-serif`;
  const nameY = contentY + 48;
  wrapText(ctx, data.displayName, cardX + textPad, nameY, textMaxW, Math.round(w * 0.07));

  let detailY = nameY + 68;
  if (data.prefixo) {
    ctx.fillStyle = '#8257e5';
    ctx.font = `600 ${Math.round(w * 0.03)}px system-ui, sans-serif`;
    ctx.fillText(`Prefixo ${data.prefixo}`, cardX + textPad, detailY);
    detailY += 40;
  }

  const phone = formatPhoneDisplay(data.phone);
  if (phone) {
    ctx.fillStyle = '#374151';
    ctx.font = `600 ${Math.round(w * 0.034)}px system-ui, sans-serif`;
    ctx.fillText(`📱 ${phone}`, cardX + textPad, detailY);
    detailY += 48;
  }

  let ty = detailY + 4;
  if (data.schools) {
    ctx.font = `600 ${Math.round(w * 0.024)}px system-ui, sans-serif`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Escolas', cardX + textPad, ty);
    ty += 32;
    ctx.font = `${Math.round(w * 0.026)}px system-ui, sans-serif`;
    ctx.fillStyle = '#6b7280';
    ty = wrapText(ctx, data.schools, cardX + textPad, ty, textMaxW, 34);
    ty += 8;
  }

  if (data.neighborhoods) {
    ctx.font = `600 ${Math.round(w * 0.024)}px system-ui, sans-serif`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Bairros', cardX + textPad, ty);
    ty += 32;
    ctx.font = `${Math.round(w * 0.026)}px system-ui, sans-serif`;
    wrapText(ctx, data.neighborhoods, cardX + textPad, ty, textMaxW, 34);
  }

  const footerY = h - footH + 8;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(w * 0.038)}px system-ui, sans-serif`;
  ctx.fillText('Alô Tio', pad, footerY + 42);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `${Math.round(w * 0.022)}px system-ui, sans-serif`;
  wrapText(
    ctx,
    data.tagline || 'Transporte escolar com segurança e confiança',
    pad,
    footerY + 78,
    w - pad * 2,
    28,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar PNG'))),
      'image/png',
      1,
    );
  });
}

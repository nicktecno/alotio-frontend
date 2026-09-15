import type { CardFormat, DigitalCardData } from '@/lib/digital-card';
import { CARD_FORMATS, formatPhoneDisplay, profilePublicUrl } from '@/lib/digital-card';

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
  const cardX = pad;
  const cardY = Math.round(h * 0.12);
  const cardW = w - pad * 2;
  const cardH = Math.round(h * 0.62);

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  ctx.fillStyle = '#04d361';
  ctx.font = `bold ${Math.round(w * 0.028)}px system-ui, sans-serif`;
  ctx.fillText('TRANSPORTE ESCOLAR', cardX + 40, cardY + 56);

  ctx.fillStyle = '#1f2937';
  ctx.font = `bold ${Math.round(w * 0.065)}px system-ui, sans-serif`;
  const nameY = cardY + 120;
  wrapText(ctx, data.displayName, cardX + 40, nameY, cardW - 80, Math.round(w * 0.075));

  if (data.prefixo) {
    ctx.fillStyle = '#8257e5';
    ctx.font = `600 ${Math.round(w * 0.032)}px system-ui, sans-serif`;
    ctx.fillText(`Prefixo ${data.prefixo}`, cardX + 40, cardY + 200);
  }

  const phone = formatPhoneDisplay(data.phone);
  if (phone) {
    ctx.fillStyle = '#374151';
    ctx.font = `600 ${Math.round(w * 0.038)}px system-ui, sans-serif`;
    ctx.fillText(`📱 ${phone}`, cardX + 40, cardY + 252);
  }

  let ty = cardY + 310;
  if (data.schools) {
    ctx.font = `600 ${Math.round(w * 0.026)}px system-ui, sans-serif`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Escolas', cardX + 40, ty);
    ty += 36;
    ctx.font = `${Math.round(w * 0.028)}px system-ui, sans-serif`;
    ctx.fillStyle = '#6b7280';
    ty = wrapText(ctx, data.schools, cardX + 40, ty, cardW - 120, 38);
    ty += 12;
  }

  if (data.neighborhoods) {
    ctx.font = `600 ${Math.round(w * 0.026)}px system-ui, sans-serif`;
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Bairros', cardX + 40, ty);
    ty += 36;
    ctx.font = `${Math.round(w * 0.028)}px system-ui, sans-serif`;
    wrapText(ctx, data.neighborhoods, cardX + 40, ty, cardW - 120, 38);
  }

  const profileUrl = profilePublicUrl(data.profileId);
  const qrSize = Math.round(w * 0.22);
  const qrX = cardX + cardW - qrSize - 36;
  const qrY = cardY + cardH - qrSize - 36;

  try {
    const qr = await loadImage(
      `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(profileUrl)}`,
    );
    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
  } catch {
    /* QR opcional */
  }

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  const footH = Math.round(h * 0.14);
  ctx.fillRect(0, h - footH, w, footH);

  ctx.fillStyle = '#8257e5';
  ctx.font = `bold ${Math.round(w * 0.04)}px system-ui, sans-serif`;
  ctx.fillText('Alô Tio', pad, h - footH + 50);

  ctx.fillStyle = '#6b7280';
  ctx.font = `${Math.round(w * 0.024)}px system-ui, sans-serif`;
  wrapText(
    ctx,
    data.tagline || 'Cadastrado no Alô Tio — transporte escolar verificado',
    pad,
    h - footH + 90,
    w - pad * 2,
    32,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar PNG'))),
      'image/png',
      1,
    );
  });
}

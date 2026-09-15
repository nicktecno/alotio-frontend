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

/**
 * Quebra texto em múltiplas linhas com textBaseline = 'top'.
 * Retorna a coordenada Y final (abaixo da última linha renderizada).
 */
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

function drawSection(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  w: number,
  scale: number = 1,
): number {
  const labelSize = Math.round(w * 0.024 * scale);
  const valueSize = Math.round(w * 0.03 * scale);
  const labelGap = Math.round(w * 0.012 * scale);
  const valueLineH = Math.round(valueSize * 1.35);
  const sectionGap = Math.round(w * 0.032 * scale);

  ctx.font = `bold ${labelSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#6b7280';
  ctx.fillText(label.toUpperCase(), x, y);
  y += labelSize + labelGap;

  ctx.font = `500 ${valueSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#1f2937';
  y = wrapText(ctx, value, x, y, maxWidth, valueLineH);

  return y + sectionGap;
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

  // Gradiente de fundo sofisticado (roxo/verde Alô Tio)
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#5b21b6');
  grad.addColorStop(0.5, '#8257e5');
  grad.addColorStop(1, '#04d361');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Dimensões do cartão branco central
  const pad = Math.round(w * 0.055);
  const footH = Math.round(h * 0.11);
  const cardX = pad;
  const cardY = Math.round(h * 0.045);
  const cardW = w - pad * 2;
  const cardH = h - cardY - footH - Math.round(h * 0.025);

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  const imageSrc = cardImageSrc(data);
  const isCustomImage = Boolean(data.showImage && data.imageUrl);
  const imageH = imageSrc ? Math.round(cardH * 0.35) : 0;

  // Garantir textBaseline top para que o espaçamento seja exato e previsível
  ctx.textBaseline = 'top';

  let y = cardY;

  if (imageSrc) {
    const imgX = cardX;
    const imgY = cardY;
    ctx.save();
    roundRect(ctx, imgX, imgY, cardW, imageH, 28);
    ctx.clip();
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(imgX, imgY, cardW, imageH);
    try {
      const photo = await loadImage(
        imageSrc.startsWith('/') ? `${window.location.origin}${imageSrc}` : imageSrc,
      );
      if (isCustomImage) {
        drawCoverImage(ctx, photo, imgX, imgY, cardW, imageH);
      } else {
        drawContainImage(ctx, photo, imgX, imgY, cardW, imageH, Math.round(w * 0.05));
      }
    } catch {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(imgX, imgY, cardW, imageH);
    }
    ctx.restore();
    y = imgY + imageH + Math.round(w * 0.05);
  } else {
    // Quando não tem imagem: respiro superior generoso dentro do cartão
    y = cardY + Math.round(w * 0.08);
  }

  // Fator de escala vertical para formatos longos (ex.: Story 9:16) sem foto
  const isTall = h / w > 1.35;
  const vScale = isTall && !imageSrc ? 1.25 : 1.0;

  const textPad = Math.round(w * 0.06);
  const textX = cardX + textPad;
  const textMaxW = cardW - textPad * 2;

  // 1. Subtítulo / Categoria
  const subSize = Math.round(w * 0.026 * vScale);
  ctx.fillStyle = '#059669';
  ctx.font = `bold ${subSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('TRANSPORTE ESCOLAR', textX, y);
  y += subSize + Math.round(w * 0.02 * vScale);

  // 2. Nome do Tio / Empresa
  const titleSize = Math.round(w * 0.062 * vScale);
  const titleLineH = Math.round(titleSize * 1.22);
  ctx.fillStyle = '#111827';
  ctx.font = `bold ${titleSize}px system-ui, -apple-system, sans-serif`;
  y = wrapText(ctx, data.displayName || 'Condutor Escolar', textX, y, textMaxW, titleLineH);
  y += Math.round(w * 0.028 * vScale);

  // 3. Prefixo (se houver)
  if (data.prefixo) {
    const prefixSize = Math.round(w * 0.032 * vScale);
    ctx.fillStyle = '#7c3aed';
    ctx.font = `bold ${prefixSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`Prefixo ${data.prefixo}`, textX, y);
    y += prefixSize + Math.round(w * 0.022 * vScale);
  }

  // 4. Telefone / WhatsApp
  const phone = formatPhoneDisplay(data.phone);
  if (phone) {
    const phoneSize = Math.round(w * 0.038 * vScale);
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${phoneSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`📱 ${phone}`, textX, y);
    y += phoneSize + Math.round(w * 0.035 * vScale);
  }

  // Linha divisória suave se houver escolas ou bairros
  if (data.schools || data.neighborhoods) {
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = Math.round(w * 0.003);
    ctx.beginPath();
    ctx.moveTo(textX, y);
    ctx.lineTo(textX + textMaxW, y);
    ctx.stroke();
    y += Math.round(w * 0.032 * vScale);
  }

  // 5. Seção de Escolas
  if (data.schools) {
    y = drawSection(ctx, 'Escolas', data.schools, textX, y, textMaxW, w, vScale);
  }

  // 6. Seção de Bairros
  if (data.neighborhoods) {
    y = drawSection(ctx, 'Bairros', data.neighborhoods, textX, y, textMaxW, w, vScale);
  }

  // Rodapé do Cartão (fora do card branco, no gradiente)
  const footerY = h - footH + Math.round(h * 0.015);
  ctx.textBaseline = 'top';

  const logoSize = Math.round(w * 0.038);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${logoSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Alô Tio', pad, footerY);

  const tagSize = Math.round(w * 0.022);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `500 ${tagSize}px system-ui, -apple-system, sans-serif`;
  wrapText(
    ctx,
    data.tagline || 'Transporte escolar com segurança e confiança',
    pad,
    footerY + logoSize + Math.round(w * 0.015),
    w - pad * 2,
    Math.round(tagSize * 1.35),
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar PNG'))),
      'image/png',
      1,
    );
  });
}

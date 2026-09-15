import type { CardFormat, DigitalCardData } from '@/lib/digital-card';
import { CARD_FORMATS, cardImageSrc, formatPhoneDisplay } from '@/lib/digital-card';

type Props = {
  data: DigitalCardData;
  format?: CardFormat;
  className?: string;
};

const FORMAT_ASPECT: Record<CardFormat, string> = {
  story: 'aspect-[9/16]',
  feed: 'aspect-[4/5]',
  square: 'aspect-square',
};

/** Pré-visualização visual do cartão (escala reduzida). */
export default function DigitalCardPreview({
  data,
  format = 'story',
  className = '',
}: Props) {
  const phone = formatPhoneDisplay(data.phone);
  const imageSrc = cardImageSrc(data);
  const isCustomImage = Boolean(data.showImage && data.imageUrl);
  const formatLabel = CARD_FORMATS.find((f) => f.id === format)?.label ?? 'Stories';

  return (
    <div className={className}>
      <p className="mb-2 text-center text-xs font-semibold text-gray-500">
        Preview — {formatLabel}
      </p>
      <div
        key={`${format}-${data.showImage}-${data.imageUrl ?? 'default'}-${data.schools}-${data.neighborhoods}`}
        className={`relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary to-secondary shadow-xl ${FORMAT_ASPECT[format]}`}
      >
        <div className="absolute inset-0 flex flex-col p-3">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white">
            {imageSrc ? (
              <div className="relative h-[34%] min-h-[72px] shrink-0 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50">
                <img
                  src={imageSrc}
                  alt="Foto da van ou logo"
                  className={`h-full w-full ${
                    isCustomImage ? 'object-cover' : 'object-contain p-2'
                  }`}
                />
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col p-3 space-y-1.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">
                Transporte escolar
              </p>
              <h3 className="font-heading text-base font-bold leading-tight text-gray-900 line-clamp-2">
                {data.displayName || 'Seu nome'}
              </h3>
              {data.prefixo ? (
                <p className="text-[10px] font-semibold text-primary">Prefixo {data.prefixo}</p>
              ) : null}
              {phone ? (
                <p className="text-xs font-semibold text-gray-700">📱 {phone}</p>
              ) : null}

              <div className="mt-1 min-h-0 flex-1 space-y-1.5 overflow-hidden">
                {data.schools ? (
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Escolas</p>
                    <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug">{data.schools}</p>
                  </div>
                ) : null}
                {data.neighborhoods ? (
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Bairros</p>
                    <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug">{data.neighborhoods}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-1.5 shrink-0 px-0.5">
            <p className="font-heading text-xs font-bold text-white">Alô Tio</p>
            <p className="text-[9px] text-white/85 line-clamp-2 leading-snug">
              {data.tagline || 'Transporte escolar legalizado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { CardFormat, DigitalCardData } from '@/lib/digital-card';
import { CARD_FORMATS, cardImageSrc, formatPhoneDisplay } from '@/lib/digital-card';

type Props = {
  data: DigitalCardData;
  format?: CardFormat;
  /** Versão menor para a home (sem imagem, preview reduzido). */
  compact?: boolean;
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
  compact = false,
  className = '',
}: Props) {
  const phone = formatPhoneDisplay(data.phone);
  const previewFormat = compact ? 'feed' : format;
  const imageSrc = compact ? null : cardImageSrc(data);
  const isCustomImage = Boolean(!compact && data.showImage && data.imageUrl);
  const formatLabel = CARD_FORMATS.find((f) => f.id === previewFormat)?.label ?? 'Stories';

  return (
    <div className={className}>
      {!compact ? (
        <p className="mb-2 text-center text-xs font-semibold text-gray-500">
          Preview — {formatLabel}
        </p>
      ) : null}
      <div
        key={`${previewFormat}-${compact}-${data.showImage}-${data.imageUrl ?? 'default'}`}
        className={`relative mx-auto w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary-700 via-primary to-secondary shadow-lg ${
          compact ? 'max-w-[150px] aspect-[4/5]' : `max-w-[280px] shadow-xl rounded-2xl ${FORMAT_ASPECT[previewFormat]}`
        }`}
      >
        <div className={`absolute inset-0 flex flex-col ${compact ? 'p-2' : 'p-3 sm:p-4'}`}>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white">
            {imageSrc ? (
              <div className="relative h-[38%] min-h-[88px] shrink-0 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50">
                <img
                  src={imageSrc}
                  alt="Foto da van ou logo"
                  className={`h-full w-full ${
                    isCustomImage ? 'object-cover' : 'object-contain p-3'
                  }`}
                />
              </div>
            ) : null}

            <div className={`flex min-h-0 flex-1 flex-col ${compact ? 'p-2' : 'p-4'}`}>
              <p
                className={`font-bold uppercase tracking-widest text-secondary ${
                  compact ? 'text-[7px]' : 'text-[10px]'
                }`}
              >
                Transporte escolar
              </p>
              <h3
                className={`font-heading mt-0.5 font-bold leading-tight text-gray-900 line-clamp-2 ${
                  compact ? 'text-[11px]' : 'text-xl'
                }`}
              >
                {data.displayName || 'Seu nome'}
              </h3>
              {data.prefixo ? (
                <p className={`mt-0.5 font-semibold text-primary ${compact ? 'text-[8px]' : 'text-xs'}`}>
                  Prefixo {data.prefixo}
                </p>
              ) : null}
              {phone ? (
                <p className={`mt-0.5 font-semibold text-gray-700 ${compact ? 'text-[8px]' : 'text-sm'}`}>
                  📱 {phone}
                </p>
              ) : null}

              {!compact ? (
                <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-hidden">
                  {data.schools ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Escolas</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{data.schools}</p>
                    </div>
                  ) : null}
                  {data.neighborhoods ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Bairros</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{data.neighborhoods}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className={`shrink-0 ${compact ? 'mt-1 px-0.5' : 'mt-2 px-1'}`}>
            <p className={`font-heading font-bold text-white ${compact ? 'text-[9px]' : 'text-sm'}`}>
              Alô Tio
            </p>
            {!compact ? (
              <p className="text-[10px] text-white/85 line-clamp-2">
                {data.tagline || 'Transporte escolar legalizado'}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

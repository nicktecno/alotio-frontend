import type { DigitalCardData } from '@/lib/digital-card';
import { formatPhoneDisplay, profilePublicUrl } from '@/lib/digital-card';

type Props = {
  data: DigitalCardData;
  className?: string;
};

/** Pré-visualização visual do cartão (escala reduzida). */
export default function DigitalCardPreview({ data, className = '' }: Props) {
  const phone = formatPhoneDisplay(data.phone);
  const profileUrl = profilePublicUrl(data.profileId);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary to-secondary shadow-xl ${className}`}
    >
      <div className="m-4 sm:m-5 rounded-xl bg-white p-5 sm:p-6 min-h-[280px] flex flex-col">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Transporte escolar
        </p>
        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mt-2 leading-tight">
          {data.displayName || 'Seu nome'}
        </h3>
        {data.prefixo ? (
          <p className="mt-2 text-sm font-semibold text-primary">Prefixo {data.prefixo}</p>
        ) : null}
        {phone ? (
          <p className="mt-2 text-base font-semibold text-gray-700">📱 {phone}</p>
        ) : null}
        {data.schools ? (
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase">Escolas</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.schools}</p>
          </div>
        ) : null}
        {data.neighborhoods ? (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase">Bairros</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.neighborhoods}</p>
          </div>
        ) : null}
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <p className="text-[10px] text-gray-400 break-all line-clamp-2">{profileUrl}</p>
          <div className="shrink-0 w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 text-center p-1">
            QR
          </div>
        </div>
      </div>
      <div className="px-5 pb-4 pt-1">
        <p className="font-heading font-bold text-white text-lg">Alô Tio</p>
        <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
          {data.tagline || 'Transporte escolar legalizado'}
        </p>
      </div>
    </div>
  );
}

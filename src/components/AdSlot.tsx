'use client';

import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type AdSlotProps = {
  /** ID do bloco de anúncio criado no painel do AdSense (data-ad-slot). */
  slot?: string;
  format?: string;
  /** Classe aplicada ao wrapper — use para controlar espaçamento/fundo da seção. */
  className?: string;
  /** Rótulo "Publicidade" exigido por boas práticas de transparência. */
  label?: string;
};

export default function AdSlot({
  slot,
  format = 'auto',
  className = '',
  label = 'Publicidade',
}: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushed.current) return;
    pushed.current = true;
    try {
      // O script do AdSense injeta window.adsbygoogle; o push dispara o preenchimento do bloco.
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // Bloqueadores de anúncio podem impedir o carregamento — o slot apenas fica vazio.
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1 text-center">
          {label}
        </span>
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

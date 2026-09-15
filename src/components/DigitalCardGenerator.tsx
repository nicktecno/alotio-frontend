'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DigitalCardPreview from '@/components/DigitalCardPreview';
import { api } from '@/lib/api';
import { digitsOnly, formatBrazilMobileMask } from '@/lib/br-input';
import {
  DEFAULT_CARD_DATA,
  CARD_FORMATS,
  type CardFormat,
  type DigitalCardData,
  buildShareCaption,
  profileFromApi,
  whatsAppUrl,
  profilePublicUrl,
} from '@/lib/digital-card';
import { exportDigitalCardPng } from '@/lib/export-digital-card';
import type { Profile } from '@/types';

type Props = {
  variant?: 'compact' | 'full';
};

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function DigitalCardGenerator({ variant = 'full' }: Props) {
  const [data, setData] = useState<DigitalCardData>(DEFAULT_CARD_DATA);
  const [format, setFormat] = useState<CardFormat>('story');
  const [exporting, setExporting] = useState(false);
  const compact = variant === 'compact';

  useEffect(() => {
    api
      .getMyProfile()
      .then((p) => setData(profileFromApi(p as Profile)))
      .catch(() => {
        /* visitante anônimo */
      });
  }, []);

  const update = (patch: Partial<DigitalCardData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const handleDownload = async () => {
    if (!data.displayName.trim()) {
      toast.error('Informe seu nome');
      return;
    }
    setExporting(true);
    try {
      const blob = await exportDigitalCardPng(data, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slug = data.displayName.replace(/\s+/g, '-').slice(0, 30);
      a.href = url;
      a.download = `cartao-alotio-${slug}-${format}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Cartão baixado!');
    } catch {
      toast.error('Erro ao gerar imagem');
    } finally {
      setExporting(false);
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(buildShareCaption(data));
      toast.success('Texto copiado para colar no WhatsApp ou Instagram');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profilePublicUrl(data.profileId));
      toast.success('Link do perfil copiado');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const openWhatsApp = () => {
    const url = whatsAppUrl(data.phone, buildShareCaption(data));
    if (!url) {
      toast.error('Informe um telefone válido');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-white shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary-600 px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          Ferramenta gratuita
        </p>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mt-1">
          Cartão de visita digital
        </h3>
        <p className="text-sm text-white/90 mt-1">
          Para bio do Instagram, grupos de pais e WhatsApp.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-0">
        <div className="p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <Field label="Nome / apelido">
            <input
              className={inputClass}
              value={data.displayName}
              onChange={(e) => update({ displayName: e.target.value })}
              placeholder="Tio Carlos"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prefixo">
              <input
                className={inputClass}
                value={data.prefixo}
                onChange={(e) => update({ prefixo: e.target.value })}
                placeholder="0881"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                className={inputClass}
                value={formatBrazilMobileMask(data.phone)}
                onChange={(e) => update({ phone: digitsOnly(e.target.value, 11) })}
                placeholder="(21) 99999-9999"
              />
            </Field>
          </div>
          {!compact && (
            <>
              <Field label="Escolas atendidas">
                <input
                  className={inputClass}
                  value={data.schools}
                  onChange={(e) => update({ schools: e.target.value })}
                  placeholder="Colégio X, Escola Y"
                />
              </Field>
              <Field label="Bairros">
                <input
                  className={inputClass}
                  value={data.neighborhoods}
                  onChange={(e) => update({ neighborhoods: e.target.value })}
                  placeholder="Centro, Bairro Z"
                />
              </Field>
              <Field label="Frase de destaque">
                <input
                  className={inputClass}
                  value={data.tagline}
                  onChange={(e) => update({ tagline: e.target.value })}
                  placeholder="Transporte escolar legalizado"
                />
              </Field>
              <Field label="Formato da imagem">
                <div className="flex flex-wrap gap-2">
                  {CARD_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        format === f.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}
          {compact && (
            <p className="text-xs text-gray-500">
              <Link href="/ferramentas/cartao-digital" className="text-primary font-semibold hover:underline">
                Abrir gerador completo
              </Link>
              {' '}
              com escolas, bairros e formatos para Stories.
            </p>
          )}
        </div>

        <div className="p-5 sm:p-6 bg-gray-50 flex flex-col gap-4">
          <DigitalCardPreview data={data} />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              className="col-span-2 bg-secondary hover:bg-secondary-600 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
            >
              {exporting ? 'Gerando PNG…' : 'Baixar cartão (PNG)'}
            </button>
            <button
              type="button"
              onClick={copyCaption}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2.5 px-3 rounded-lg text-sm transition"
            >
              Copiar texto
            </button>
            <button
              type="button"
              onClick={copyProfileLink}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2.5 px-3 rounded-lg text-sm transition"
            >
              Copiar link
            </button>
            <button
              type="button"
              onClick={openWhatsApp}
              className="col-span-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-4 rounded-lg text-sm transition"
            >
              Compartilhar no WhatsApp
            </button>
          </div>
          {!data.profileId && (
            <p className="text-xs text-center text-gray-500">
              <Link href="/cadastro" className="text-primary font-semibold hover:underline">
                Cadastre-se
              </Link>
              {' '}
              para incluir link do seu perfil público e QR code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaWhatsapp, FaCheckCircle, FaCopy, FaRegClock, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { api, assetUrl } from '@/lib/api';
import { formatCentsToBRL } from '@/lib/br-input';
import { RECEIPT_MONTHS_PT } from '@/app/dashboard/meu-transporte/_components/shared';

type PublicTuitionInvoice = Awaited<ReturnType<typeof api.publicTuitionInvoice>>;

const PIX_TYPE_LABELS: Record<string, string> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  PHONE: 'Celular',
  EMAIL: 'E-mail',
  EVP: 'Chave aleatória',
};

export default function PublicTuitionInvoicePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [invoice, setInvoice] = useState<PublicTuitionInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .publicTuitionInvoice(token)
      .then((res) => {
        setInvoice(res);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Fatura não encontrada');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const copyPixCode = async () => {
    if (!invoice?.pixBrCode) return;
    try {
      await navigator.clipboard.writeText(invoice.pixBrCode);
      setCopied(true);
      toast.success('Código PIX Copia e Cola copiado! Abra o app do seu banco e cole no PIX.');
      setTimeout(() => setCopied(false), 4000);
    } catch {
      toast.error('Não foi possível copiar automaticamente. Selecione o código abaixo.');
    }
  };

  const copyRawPixKey = async () => {
    if (!invoice?.transportador.pixKey) return;
    try {
      await navigator.clipboard.writeText(invoice.transportador.pixKey);
      toast.success('Chave PIX copiada!');
    } catch {
      toast.error('Não foi possível copiar a chave.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-gray-600">Carregando fatura de transporte escolar…</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-4 shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Fatura indisponível</p>
          <p className="text-sm text-gray-600">{error || 'Verifique o link enviado pelo transportador.'}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
          >
            Ir para o início da Alô Tio
          </Link>
        </div>
      </div>
    );
  }

  const monthName =
    RECEIPT_MONTHS_PT.find((m) => m.value === invoice.month)?.label ?? String(invoice.month);
  const dueDateFormatted = `${String(invoice.dueDay).padStart(2, '0')}/${String(invoice.month).padStart(2, '0')}/${invoice.year}`;
  const isPaid = invoice.status === 'PAID';
  const tioPhoneDigits = invoice.transportador.phone?.replace(/\D/g, '') || '';
  const avatar = assetUrl(invoice.transportador.avatarUrl);

  const whatsappReceiptMsg = `Olá, ${invoice.transportador.displayName}! Acabei de realizar o pagamento via PIX da mensalidade de ${monthName}/${invoice.year} (${formatCentsToBRL(invoice.amountCents)}) referente ao responsável ${invoice.parentName}. Segue o comprovante!`;

  const qrCodeImageUrl = invoice.pixBrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(invoice.pixBrCode)}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Top brand bar */}
        <div className="flex items-center justify-between text-white px-1">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight">
            Alô Tio
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1 rounded-full font-medium">
            <FaShieldAlt className="text-secondary" />
            Mensalidade Escolar
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header status */}
          <div
            className={`px-6 py-4 flex items-center justify-between ${
              isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {isPaid ? (
                <>
                  <FaCheckCircle className="text-lg" />
                  <span>Mensalidade Paga</span>
                </>
              ) : (
                <>
                  <FaRegClock className="text-lg" />
                  <span>Aguardando Pagamento</span>
                </>
              )}
            </div>
            <span className="text-xs font-medium bg-black/15 px-2.5 py-1 rounded-full">
              Ref.: {monthName}/{invoice.year}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Transportador Info */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
              {avatar ? (
                <img
                  src={avatar}
                  alt={invoice.transportador.displayName}
                  className="h-14 w-14 rounded-full object-cover border-2 border-primary-100 shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-xl shrink-0">
                  {invoice.transportador.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                  Transportador Escolar
                </p>
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {invoice.transportador.displayName}
                </h1>
                {invoice.transportador.legalName && (
                  <p className="text-xs text-gray-500 truncate">
                    Recebedor: {invoice.transportador.legalName}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Prefixo {invoice.transportador.prefixo} · {invoice.transportador.cityName}/
                  {invoice.transportador.stateUf}
                </p>
              </div>
            </div>

            {/* Value & Due Date */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Valor da mensalidade</p>
                <p className="text-2xl font-bold text-primary-900 mt-0.5">
                  {formatCentsToBRL(invoice.amountCents)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Vencimento</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{dueDateFormatted}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200/70 flex items-center justify-between text-xs text-gray-600">
                <span>Responsável:</span>
                <strong className="text-gray-900">{invoice.parentName}</strong>
              </div>
            </div>

            {isPaid ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
                <FaCheckCircle className="text-3xl text-emerald-600 mx-auto" />
                <p className="font-semibold text-emerald-950">
                  Pagamento confirmado pelo transportador!
                </p>
                {invoice.paidAt && (
                  <p className="text-xs text-emerald-700">
                    Baixa registrada em{' '}
                    {new Date(invoice.paidAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ) : invoice.pixBrCode ? (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Pague via PIX direto para o transportador
                  </p>
                  <p className="text-xs text-gray-500">
                    Escaneie o QR Code abaixo ou clique em <strong>Copiar código PIX</strong> para
                    colar no aplicativo do seu banco (PIX Copia e Cola).
                  </p>
                </div>

                {qrCodeImageUrl && (
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-sm">
                      <img
                        src={qrCodeImageUrl}
                        alt="QR Code PIX"
                        width={210}
                        height={210}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={copyPixCode}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition ${
                    copied
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <FaCopy />
                  {copied ? 'Código PIX Copiado!' : 'Copiar código PIX (Copia e Cola)'}
                </button>

                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Código PIX Copia e Cola
                    </span>
                    {invoice.transportador.pixKey && (
                      <button
                        type="button"
                        onClick={copyRawPixKey}
                        className="text-xs font-medium text-primary-700 hover:underline"
                      >
                        Copiar só a chave (
                        {PIX_TYPE_LABELS[invoice.transportador.pixKeyType || ''] || 'PIX'})
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-mono break-all text-gray-600 select-all leading-relaxed">
                    {invoice.pixBrCode}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center space-y-2">
                <p className="text-sm font-medium text-amber-900">
                  O transportador ainda não cadastrou a chave PIX na plataforma.
                </p>
                <p className="text-xs text-amber-800">
                  Entre em contato diretamente pelo WhatsApp abaixo para solicitar os dados de
                  pagamento.
                </p>
              </div>
            )}

            {/* Botão enviar comprovante */}
            {tioPhoneDigits && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <a
                  href={`https://wa.me/55${tioPhoneDigits}?text=${encodeURIComponent(whatsappReceiptMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm flex items-center justify-center gap-2 transition"
                >
                  <FaWhatsapp className="text-lg" />
                  Enviar comprovante no WhatsApp do Tio
                </a>
                <p className="text-[11px] text-center text-gray-400">
                  Ao pagar, envie o comprovante do seu banco para o transportador emitir o seu
                  recibo.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Gerado via{' '}
          <Link href="/" className="font-semibold text-primary-700 hover:underline">
            Alô Tio
          </Link>{' '}
          — o pagamento PIX é feito diretamente para a conta do transportador escolar.
        </p>
      </div>
    </div>
  );
}

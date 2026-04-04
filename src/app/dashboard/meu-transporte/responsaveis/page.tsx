'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import Loading from '@/components/Loading';
import { api } from '@/lib/api';
import { useMyProfile, useStates, useCities, useNeighborhoods } from '@/lib/swr';
import toast from 'react-hot-toast';
import {
  digitsOnly,
  formatBrazilMobileMask,
  formatCpfMask,
  isValidCpfDigits,
  sanitizeRg,
} from '@/lib/br-input';
import { DeleteConfirmModal } from '../_components/delete-confirm-modal';
import { Field } from '../_components/field';
import { MeuTransporteNoProfile } from '../_components/no-profile';
import {
  RECEIPT_MONTHS_PT,
  type ServedParentRow,
  receiptYearOptions,
} from '../_components/shared';

export default function MeuTransporteResponsaveisPage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const [parents, setParents] = useState<ServedParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [receiptSendingId, setReceiptSendingId] = useState<string | null>(null);
  const [receiptDownloadingId, setReceiptDownloadingId] = useState<string | null>(null);
  const [receiptPeriodByParent, setReceiptPeriodByParent] = useState<
    Record<string, { month: number; year: number }>
  >({});

  const [deleteParentId, setDeleteParentId] = useState<string | null>(null);
  const [deleteParentName, setDeleteParentName] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    cpf: '',
    rg: '',
    whatsappPhone: '',
    stateId: '',
    cityId: '',
    neighborhoodId: '',
    street: '',
    streetNumber: '',
  });

  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities(form.stateId || undefined);
  const { data: neighborhoods = [] } = useNeighborhoods(form.cityId || undefined);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const p = (await api.servedParentsList()) as ServedParentRow[];
      setParents(Array.isArray(p) ? p : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) load();
    else if (!profileLoading) setLoading(false);
  }, [profile, profileLoading, load]);

  const submitParent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfDigits = digitsOnly(form.cpf, 11);
    if (!isValidCpfDigits(cpfDigits)) {
      toast.error('CPF inválido. Confira os números.');
      return;
    }
    const phoneDigits = digitsOnly(form.whatsappPhone, 11);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      toast.error('WhatsApp: use DDD + número (10 ou 11 dígitos).');
      return;
    }
    try {
      await api.servedParentsCreate({
        ...form,
        cpf: cpfDigits,
        whatsappPhone: phoneDigits,
      });
      toast.success('Responsável cadastrado');
      setForm({
        fullName: '',
        cpf: '',
        rg: '',
        whatsappPhone: '',
        stateId: '',
        cityId: '',
        neighborhoodId: '',
        street: '',
        streetNumber: '',
      });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const genInvite = async () => {
    try {
      const r = await api.servedParentsInvite();
      setInviteUrl(r.url);
      await navigator.clipboard.writeText(r.url);
      toast.success('Link copiado! Cole no WhatsApp do responsável.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const copyInviteAgain = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Link copiado de novo.');
    } catch {
      toast.error('Não foi possível copiar. Selecione o link abaixo.');
    }
  };

  const getReceiptPeriod = (parentId: string): { month: number; year: number } => {
    const d = new Date();
    const fallback = { month: d.getMonth() + 1, year: d.getFullYear() };
    return receiptPeriodByParent[parentId] ?? fallback;
  };

  const setReceiptPeriod = (parentId: string, month: number, year: number) => {
    setReceiptPeriodByParent((prev) => ({ ...prev, [parentId]: { month, year } }));
  };

  const monthYearLabel = (month: number, year: number) => {
    const label = RECEIPT_MONTHS_PT.find((m) => m.value === month)?.label ?? String(month);
    return `${label} de ${year}`;
  };

  const downloadReceipt = async (parentId: string) => {
    const { month, year } = getReceiptPeriod(parentId);
    const fileBase = `Recibo-transporte-${year}-${String(month).padStart(2, '0')}`;
    setReceiptDownloadingId(parentId);
    try {
      const blob = await api.servedParentsReceiptPdf(parentId, month, year);
      const dl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dl;
      a.download = `${fileBase}.pdf`;
      a.click();
      URL.revokeObjectURL(dl);
      toast.success(`Recibo de ${monthYearLabel(month, year)} baixado.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao baixar recibo');
    } finally {
      setReceiptDownloadingId(null);
    }
  };

  const sendReceiptWhatsApp = async (parentId: string) => {
    const { month, year } = getReceiptPeriod(parentId);
    const monthYear = monthYearLabel(month, year);

    const parent = parents.find((p) => p.id === parentId);
    const phone = parent?.whatsappPhone?.replace(/\D/g, '') || '';
    const firstName = parent?.fullName?.split(/\s+/)[0] ?? '';

    const bodyText = firstName
      ? `Olá, ${firstName}! Segue o recibo de transporte escolar referente a ${monthYear}. Qualquer dúvida, estou à disposição.`
      : `Olá! Segue o recibo de transporte escolar referente a ${monthYear}. Qualquer dúvida, estou à disposição.`;

    const fileBase = `Recibo-transporte-${year}-${String(month).padStart(2, '0')}`;

    setReceiptSendingId(parentId);
    try {
      const blob = await api.servedParentsReceiptPdf(parentId, month, year);
      const file = new File([blob], `${fileBase}.pdf`, {
        type: 'application/pdf',
      });

      const shareData: ShareData = {
        files: [file],
        title: 'Recibo de transporte escolar',
        text: bodyText,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          toast.success('Escolha o WhatsApp e envie — o PDF vai como anexo.');
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }

      if (!phone) {
        toast.error(
          'Inclua o WhatsApp deste responsável no cadastro para abrir a conversa. No celular, o envio com anexo funciona direto pelo botão Compartilhar.',
        );
        return;
      }

      const dl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dl;
      a.download = `${fileBase}.pdf`;
      a.click();
      URL.revokeObjectURL(dl);

      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(bodyText)}`, '_blank', 'noopener,noreferrer');
      toast.success(
        'PDF salvo na pasta de downloads. No WhatsApp que abriu, use o clipe (📎) e anexe esse arquivo à mensagem.',
        { duration: 8000 },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar recibo');
    } finally {
      setReceiptSendingId(null);
    }
  };

  const executeDeleteParent = async () => {
    if (!deleteParentId) return;
    const id = deleteParentId;
    setDeleteSubmitting(true);
    try {
      await api.servedParentsDelete(id);
      toast.success('Responsável removido.');
      setReceiptPeriodByParent((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setDeleteParentId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (profileLoading) {
    return <Loading />;
  }

  if (!profile) {
    return <MeuTransporteNoProfile />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-primary-800">Responsáveis e recibos</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Cadastre pais ou responsáveis por link ou manualmente e gere recibos em PDF por mês — por responsável.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-medium text-gray-900">Convite por link (o responsável preenche no celular)</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Use quando quiser que o <strong>pai ou responsável</strong> cadastre os próprios dados, sem você digitar tudo
          aqui. Ao gerar o link, ele é <strong>copiado automaticamente</strong> — abra o WhatsApp, escolha o contato e
          <strong> cole na conversa</strong>. Quem receber abre o link, vê seu nome como transportador e completa o
          formulário.
        </p>
        <button
          type="button"
          onClick={genInvite}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
        >
          Gerar link e copiar para o WhatsApp
        </button>
        {inviteUrl && (
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
            <p className="text-xs font-medium text-gray-700">Último link gerado (copie de novo se precisar):</p>
            <p className="text-sm break-all text-gray-800 font-mono">{inviteUrl}</p>
            <button
              type="button"
              onClick={copyInviteAgain}
              className="text-sm text-primary-700 font-medium underline"
            >
              Copiar link novamente
            </button>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-medium text-gray-900">Cadastro manual (você digita os dados)</h2>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            Use quando o responsável <strong>não vai usar o link</strong> — por exemplo atendimento presencial ou telefone.
            Os dados ficam iguais aos do cadastro por convite; só muda quem digitou.
          </p>
        </div>
        <form onSubmit={submitParent} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Nome completo do responsável">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Como no documento"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              autoComplete="name"
            />
          </Field>
          <Field label="CPF" hint="Apenas números válidos (11 dígitos).">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={formatCpfMask(form.cpf)}
              onChange={(e) => setForm({ ...form, cpf: digitsOnly(e.target.value, 11) })}
              required
            />
          </Field>
          <Field label="RG (opcional)" hint="Letras e números, conforme o documento.">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Ex.: 12.345.678-9"
              value={form.rg}
              onChange={(e) => setForm({ ...form, rg: sanitizeRg(e.target.value) })}
            />
          </Field>
          <Field label="WhatsApp" hint="DDD + celular. Só números; máscara ajuda a conferir.">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              placeholder="(11) 98765-4321"
              inputMode="numeric"
              value={formatBrazilMobileMask(form.whatsappPhone)}
              onChange={(e) => setForm({ ...form, whatsappPhone: digitsOnly(e.target.value, 11) })}
              required
            />
          </Field>
          <Field label="Estado">
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.stateId}
              onChange={(e) => setForm({ ...form, stateId: e.target.value, cityId: '', neighborhoodId: '' })}
              required
            >
              <option value="">Selecione</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cidade">
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.cityId}
              onChange={(e) => setForm({ ...form, cityId: e.target.value, neighborhoodId: '' })}
              required
              disabled={!form.stateId}
            >
              <option value="">Selecione</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bairro" className="sm:col-span-2">
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.neighborhoodId}
              onChange={(e) => setForm({ ...form, neighborhoodId: e.target.value })}
              required
              disabled={!form.cityId}
            >
              <option value="">Selecione</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Logradouro" className="sm:col-span-2">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Rua, avenida…"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              required
            />
          </Field>
          <Field label="Número">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Nº"
              value={form.streetNumber}
              onChange={(e) => setForm({ ...form, streetNumber: e.target.value })}
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
              Salvar cadastro manual
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-2">Responsáveis cadastrados</h2>
        <p className="text-sm text-gray-600 mb-4">
          Escolha o <strong>mês de referência</strong> do recibo. <strong>Baixar PDF</strong> salva só o arquivo;{' '}
          <strong>WhatsApp</strong> gera o mesmo PDF e abre o compartilhamento — no celular o arquivo costuma ir{' '}
          <strong>anexado</strong>. No computador pode ser preciso anexar manualmente após o download.
        </p>
        <ul className="divide-y divide-gray-100">
          {parents.map((p) => {
            const period = getReceiptPeriod(p.id);
            return (
              <li key={p.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{p.fullName}</div>
                  <div className="text-xs text-gray-500">
                    {p.neighborhood.name}, {p.city.name}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`receipt-month-${p.id}`}>
                      Mês do recibo
                    </label>
                    <select
                      id={`receipt-month-${p.id}`}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white min-w-[9rem]"
                      value={period.month}
                      onChange={(e) =>
                        setReceiptPeriod(p.id, Number(e.target.value), period.year)
                      }
                    >
                      {RECEIPT_MONTHS_PT.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor={`receipt-year-${p.id}`}>
                      Ano do recibo
                    </label>
                    <select
                      id={`receipt-year-${p.id}`}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                      value={period.year}
                      onChange={(e) =>
                        setReceiptPeriod(p.id, period.month, Number(e.target.value))
                      }
                    >
                      {receiptYearOptions().map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={receiptDownloadingId === p.id || receiptSendingId === p.id}
                      onClick={() => downloadReceipt(p.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {receiptDownloadingId === p.id ? 'Baixando…' : 'Baixar PDF'}
                    </button>
                    <button
                      type="button"
                      disabled={receiptSendingId === p.id || receiptDownloadingId === p.id}
                      onClick={() => sendReceiptWhatsApp(p.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#20bd5a] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <FaWhatsapp className="text-lg shrink-0" aria-hidden />
                      {receiptSendingId === p.id ? 'Gerando…' : 'Enviar pelo WhatsApp'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteParentId(p.id);
                        setDeleteParentName(p.fullName);
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
                    >
                      Excluir responsável
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {parents.length === 0 && <li className="text-gray-500 text-sm">Nenhum responsável cadastrado ainda.</li>}
        </ul>
      </section>

      <DeleteConfirmModal
        open={!!deleteParentId}
        title="Excluir responsável?"
        description={
          <>
            O cadastro de <strong>{deleteParentName}</strong> será removido para sempre. Os contratos de transporte
            vinculados a essa pessoa também serão apagados. Esta ação não pode ser desfeita.
          </>
        }
        onCancel={() => setDeleteParentId(null)}
        onConfirm={() => void executeDeleteParent()}
        submitting={deleteSubmitting}
      />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  FaWhatsapp,
  FaCheckCircle,
  FaCopy,
  FaFilePdf,
  FaPlus,
  FaExternalLinkAlt,
  FaUndo,
  FaTrash,
} from 'react-icons/fa';
import Loading from '@/components/Loading';
import { api } from '@/lib/api';
import { useMyProfile, useMySubscription } from '@/lib/swr';
import toast from 'react-hot-toast';
import { formatCentsToBRL, parseMoneyDigitsToCents } from '@/lib/br-input';
import { Field } from '../_components/field';
import { MeuTransportePremiumGate } from '../_components/premium-gate';
import {
  RECEIPT_MONTHS_PT,
  type ServedParentRow,
  type TuitionRow,
  receiptYearOptions,
} from '../_components/shared';

export default function MeuTransporteMensalidadesPage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: subData, isLoading: loadingSub } = useMySubscription();
  const isPremium = subData?.isPremium ?? false;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [tuitions, setTuitions] = useState<TuitionRow[]>([]);
  const [parents, setParents] = useState<ServedParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [manualForm, setManualForm] = useState({
    servedParentId: '',
    amountDigits: '25000',
    dueDay: 10,
  });
  const [showManualForm, setShowManualForm] = useState(false);

  const load = useCallback(async () => {
    if (!profile || !isPremium) return;
    setLoading(true);
    try {
      const [tList, pList] = await Promise.all([
        api.tuitionsList(month, year) as Promise<TuitionRow[]>,
        api.servedParentsList() as Promise<ServedParentRow[]>,
      ]);
      setTuitions(Array.isArray(tList) ? tList : []);
      setParents(Array.isArray(pList) ? pList : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar mensalidades');
    } finally {
      setLoading(false);
    }
  }, [profile, isPremium, month, year]);

  useEffect(() => {
    if (loadingSub) return;
    if (!profile) {
      if (!profileLoading) setLoading(false);
      return;
    }
    if (!isPremium) {
      setLoading(false);
      return;
    }
    void load();
  }, [profile, profileLoading, isPremium, loadingSub, load]);

  const monthName =
    RECEIPT_MONTHS_PT.find((m) => m.value === month)?.label ?? String(month);

  const isOverdue = (t: TuitionRow) => {
    if (t.status === 'PAID') return false;
    const today = new Date();
    const curY = today.getFullYear();
    const curM = today.getMonth() + 1;
    const curD = today.getDate();
    if (t.year < curY) return true;
    if (t.year === curY && t.month < curM) return true;
    if (t.year === curY && t.month === curM && t.dueDay < curD) return true;
    return false;
  };

  const isDueSoon = (t: TuitionRow) => {
    if (t.status === 'PAID' || isOverdue(t)) return false;
    const today = new Date();
    if (t.year === today.getFullYear() && t.month === today.getMonth() + 1) {
      const diff = t.dueDay - today.getDate();
      return diff >= 0 && diff <= 3;
    }
    return false;
  };

  const totalExpectedCents = tuitions.reduce((acc, t) => acc + t.amountCents, 0);
  const totalPaidCents = tuitions
    .filter((t) => t.status === 'PAID')
    .reduce((acc, t) => acc + t.amountCents, 0);
  const totalPendingCents = totalExpectedCents - totalPaidCents;
  const overdueCount = tuitions.filter((t) => isOverdue(t)).length;

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.servedParentId) {
      toast.error('Selecione o responsável.');
      return;
    }
    const amountCents = parseMoneyDigitsToCents(manualForm.amountDigits);
    if (amountCents < 100) {
      toast.error('Informe um valor válido.');
      return;
    }
    if (manualForm.dueDay < 1 || manualForm.dueDay > 31) {
      toast.error('O dia de vencimento deve ser entre 1 e 31.');
      return;
    }
    try {
      await api.tuitionsUpsert({
        servedParentId: manualForm.servedParentId,
        month,
        year,
        amountCents,
        dueDay: manualForm.dueDay,
      });
      toast.success('Mensalidade salva!');
      setShowManualForm(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar mensalidade');
    }
  };

  const sendWhatsAppReminder = async (t: TuitionRow) => {
    const phone = t.servedParent?.whatsappPhone?.replace(/\D/g, '') || '';
    if (!phone) {
      toast.error('Este responsável não possui WhatsApp cadastrado.');
      return;
    }
    const firstName = t.servedParent.fullName.split(/\s+/)[0] || '';
    const dueStr = `${String(t.dueDay).padStart(2, '0')}/${String(t.month).padStart(2, '0')}/${t.year}`;
    const valueStr = formatCentsToBRL(t.amountCents);
    const overdue = isOverdue(t);

    const msg = overdue
      ? `Olá, ${firstName}! Tudo bem? Passando para lembrar da mensalidade do transporte escolar referente a *${monthName}/${t.year}* (vencimento em ${dueStr}), no valor de *${valueStr}*.\n\nPara facilitar, acesse o link abaixo para copiar o código *PIX Copia e Cola* ou escanear o QR Code:\n${t.invoiceUrl}\n\nCaso já tenha efetuado o pagamento, por favor desconsidere ou me envie o comprovante por aqui. Obrigado!`
      : `Olá, ${firstName}! Tudo bem? Segue o link da mensalidade do transporte escolar referente a *${monthName}/${t.year}*, com vencimento em *${dueStr}* e valor de *${valueStr}*.\n\nVocê pode pagar facilmente via *PIX Copia e Cola* ou QR Code abrindo a fatura abaixo:\n${t.invoiceUrl}\n\nQualquer dúvida, estou à disposição!`;

    window.open(
      `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer',
    );

    try {
      await api.tuitionsMarkReminderSent(t.id);
      setTuitions((prev) =>
        prev.map((item) =>
          item.id === t.id ? { ...item, reminderSentAt: new Date().toISOString() } : item,
        ),
      );
    } catch {
      /* silencioso */
    }
  };

  const copyInvoiceLink = async (t: TuitionRow) => {
    try {
      await navigator.clipboard.writeText(t.invoiceUrl);
      toast.success('Link da fatura PIX copiado!');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const togglePaid = async (t: TuitionRow, paid: boolean) => {
    setBusyId(t.id);
    try {
      await api.tuitionsSetPaid(t.id, paid);
      toast.success(
        paid
          ? 'Pagamento confirmado! Agora você já pode enviar o recibo em PDF.'
          : 'Mensalidade reaberta como pendente.',
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setBusyId(null);
    }
  };

  const sendReceiptPdf = async (t: TuitionRow) => {
    setBusyId(t.id);
    const phone = t.servedParent?.whatsappPhone?.replace(/\D/g, '') || '';
    const firstName = t.servedParent?.fullName?.split(/\s+/)[0] ?? '';
    const monthYear = `${monthName} de ${t.year}`;
    const bodyText = `Olá, ${firstName}! Confirmamos o recebimento da mensalidade de ${monthYear} (${formatCentsToBRL(t.amountCents)}). Segue em anexo o seu recibo de transporte escolar. Muito obrigado!`;
    const fileBase = `Recibo-transporte-${t.year}-${String(t.month).padStart(2, '0')}`;

    try {
      const blob = await api.servedParentsReceiptPdf(t.servedParentId, t.month, t.year);
      const file = new File([blob], `${fileBase}.pdf`, { type: 'application/pdf' });
      const shareData: ShareData = {
        files: [file],
        title: 'Recibo de transporte escolar',
        text: bodyText,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          toast.success('Escolha o WhatsApp para enviar o recibo em PDF.');
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }

      const dl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dl;
      a.download = `${fileBase}.pdf`;
      a.click();
      URL.revokeObjectURL(dl);

      if (phone) {
        window.open(
          `https://wa.me/55${phone}?text=${encodeURIComponent(bodyText)}`,
          '_blank',
          'noopener,noreferrer',
        );
        toast.success(
          'Recibo PDF baixado! No WhatsApp que abriu, anexe o PDF salvo na sua pasta de downloads.',
          { duration: 7000 },
        );
      } else {
        toast.success('Recibo PDF baixado com sucesso!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar recibo');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteTuition = async (t: TuitionRow) => {
    if (!window.confirm(`Remover a cobrança de ${t.servedParent.fullName} em ${monthName}/${year}?`)) {
      return;
    }
    setBusyId(t.id);
    try {
      await api.tuitionsDelete(t.id);
      toast.success('Cobrança removida.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover');
    } finally {
      setBusyId(null);
    }
  };

  const hasPixConfigured = Boolean(profile?.pixKey);

  return (
    <MeuTransportePremiumGate title="Mensalidades e Cobrança PIX">
      {profileLoading || loadingSub || loading ? (
        <Loading />
      ) : (
        <div className="max-w-5xl space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-primary-800">
                Mensalidades e Cobrança PIX
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Suas parcelas de contratos vigentes aparecem aqui automaticamente. Envie o lembrete
                com <strong>PIX Copia e Cola</strong> pelo WhatsApp em 1 clique e dê baixa quando
                receber.
              </p>
            </div>

            {/* Filtro Mês/Ano */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm shrink-0">
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 bg-white"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                aria-label="Mês"
              >
                {RECEIPT_MONTHS_PT.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 bg-white"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Ano"
              >
                {receiptYearOptions().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Alerta se não configurou chave PIX */}
          {!hasPixConfigured ? (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-950">
                  ⚠️ Você ainda não cadastrou sua Chave PIX
                </p>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Cadastre sua chave PIX (CPF, CNPJ, Celular, E-mail ou Aleatória) para que a página
                  da fatura gere automaticamente o <strong>QR Code</strong> e o{' '}
                  <strong>PIX Copia e Cola</strong> no valor de cada mensalidade.
                </p>
              </div>
              <Link
                href="/dashboard/meu-transporte/dados"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shrink-0"
              >
                Cadastrar Chave PIX →
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
              <span>
                ✅ <strong>PIX ativo ({profile?.pixKeyType}):</strong>{' '}
                <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  {profile?.pixKey}
                </code>{' '}
                — Os pagamentos caem 100% direto na sua conta bancária.
              </span>
              <Link
                href="/dashboard/meu-transporte/dados"
                className="font-semibold text-emerald-800 underline hover:text-emerald-950"
              >
                Alterar chave PIX
              </Link>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">Total previsto ({monthName})</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCentsToBRL(totalExpectedCents)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {tuitions.length} {tuitions.length === 1 ? 'responsável' : 'responsáveis'}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-emerald-800">Total recebido</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {formatCentsToBRL(totalPaidCents)}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">
                {tuitions.filter((t) => t.status === 'PAID').length} pagos
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-800">Falta receber</p>
              <p className="text-xl font-bold text-amber-700 mt-1">
                {formatCentsToBRL(totalPendingCents)}
              </p>
              <p className="text-[11px] text-amber-700/80 mt-0.5">
                {tuitions.filter((t) => t.status === 'PENDING').length} pendentes
              </p>
            </div>
            <div className="rounded-xl bg-red-50/60 border border-red-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-red-800">Em atraso</p>
              <p className="text-xl font-bold text-red-700 mt-1">{overdueCount}</p>
              <p className="text-[11px] text-red-700/80 mt-0.5">vencidos neste período</p>
            </div>
          </div>

          {/* Ações e lançamento avulso */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-medium text-gray-900">
                  Mensalidades de {monthName} de {year}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Contratos ativos geram a mensalidade do mês automaticamente. Para responsáveis sem
                  contrato, adicione uma cobrança avulsa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualForm((v) => !v)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-95"
              >
                <FaPlus />
                {showManualForm ? 'Fechar formulário' : 'Lançar / editar mensalidade'}
              </button>
            </div>

            {showManualForm && (
              <form
                onSubmit={handleSaveManual}
                className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-sm"
              >
                <Field label="Responsável" className="sm:col-span-2">
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    value={manualForm.servedParentId}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, servedParentId: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione um responsável cadastrado</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.neighborhood.name})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Valor da parcela">
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
                    inputMode="numeric"
                    value={formatCentsToBRL(parseMoneyDigitsToCents(manualForm.amountDigits))}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        amountDigits: e.target.value.replace(/\D/g, '').slice(0, 10),
                      })
                    }
                  />
                </Field>
                <Field label="Dia de vencimento">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={manualForm.dueDay}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, dueDay: Number(e.target.value) })
                    }
                  />
                </Field>
                <div className="sm:col-span-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-medium text-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
                  >
                    Salvar em {monthName}/{year}
                  </button>
                </div>
              </form>
            )}

            {/* Lista de mensalidades */}
            {tuitions.length === 0 ? (
              <div className="rounded-xl bg-gray-50 border border-dashed border-gray-300 p-8 text-center space-y-3">
                <p className="text-sm font-medium text-gray-800">
                  Nenhuma mensalidade lançada para {monthName} de {year}.
                </p>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Crie um contrato em{' '}
                  <Link
                    href="/dashboard/meu-transporte/contratos"
                    className="text-primary-700 font-semibold underline"
                  >
                    Contratos
                  </Link>{' '}
                  para gerar as parcelas de todos os meses automaticamente, ou clique em{' '}
                  <strong>Lançar / editar mensalidade</strong> acima.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tuitions.map((t) => {
                  const paid = t.status === 'PAID';
                  const overdue = isOverdue(t);
                  const dueSoon = isDueSoon(t);
                  const isBusy = busyId === t.id;

                  return (
                    <li
                      key={t.id}
                      className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {t.servedParent.fullName}
                          </span>
                          {paid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              <FaCheckCircle /> Pago
                            </span>
                          ) : overdue ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                              Vencido (dia {String(t.dueDay).padStart(2, '0')})
                            </span>
                          ) : dueSoon ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              Vence em breve (dia {String(t.dueDay).padStart(2, '0')})
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                              Vence dia {String(t.dueDay).padStart(2, '0')}/
                              {String(t.month).padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600">
                          Valor:{' '}
                          <strong className="text-gray-900 font-semibold">
                            {formatCentsToBRL(t.amountCents)}
                          </strong>{' '}
                          · {t.servedParent.neighborhood?.name}, {t.servedParent.city?.name}
                        </p>

                        {t.reminderSentAt && !paid && (
                          <p className="text-[11px] text-emerald-700">
                            ✓ Lembrete enviado no WhatsApp em{' '}
                            {new Date(t.reminderSentAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                        {t.paidAt && paid && (
                          <p className="text-[11px] text-emerald-700">
                            ✓ Recebido em{' '}
                            {new Date(t.paidAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {!paid && (
                          <>
                            <button
                              type="button"
                              onClick={() => sendWhatsAppReminder(t)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                            >
                              <FaWhatsapp className="text-sm" />
                              Cobrar c/ PIX no WhatsApp
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => togglePaid(t, true)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50"
                            >
                              <FaCheckCircle />
                              Dar baixa (Pago)
                            </button>
                          </>
                        )}

                        {paid && (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => sendReceiptPdf(t)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-95 shadow-sm disabled:opacity-50"
                            >
                              <FaFilePdf />
                              Enviar Recibo PDF
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => togglePaid(t, false)}
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium disabled:opacity-50"
                              title="Desfazer baixa"
                            >
                              <FaUndo />
                              Reabrir
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => copyInvoiceLink(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium"
                          title="Copiar link da fatura PIX"
                        >
                          <FaCopy />
                          Link PIX
                        </button>

                        <Link
                          href={`/fatura/${t.publicToken}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                          title="Visualizar fatura como o pai vê"
                        >
                          <FaExternalLinkAlt />
                        </Link>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteTuition(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs"
                          title="Excluir lançamento deste mês"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </MeuTransportePremiumGate>
  );
}

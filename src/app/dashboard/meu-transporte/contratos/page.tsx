'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { api } from '@/lib/api';
import { useMyProfile, useMySubscription } from '@/lib/swr';
import toast from 'react-hot-toast';
import {
  digitsOnly,
  formatCentsToBRL,
  parseMoneyDigitsToCents,
} from '@/lib/br-input';
import { DeleteConfirmModal } from '../_components/delete-confirm-modal';
import { Field } from '../_components/field';
import { MeuTransportePremiumGate } from '../_components/premium-gate';
import {
  CONTRACT_STATUS_PT,
  type ContractRow,
  type ServedParentRow,
  formatAcceptedAt,
} from '../_components/shared';

export default function MeuTransporteContratosPage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: subData, isLoading: loadingSub } = useMySubscription();
  const isPremium = subData?.isPremium ?? false;
  const [parents, setParents] = useState<ServedParentRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [cContract, setCContract] = useState({
    servedParentId: '',
    installmentCount: 12,
    installmentValueDigits: '18000',
    paymentDueDay: 30,
    contractStartDate: '',
    contractEndDate: '',
    serviceAreaLabel: '',
    totalContractValueDigits: '' as string,
  });

  const [deleteContractId, setDeleteContractId] = useState<string | null>(null);
  const [deleteContractParentLabel, setDeleteContractParentLabel] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!profile || !isPremium) return;
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.servedParentsList() as Promise<ServedParentRow[]>,
        api.contractsList() as Promise<ContractRow[]>,
      ]);
      setParents(Array.isArray(p) ? p : []);
      setContracts(Array.isArray(c) ? c : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [profile, isPremium]);

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

  const createContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cContract.servedParentId || !cContract.contractStartDate || !cContract.contractEndDate) {
      toast.error('Escolha o responsável e as duas datas de vigência.');
      return;
    }
    const parcelaCents = parseMoneyDigitsToCents(cContract.installmentValueDigits);
    if (parcelaCents <= 0) {
      toast.error('Informe o valor de cada parcela (maior que zero).');
      return;
    }
    const due = cContract.paymentDueDay;
    if (due < 1 || due > 31) {
      toast.error('Dia de vencimento deve ser entre 1 e 31.');
      return;
    }
    try {
      const body: Record<string, unknown> = {
        servedParentId: cContract.servedParentId,
        installmentCount: cContract.installmentCount,
        installmentValueCents: parcelaCents,
        paymentDueDay: due,
        contractStartDate: new Date(cContract.contractStartDate + 'T12:00:00Z').toISOString(),
        contractEndDate: new Date(cContract.contractEndDate + 'T12:00:00Z').toISOString(),
      };
      if (cContract.serviceAreaLabel.trim()) body.serviceAreaLabel = cContract.serviceAreaLabel.trim();
      const totalDigits = cContract.totalContractValueDigits.replace(/\D/g, '');
      if (totalDigits) {
        const t = parseMoneyDigitsToCents(totalDigits);
        if (t > 0) body.totalContractValueCents = t;
      }
      await api.contractsCreate(body);
      toast.success('Contrato criado');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const signAndLink = async (c: ContractRow) => {
    try {
      if (c.status === 'COMPLETED') {
        toast('Este contrato já foi aceito pelo responsável.');
        return;
      }
      if (c.status === 'DRAFT') {
        await api.contractsSignTio(c.id);
      }
      const link = await api.contractsParentLink(c.id);
      await navigator.clipboard.writeText(link.url);
      toast.success(
        c.status === 'DRAFT'
          ? 'Você assinou — link copiado para enviar ao pai'
          : 'Link copiado de novo (o anterior pode ter expirado; use este).',
      );
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const parentName = (id: string) => parents.find((p) => p.id === id)?.fullName ?? id.slice(0, 8);

  const executeDeleteContract = async () => {
    if (!deleteContractId) return;
    const id = deleteContractId;
    setDeleteSubmitting(true);
    try {
      await api.contractsDelete(id);
      toast.success('Contrato excluído.');
      setDeleteContractId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <MeuTransportePremiumGate title="Contratos de transporte escolar">
    {profileLoading || loadingSub || loading ? (
      <Loading />
    ) : (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-primary-800">Contratos de transporte escolar</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Gere contratos em PDF, assine e envie o link para o responsável aceitar digitalmente.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="font-medium text-gray-900">Novo contrato</h2>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            Os valores em reais são convertidos automaticamente. O CNPJ/CPF e o nome do transportador nos PDFs vêm da
            página{' '}
            <Link href="/dashboard/meu-transporte/dados" className="text-primary-700 font-medium underline">
              Dados do transportador
            </Link>{' '}
            (quando preenchidos).
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Preencha responsável, parcelas e vigência</h3>
          <p className="text-xs text-gray-500 mb-3">Só aparecem responsáveis já cadastrados em Responsáveis e recibos.</p>
        </div>
        <form onSubmit={createContract} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field
            label="Responsável (quem vai assinar como contratante)"
            hint="Cadastre a pessoa em Responsáveis e recibos se ainda não estiver na lista."
            className="sm:col-span-2"
          >
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={cContract.servedParentId}
              onChange={(e) => setCContract({ ...cContract, servedParentId: e.target.value })}
              required
            >
              <option value="">Selecione o responsável</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Quantidade de parcelas" hint="Ex.: 12 mensalidades no ano letivo.">
            <input
              type="number"
              min={1}
              max={120}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={cContract.installmentCount}
              onChange={(e) => setCContract({ ...cContract, installmentCount: +e.target.value || 1 })}
            />
          </Field>

          <Field
            label="Valor de cada parcela"
            hint="Digite só números; os dois últimos dígitos são centavos (ex.: 18000 = R$ 180,00)."
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={formatCentsToBRL(parseMoneyDigitsToCents(cContract.installmentValueDigits))}
              onChange={(e) =>
                setCContract({
                  ...cContract,
                  installmentValueDigits: digitsOnly(e.target.value, 12),
                })
              }
            />
          </Field>

          <Field
            label="Dia fixo de vencimento no mês"
            hint="Dia do mês em que vence cada parcela (1 a 31)."
          >
            <input
              type="number"
              min={1}
              max={31}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={cContract.paymentDueDay}
              onChange={(e) => setCContract({ ...cContract, paymentDueDay: +e.target.value || 1 })}
            />
          </Field>

          <Field label="Início da vigência do contrato" hint="Primeiro dia em que o serviço vale neste contrato.">
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={cContract.contractStartDate}
              onChange={(e) => setCContract({ ...cContract, contractStartDate: e.target.value })}
              required
            />
          </Field>

          <Field label="Fim da vigência do contrato" hint="Último dia deste contrato (ex.: fim do ano letivo).">
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={cContract.contractEndDate}
              onChange={(e) => setCContract({ ...cContract, contractEndDate: e.target.value })}
              required
            />
          </Field>

          <Field
            label="Descrição da área ou rota (opcional)"
            hint="Aparece no PDF se preenchido — ex.: bairros ou trecho atendido."
            className="sm:col-span-2"
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Ex.: Centro — bairros X e Y"
              value={cContract.serviceAreaLabel}
              onChange={(e) => setCContract({ ...cContract, serviceAreaLabel: e.target.value })}
            />
          </Field>

          <Field
            label="Valor total do contrato (opcional)"
            hint="Se quiser que conste um valor fechado no texto; senão deixe em branco."
            className="sm:col-span-2"
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono max-w-xs"
              inputMode="numeric"
              placeholder="Em branco = não enviar"
              value={
                cContract.totalContractValueDigits
                  ? formatCentsToBRL(parseMoneyDigitsToCents(cContract.totalContractValueDigits))
                  : ''
              }
              onChange={(e) =>
                setCContract({
                  ...cContract,
                  totalContractValueDigits: digitsOnly(e.target.value, 12),
                })
              }
            />
          </Field>

          <div className="sm:col-span-2">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
              Criar contrato
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-medium text-gray-900">Contratos já criados</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            O status <strong>Concluído — pai aceitou</strong> aparece quando o responsável confirma no link. Aí o{' '}
            <strong>Baixar PDF</strong> gera o documento com o aceite digital dele e o seu (datas no rodapé do PDF). Antes
            disso, o PDF ainda pode mostrar &quot;pendente&quot; no aceite do contratante.
          </p>
        </div>
        <ul className="divide-y divide-gray-100 text-sm">
          {contracts.map((c) => {
            const acceptedLabel = formatAcceptedAt(c.parentAcceptedAt);
            return (
              <li key={c.id} className="py-3 flex flex-wrap justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{parentName(c.servedParentId)}</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {CONTRACT_STATUS_PT[c.status] ?? c.status} · {c.installmentCount}×{' '}
                    {formatCentsToBRL(c.installmentValueCents)}
                  </div>
                  {c.status === 'COMPLETED' && acceptedLabel ? (
                    <div className="text-xs text-green-800 font-medium mt-1">
                      Aceite do responsável: {acceptedLabel}
                    </div>
                  ) : null}
                  {c.status !== 'COMPLETED' ? (
                    <div className="text-xs text-amber-800/90 mt-1">
                      {c.status === 'DRAFT'
                        ? 'Assine você e envie o link ao pai para ele aceitar.'
                        : 'Aguardando o responsável abrir o link e aceitar.'}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                  {c.status !== 'COMPLETED' ? (
                    <button
                      type="button"
                      className="text-primary-700 font-medium underline text-left"
                      onClick={() => signAndLink(c)}
                    >
                      {c.status === 'DRAFT' ? 'Assinar e copiar link para o pai' : 'Copiar link do pai novamente'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-gray-700 underline text-left font-medium"
                    onClick={async () => {
                      const blob = await api.contractsPdf(c.id);
                      const u = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = u;
                      a.download =
                        c.status === 'COMPLETED'
                          ? `contrato-assinado-${c.id.slice(0, 8)}.pdf`
                          : `contrato-rascunho-${c.id.slice(0, 8)}.pdf`;
                      a.click();
                      URL.revokeObjectURL(u);
                    }}
                  >
                    {c.status === 'COMPLETED' ? 'Baixar PDF (completo)' : 'Baixar PDF (prévia)'}
                  </button>
                  <button
                    type="button"
                    className="text-red-700 underline text-left font-medium"
                    onClick={() => {
                      setDeleteContractId(c.id);
                      setDeleteContractParentLabel(parentName(c.servedParentId));
                    }}
                  >
                    Excluir contrato
                  </button>
                </div>
              </li>
            );
          })}
          {contracts.length === 0 && <li className="text-gray-500">Nenhum contrato ainda.</li>}
        </ul>
      </section>

      <DeleteConfirmModal
        open={!!deleteContractId}
        title="Excluir contrato?"
        description={
          <>
            O contrato referente a <strong>{deleteContractParentLabel}</strong> será apagado. Esta ação não pode ser
            desfeita.
          </>
        }
        onCancel={() => setDeleteContractId(null)}
        onConfirm={() => void executeDeleteContract()}
        submitting={deleteSubmitting}
      />
    </div>
    )}
    </MeuTransportePremiumGate>
  );
}

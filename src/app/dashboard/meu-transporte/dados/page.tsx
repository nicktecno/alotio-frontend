'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useMyProfile, invalidateProfile } from '@/lib/swr';
import toast from 'react-hot-toast';
import { digitsOnly, formatCnpjMask, formatCpfMask, isValidCpfDigits } from '@/lib/br-input';
import { Field } from '../_components/field';
import { MeuTransportePremiumGate } from '../_components/premium-gate';

export default function MeuTransporteDadosPage() {
  const { data: profile } = useMyProfile();
  const [legalForContract, setLegalForContract] = useState({
    legalName: '',
    cnpj: '',
    transportadorCpf: '',
  });

  useEffect(() => {
    if (!profile) return;
    setLegalForContract({
      legalName: profile.legalName ?? '',
      cnpj: profile.cnpj ?? '',
      transportadorCpf: profile.transportadorCpf ?? '',
    });
  }, [profile?.id, profile?.legalName, profile?.cnpj, profile?.transportadorCpf]);

  const saveLegalForContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const cnpjD = digitsOnly(legalForContract.cnpj, 14);
    const cpfD = digitsOnly(legalForContract.transportadorCpf, 11);
    if (cnpjD && cnpjD.length !== 14) {
      toast.error('CNPJ: informe 14 dígitos ou deixe em branco.');
      return;
    }
    if (cpfD && cpfD.length !== 11) {
      toast.error('CPF: informe 11 dígitos ou deixe em branco.');
      return;
    }
    if (cpfD && !isValidCpfDigits(cpfD)) {
      toast.error('CPF inválido.');
      return;
    }
    try {
      await api.updateMyProfile({
        legalName: legalForContract.legalName.trim() || null,
        cnpj: cnpjD || null,
        transportadorCpf: cpfD || null,
      });
      await invalidateProfile();
      toast.success('Dados salvos. Passam a valer nos PDFs de contrato e recibo.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  return (
    <MeuTransportePremiumGate title="Dados do transportador">
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-primary-800">Dados do transportador</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Nome ou razão social e CNPJ/CPF para constarem nos PDFs de <strong>contrato</strong> e <strong>recibo</strong>.
          São independentes do perfil público da AloTio.
        </p>
      </div>

      <section
        className="rounded-2xl border-2 border-primary-200/80 bg-gradient-to-b from-primary-50/60 to-white p-6 sm:p-8 space-y-4 shadow-sm ring-1 ring-primary-100/80"
        aria-labelledby="heading-dados-transportador"
      >
        <div className="space-y-1">
          <h2 id="heading-dados-transportador" className="text-lg font-semibold text-primary-900">
            Contrato e recibo (PDF)
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
            Etapa opcional: <strong>razão social ou nome completo</strong> e <strong>CNPJ ou CPF</strong> para constar nos
            PDFs. Não é o formulário do &quot;Meu Perfil&quot; público da plataforma. Preencha como atua na prática —{' '}
            <strong>CNPJ</strong> (empresa / MEI) ou <strong>CPF</strong> (pessoa física); um dos documentos pode ficar em
            branco.
          </p>
        </div>
        <form onSubmit={saveLegalForContract} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field
            label="Razão social ou nome completo (contratado)"
            hint="Como deve aparecer no contrato e no recibo."
            className="sm:col-span-2"
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm"
              placeholder="Ex.: Silva Transportes Ltda ou João da Silva"
              value={legalForContract.legalName}
              onChange={(e) => setLegalForContract({ ...legalForContract, legalName: e.target.value })}
              maxLength={200}
            />
          </Field>
          <Field label="CNPJ (opcional)" hint="14 dígitos, se atua como pessoa jurídica.">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white shadow-sm"
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
              value={formatCnpjMask(legalForContract.cnpj)}
              onChange={(e) =>
                setLegalForContract({ ...legalForContract, cnpj: digitsOnly(e.target.value, 14) })
              }
            />
          </Field>
          <Field label="CPF (opcional)" hint="11 dígitos, se for pessoa física.">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white shadow-sm"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={formatCpfMask(legalForContract.transportadorCpf)}
              onChange={(e) =>
                setLegalForContract({
                  ...legalForContract,
                  transportadorCpf: digitsOnly(e.target.value, 11),
                })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium shadow-sm hover:opacity-95"
            >
              Salvar dados
            </button>
          </div>
        </form>
      </section>
    </div>
    </MeuTransportePremiumGate>
  );
}

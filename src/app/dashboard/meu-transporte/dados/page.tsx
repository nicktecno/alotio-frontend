'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useMyProfile, invalidateProfile } from '@/lib/swr';
import toast from 'react-hot-toast';
import {
  digitsOnly,
  formatBrazilMobileMask,
  formatCnpjMask,
  formatCpfMask,
  isValidCpfDigits,
} from '@/lib/br-input';
import type { PixKeyType } from '@/types';
import { Field } from '../_components/field';
import { MeuTransportePremiumGate } from '../_components/premium-gate';

const PIX_KEY_TYPES: { value: PixKeyType; label: string; placeholder: string }[] = [
  { value: 'CPF', label: 'CPF', placeholder: '000.000.000-00' },
  { value: 'CNPJ', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { value: 'PHONE', label: 'Celular / WhatsApp', placeholder: '(11) 99999-9999' },
  { value: 'EMAIL', label: 'E-mail', placeholder: 'seuemail@exemplo.com' },
  { value: 'EVP', label: 'Chave aleatória', placeholder: '00000000-0000-0000-0000-000000000000' },
];

export default function MeuTransporteDadosPage() {
  const { data: profile } = useMyProfile();
  const [legalForContract, setLegalForContract] = useState({
    legalName: '',
    cnpj: '',
    transportadorCpf: '',
    pixKeyType: 'CPF' as PixKeyType,
    pixKey: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setLegalForContract({
      legalName: profile.legalName ?? '',
      cnpj: profile.cnpj ?? '',
      transportadorCpf: profile.transportadorCpf ?? '',
      pixKeyType: (profile.pixKeyType as PixKeyType) || 'CPF',
      pixKey: profile.pixKey ?? '',
    });
  }, [
    profile?.id,
    profile?.legalName,
    profile?.cnpj,
    profile?.transportadorCpf,
    profile?.pixKeyType,
    profile?.pixKey,
  ]);

  const formatPixKeyInput = (type: PixKeyType, val: string) => {
    if (type === 'CPF') return formatCpfMask(digitsOnly(val, 11));
    if (type === 'CNPJ') return formatCnpjMask(digitsOnly(val, 14));
    if (type === 'PHONE') return formatBrazilMobileMask(digitsOnly(val, 11));
    return val;
  };

  const handlePixKeyChange = (val: string) => {
    const t = legalForContract.pixKeyType;
    if (t === 'CPF') {
      setLegalForContract((prev) => ({ ...prev, pixKey: digitsOnly(val, 11) }));
    } else if (t === 'CNPJ') {
      setLegalForContract((prev) => ({ ...prev, pixKey: digitsOnly(val, 14) }));
    } else if (t === 'PHONE') {
      setLegalForContract((prev) => ({ ...prev, pixKey: digitsOnly(val, 11) }));
    } else {
      setLegalForContract((prev) => ({ ...prev, pixKey: val }));
    }
  };

  const prefillPixFromProfile = (source: 'CPF' | 'CNPJ' | 'PHONE') => {
    if (source === 'CPF') {
      const cpf = digitsOnly(legalForContract.transportadorCpf, 11);
      if (!cpf) {
        toast.error('Preencha o campo CPF acima primeiro.');
        return;
      }
      setLegalForContract((prev) => ({ ...prev, pixKeyType: 'CPF', pixKey: cpf }));
      toast.success('CPF copiado para a chave PIX!');
    } else if (source === 'CNPJ') {
      const cnpj = digitsOnly(legalForContract.cnpj, 14);
      if (!cnpj) {
        toast.error('Preencha o campo CNPJ acima primeiro.');
        return;
      }
      setLegalForContract((prev) => ({ ...prev, pixKeyType: 'CNPJ', pixKey: cnpj }));
      toast.success('CNPJ copiado para a chave PIX!');
    } else if (source === 'PHONE') {
      const phone = digitsOnly(profile?.phone ?? '', 11);
      if (!phone) {
        toast.error('Seu perfil não possui telefone cadastrado.');
        return;
      }
      setLegalForContract((prev) => ({ ...prev, pixKeyType: 'PHONE', pixKey: phone }));
      toast.success('WhatsApp do perfil copiado para a chave PIX!');
    }
  };

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

    const rawPix = legalForContract.pixKey.trim();
    const pixType = legalForContract.pixKeyType;
    if (rawPix) {
      if (pixType === 'CPF') {
        const d = digitsOnly(rawPix, 11);
        if (d.length !== 11 || !isValidCpfDigits(d)) {
          toast.error('Chave PIX (CPF): informe um CPF válido com 11 dígitos.');
          return;
        }
      } else if (pixType === 'CNPJ') {
        const d = digitsOnly(rawPix, 14);
        if (d.length !== 14) {
          toast.error('Chave PIX (CNPJ): informe 14 dígitos.');
          return;
        }
      } else if (pixType === 'PHONE') {
        const d = digitsOnly(rawPix, 11);
        if (d.length < 10 || d.length > 11) {
          toast.error('Chave PIX (Celular): informe DDD + número (10 ou 11 dígitos).');
          return;
        }
      } else if (pixType === 'EMAIL' && !rawPix.includes('@')) {
        toast.error('Chave PIX (E-mail): informe um e-mail válido.');
        return;
      }
    }

    setSaving(true);
    try {
      await api.updateMyProfile({
        legalName: legalForContract.legalName.trim() || null,
        cnpj: cnpjD || null,
        transportadorCpf: cpfD || null,
        pixKeyType: rawPix ? pixType : null,
        pixKey: rawPix || null,
      });
      await invalidateProfile();
      toast.success('Dados e chave PIX salvos com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const currentPixMeta =
    PIX_KEY_TYPES.find((item) => item.value === legalForContract.pixKeyType) ??
    PIX_KEY_TYPES[0];

  return (
    <MeuTransportePremiumGate title="Dados do transportador e Chave PIX">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-primary-800">
            Dados do transportador e Chave PIX
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Configure seu nome/razão social e CNPJ/CPF para os PDFs de{' '}
            <strong>contrato</strong> e <strong>recibo</strong>, e sua{' '}
            <strong>Chave PIX</strong> para gerar faturas de mensalidade direto para a sua conta.
          </p>
        </div>

        <form onSubmit={saveLegalForContract} className="space-y-6">
          <section
            className="rounded-2xl border-2 border-primary-200/80 bg-gradient-to-b from-primary-50/60 to-white p-6 sm:p-8 space-y-4 shadow-sm ring-1 ring-primary-100/80"
            aria-labelledby="heading-dados-transportador"
          >
            <div className="space-y-1">
              <h2 id="heading-dados-transportador" className="text-lg font-semibold text-primary-900">
                1. Identificação no contrato e recibo (PDF)
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                Preencha como atua na prática — <strong>CNPJ</strong> (empresa / MEI) ou{' '}
                <strong>CPF</strong> (pessoa física). Esses dados também identificam o recebedor no
                comprovante PIX.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field
                label="Razão social ou nome completo (contratado)"
                hint="Como deve aparecer no contrato, no recibo e na fatura PIX."
                className="sm:col-span-2"
              >
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm"
                  placeholder="Ex.: Silva Transportes Ltda ou João da Silva"
                  value={legalForContract.legalName}
                  onChange={(e) =>
                    setLegalForContract({ ...legalForContract, legalName: e.target.value })
                  }
                  maxLength={200}
                />
              </Field>
              <Field label="CNPJ (opcional)" hint="14 dígitos, se atua como pessoa jurídica / MEI.">
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white shadow-sm"
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  value={formatCnpjMask(legalForContract.cnpj)}
                  onChange={(e) =>
                    setLegalForContract({
                      ...legalForContract,
                      cnpj: digitsOnly(e.target.value, 14),
                    })
                  }
                />
              </Field>
              <Field label="CPF (opcional)" hint="11 dígitos, se atua como pessoa física.">
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
            </div>
          </section>

          <section
            className="rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/60 to-white p-6 sm:p-8 space-y-4 shadow-sm"
            aria-labelledby="heading-pix-transportador"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="heading-pix-transportador" className="text-lg font-semibold text-emerald-950">
                  2. Chave PIX para receber mensalidades
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Taxa R$ 0,00 — Direto na sua conta
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                Usamos sua chave PIX para gerar automaticamente o código{' '}
                <strong>PIX Copia e Cola</strong> e o <strong>QR Code</strong> no valor exato da
                parcela de cada responsável. O pagamento vai <strong>100% direto para o seu banco</strong>, sem passar pela AloTio.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-gray-500 self-center">Preencher rápido com:</span>
              <button
                type="button"
                onClick={() => prefillPixFromProfile('CPF')}
                className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 font-medium text-emerald-800 hover:bg-emerald-50"
              >
                Usar CPF acima
              </button>
              <button
                type="button"
                onClick={() => prefillPixFromProfile('CNPJ')}
                className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 font-medium text-emerald-800 hover:bg-emerald-50"
              >
                Usar CNPJ acima
              </button>
              <button
                type="button"
                onClick={() => prefillPixFromProfile('PHONE')}
                className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 font-medium text-emerald-800 hover:bg-emerald-50"
              >
                Usar meu WhatsApp do perfil
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <Field label="Tipo de chave PIX">
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm"
                  value={legalForContract.pixKeyType}
                  onChange={(e) =>
                    setLegalForContract({
                      ...legalForContract,
                      pixKeyType: e.target.value as PixKeyType,
                      pixKey: '',
                    })
                  }
                >
                  {PIX_KEY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Sua chave PIX"
                hint="Confira com atenção para que o PIX dos pais caia corretamente no seu banco."
                className="sm:col-span-2"
              >
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white shadow-sm"
                  placeholder={currentPixMeta.placeholder}
                  value={formatPixKeyInput(legalForContract.pixKeyType, legalForContract.pixKey)}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  maxLength={160}
                />
              </Field>
            </div>
          </section>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar dados e chave PIX'}
            </button>
          </div>
        </form>
      </div>
    </MeuTransportePremiumGate>
  );
}

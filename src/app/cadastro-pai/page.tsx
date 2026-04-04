'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useStates, useCities, useNeighborhoods } from '@/lib/swr';
import toast from 'react-hot-toast';
import {
  digitsOnly,
  formatBrazilMobileMask,
  formatCpfMask,
  isValidCpfDigits,
  sanitizeRg,
} from '@/lib/br-input';

function Form() {
  const search = useSearchParams();
  const token = search.get('token');
  const [ok, setOk] = useState<{ transportadorName: string } | null>(null);
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

  useEffect(() => {
    if (!token) return;
    api.publicParentInvitePreview(token).then(setOk).catch((e) => toast.error(e.message));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
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
      await api.publicParentInviteComplete(token, {
        ...form,
        cpf: cpfDigits,
        whatsappPhone: phoneDigits,
      });
      toast.success('Cadastro concluído');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  if (!token) {
    return <p className="p-6 text-gray-600">Link inválido ou incompleto.</p>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">Cadastro do responsável</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Você foi convidado por <strong>{ok?.transportadorName ?? '…'}</strong> para constar como responsável no
          transporte escolar. Preencha com os mesmos dados dos documentos. Campos com máscara aceitam só o que é válido
          (CPF com 11 dígitos, WhatsApp com DDD).
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nome completo</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Como no documento"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">CPF</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
            placeholder="000.000.000-00"
            inputMode="numeric"
            value={formatCpfMask(form.cpf)}
            onChange={(e) => setForm({ ...form, cpf: digitsOnly(e.target.value, 11) })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">RG (opcional)</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Conforme o documento"
            value={form.rg}
            onChange={(e) => setForm({ ...form, rg: sanitizeRg(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp</label>
          <p className="text-xs text-gray-500 mb-1">DDD + número do celular usado no WhatsApp.</p>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
            placeholder="(11) 98765-4321"
            inputMode="numeric"
            value={formatBrazilMobileMask(form.whatsappPhone)}
            onChange={(e) => setForm({ ...form, whatsappPhone: digitsOnly(e.target.value, 11) })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
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
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
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
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
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
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Logradouro</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Rua, avenida…"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Nº"
            value={form.streetNumber}
            onChange={(e) => setForm({ ...form, streetNumber: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg font-medium">
          Enviar cadastro
        </button>
      </form>
    </div>
  );
}

export default function CadastroPaiPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando…</div>}>
      <Form />
    </Suspense>
  );
}

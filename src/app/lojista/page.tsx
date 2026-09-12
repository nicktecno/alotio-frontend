'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { MyStoreResponse, StoreType } from '@/types';

export default function LojistaOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<MyStoreResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulário de criação
  const [displayName, setDisplayName] = useState('');
  const [type, setType] = useState<StoreType>('VAN');
  const [whatsapp, setWhatsapp] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMyStore();
      setData(res);
    } catch {
      toast.error('Erro ao carregar sua loja.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tipo') === 'ESCOLA') {
      setType('ESCOLA');
    }
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Informe o nome da loja.');
      return;
    }
    setCreating(true);
    try {
      await api.createStore({
        displayName: displayName.trim(),
        type,
        whatsapp: whatsapp.trim() || undefined,
      });
      toast.success(
        type === 'ESCOLA'
          ? 'Escola criada! Escolha o plano para ativar sua página.'
          : 'Loja criada! Agora publique seus anúncios.',
      );
      if (type === 'ESCOLA') {
        router.push('/lojista/plano');
      } else {
        await load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar loja.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Carregando…</p>;
  }

  const store = data?.store ?? null;

  if (!store) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-primary-900 mb-2">
          {type === 'ESCOLA' ? 'Cadastre sua escola' : 'Crie sua loja'}
        </h1>
        <p className="text-gray-600 mb-6">
          {type === 'ESCOLA'
            ? 'Escolas parceiras precisam de assinatura ativa. O plano permite até 20 promoções e publicações ativas, com página pública e destaque na home.'
            : 'Anuncie vans ou peças no Alô Tio. Contas gratuitas publicam até 20 anúncios ativos; o plano Premium libera anúncios ilimitados e destaque na home.'}
        </p>
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'ESCOLA' ? 'Nome da escola' : 'Nome da loja'}
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={type === 'ESCOLA' ? 'Ex.: Colégio Horizonte' : 'Ex.: Vans do João'}
              className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O que você anuncia?
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as StoreType)}
              className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="VAN">Vans / veículos</option>
              <option value="PECAS">Peças e acessórios</option>
              <option value="ESCOLA">Escola parceira</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp (opcional)
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 90000-0000"
              className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {creating ? 'Criando…' : type === 'ESCOLA' ? 'Continuar para o plano' : 'Criar loja'}
          </button>
        </form>
      </div>
    );
  }

  const isPremium = data?.isPremium;
  const activeCount = data?.activeProductsCount ?? 0;
  const limit = data?.activeProductsLimit ?? null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primary-900">{store.displayName}</h1>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isPremium
              ? 'bg-secondary/20 text-secondary-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isPremium ? '⭐ Plano ativo' : store.type === 'ESCOLA' ? 'Aguardando assinatura' : 'Plano gratuito'}
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Anúncios ativos</p>
          <p className="text-2xl font-bold text-primary-900">
            {activeCount}
            {limit != null && (
              <span className="text-base font-normal text-gray-400">
                {' '}/ {limit}
              </span>
            )}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tipo</p>
          <p className="text-2xl font-bold text-primary-900">
            {store.type === 'VAN' ? 'Vans' : store.type === 'PECAS' ? 'Peças' : 'Escola'}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Página pública</p>
          <Link
            href={store.type === 'ESCOLA' ? `/escolas-parceiras/${store.slug}` : `/lojas/${store.slug}`}
            className="text-primary font-semibold hover:underline break-all"
          >
            {store.type === 'ESCOLA' ? '/escolas-parceiras/' : '/lojas/'}{store.slug}
          </Link>
        </div>
      </div>

      {limit != null && activeCount >= limit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            {store.type === 'ESCOLA'
              ? `Você atingiu o limite de ${limit} publicações ativas do plano da escola.`
              : `Você atingiu o limite de ${limit} anúncios ativos do plano gratuito. `}
            {store.type !== 'ESCOLA' && (
              <><Link href="/lojista/plano" className="font-semibold underline">Faça upgrade para o Premium</Link> e tenha publicações ilimitadas + destaque.</>
            )}
          </p>
        </div>
      )}

      {(store.serviceCities?.length ?? 0) === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            Você ainda não definiu as <strong>regiões que atende</strong>. Sem
            isso, {store.type === 'ESCOLA' ? 'sua escola' : 'sua loja'} não aparece quando os clientes filtram por estado e
            cidade.{' '}
            <Link href="/lojista/loja" className="font-semibold underline">
              Definir regiões
            </Link>
            .
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/lojista/produtos"
          className="bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold transition"
        >
          {store.type === 'ESCOLA' ? 'Gerenciar promoções' : 'Gerenciar anúncios'}
        </Link>
        <Link
          href="/lojista/loja"
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-semibold transition"
        >
          {store.type === 'ESCOLA' ? 'Editar perfil da escola' : 'Editar dados da loja'}
        </Link>
      </div>
    </div>
  );
}

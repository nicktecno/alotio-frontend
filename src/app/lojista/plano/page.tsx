'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { StorePlan, StoreType } from '@/types';

const FREE_LIMIT = 20;

type PlanOption = {
  interval: 'monthly' | 'yearly';
  priceId: string;
  priceCents: number | null;
  currency: string;
};

function formatMoney(cents: number | null, currency = 'brl') {
  if (cents == null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function LojistaPlanoPage() {
  return (
    <Suspense fallback={null}>
      <PlanoContent />
    </Suspense>
  );
}

function PlanoContent() {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<StorePlan>('FREE');
  const [storeType, setStoreType] = useState<StoreType | null>(null);
  const [sub, setSub] = useState<{
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMyStoreSubscription();
      setPlan(res.plan);
      setStoreType(res.storeType);
      setSub(res.subscription);
      setPlans(res.plans ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar plano.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const status = searchParams.get('subscription');
    if (status === 'success') {
      toast.success('Assinatura ativada! Bem-vindo ao Premium.');
    } else if (status === 'cancelled') {
      toast('Checkout cancelado.');
    }
  }, [searchParams]);

  const checkout = async (interval: 'monthly' | 'yearly') => {
    setAction(interval);
    try {
      const { url } = await api.createStoreCheckout(interval);
      if (url) window.location.href = url;
      else {
        toast.error('Não foi possível iniciar o checkout.');
        setAction('');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no checkout.');
      setAction('');
    }
  };

  const portal = async () => {
    setAction('portal');
    try {
      const { url } = await api.createStorePortal();
      if (url) window.location.href = url;
      else setAction('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao abrir portal.');
      setAction('');
    }
  };

  const cancel = async () => {
    if (!confirm('Deseja cancelar a assinatura Premium ao fim do período?'))
      return;
    setAction('cancel');
    try {
      const res = await api.cancelStoreSubscription();
      toast.success(res.message);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cancelar.');
    } finally {
      setAction('');
    }
  };

  if (loading) return <p className="text-gray-500">Carregando…</p>;

  const isPremium = plan === 'PREMIUM';
  const isSchool = storeType === 'ESCOLA';
  const monthly = plans.find((p) => p.interval === 'monthly');
  const yearly = plans.find((p) => p.interval === 'yearly');

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">Plano</h1>

      {isPremium && sub && (
        <div className="bg-gradient-to-r from-primary to-primary-600 rounded-xl p-6 mb-8 text-white">
          <h2 className="text-xl font-bold">⭐ Premium ativo</h2>
          <p className="text-primary-100 mt-1">
            Válido até {new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}
          </p>
          {sub.cancelAtPeriodEnd && (
            <p className="text-primary-200 text-sm mt-1">
              Cancelamento agendado para o fim do período.
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={portal}
              disabled={!!action}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              Gerenciar pagamento
            </button>
            {!sub.cancelAtPeriodEnd && (
              <button
                onClick={cancel}
                disabled={!!action}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {isSchool && !isPremium && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-primary-900">Ative a página da escola</h2>
          <p className="text-sm text-gray-700 mt-1">Não há plano gratuito para escolas parceiras. Escolha uma assinatura para publicar até 20 promoções e aparecer no site.</p>
        </div>
      )}

      <div className={`grid gap-4 ${isSchool ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        {!isSchool && <div
          className={`rounded-xl p-6 border ${
            isPremium ? 'border-gray-200 bg-white' : 'border-primary-300 bg-primary-50'
          }`}
        >
          <h3 className="text-lg font-bold text-primary-900">Gratuito</h3>
          <p className="text-3xl font-bold text-primary-900 mt-2">R$ 0</p>
          <ul className="text-sm text-gray-600 mt-4 space-y-2">
            <li>✓ Até {FREE_LIMIT} anúncios ativos</li>
            <li>✓ Página pública da loja</li>
            <li>✗ Sem destaque na home</li>
          </ul>
        </div>}

        <div
          className={`rounded-xl p-6 border ${
            isPremium ? 'border-secondary-300 bg-secondary-50' : 'border-gray-200 bg-white'
          }`}
        >
          <h3 className="text-lg font-bold text-primary-900">Premium mensal</h3>
          <p className="text-3xl font-bold text-primary-900 mt-2">
            {monthly ? formatMoney(monthly.priceCents, monthly.currency) : 'R$ 29,90'}
            <span className="text-base font-normal text-gray-500">/mês</span>
          </p>
          <ul className="text-sm text-gray-600 mt-4 space-y-2">
            <li>✓ {isSchool ? 'Até 20 publicações ativas' : 'Anúncios ilimitados'}</li>
            <li>✓ Destaque na home e buscas</li>
            <li>✓ Selo Premium</li>
          </ul>
          {!isPremium && monthly && (
            <button
              onClick={() => checkout('monthly')}
              disabled={!!action}
              className="w-full mt-5 bg-secondary hover:bg-secondary-600 text-white px-4 py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {action === 'monthly' ? 'Redirecionando…' : 'Assinar mensal'}
            </button>
          )}
        </div>

        <div
          className={`rounded-xl p-6 border ${
            isPremium ? 'border-secondary-300 bg-secondary-50' : 'border-secondary-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-primary-900">Premium anual</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-white">
              MELHOR
            </span>
          </div>
          <p className="text-3xl font-bold text-primary-900 mt-2">
            {yearly ? formatMoney(yearly.priceCents, yearly.currency) : '—'}
            <span className="text-base font-normal text-gray-500">/ano</span>
          </p>
          <ul className="text-sm text-gray-600 mt-4 space-y-2">
            <li>✓ {isSchool ? 'Até 20 publicações ativas' : 'Tudo do mensal'}</li>
            <li>✓ Economize pagando anual</li>
            <li>✓ Sem preocupação mensal</li>
          </ul>
          {!isPremium && yearly && (
            <button
              onClick={() => checkout('yearly')}
              disabled={!!action}
              className="w-full mt-5 bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {action === 'yearly' ? 'Redirecionando…' : 'Assinar anual'}
            </button>
          )}
          {!isPremium && !yearly && (
            <p className="text-xs text-gray-400 mt-5">Indisponível no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

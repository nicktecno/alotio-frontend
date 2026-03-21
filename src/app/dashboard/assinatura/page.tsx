'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { usePlans, useMySubscription, invalidateSubscription, invalidateProfile } from '@/lib/swr';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import type { Subscription, SubscriptionPlan } from '@/types';

export default function AssinaturaPage() {
  const { data: plans = [], isLoading: loadingPlans } = usePlans();
  const { data: subData, isLoading: loadingSub } = useMySubscription();
  const [loadingAction, setLoadingAction] = useState('');

  const isPremium = subData?.isPremium ?? false;
  const subscription = (subData?.subscription as Subscription | null) ?? null;
  const loadingPage = loadingPlans || loadingSub;

  const handleCheckout = async (planId: string) => {
    setLoadingAction(planId);
    try {
      const { url } = await api.createCheckout(planId);
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Não foi possível iniciar o checkout. Verifique a configuração do Stripe.');
        setLoadingAction('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar checkout';
      toast.error(message);
      setLoadingAction('');
    }
  };

  const handlePortal = async () => {
    setLoadingAction('portal');
    try {
      const { url } = await api.createPortalSession();
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Não foi possível abrir o portal.');
        setLoadingAction('');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
      setLoadingAction('');
    }
  };

  const [showManageModal, setShowManageModal] = useState(false);

  const isWithinRefundPeriod = subscription
    ? (new Date().getTime() - new Date(subscription.createdAt).getTime()) /
        (1000 * 60 * 60 * 24) <=
      7
    : false;

  const handleCancel = async () => {
    setLoadingAction('cancel');
    try {
      const result = await api.cancelSubscription();
      toast.success(result.message);
      setShowManageModal(false);
      invalidateSubscription();
      invalidateProfile();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao cancelar assinatura',
      );
    } finally {
      setLoadingAction('');
    }
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  /**
   * No máximo 2 cards: 1 mensal + 1 anual (o mais barato de cada tipo).
   * Cobre API com registros duplicados, intervalo inconsistente ou array repetido.
   */
  const uniquePlans = useMemo(() => {
    const list = Array.isArray(plans) ? plans : [];
    const isMonthly = (p: SubscriptionPlan) =>
      p.interval === 'MONTHLY' || /mensal/i.test(p.name);
    const isYearly = (p: SubscriptionPlan) =>
      p.interval === 'YEARLY' || /anual/i.test(p.name);

    const pickCheapest = (subset: SubscriptionPlan[]) =>
      subset.length === 0
        ? undefined
        : subset.reduce((a, b) => (a.priceCents <= b.priceCents ? a : b));

    const monthly = pickCheapest(list.filter(isMonthly));
    const yearly = pickCheapest(list.filter(isYearly));
    const ordered: SubscriptionPlan[] = [];
    if (monthly) ordered.push(monthly);
    if (yearly && yearly.id !== monthly?.id) ordered.push(yearly);
    return ordered;
  }, [plans]);

  if (loadingPage) return <Loading />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Assinatura</h1>

      {isPremium && subscription && (
        <div className="bg-gradient-to-r from-primary to-primary-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Plano Premium Ativo</h2>
              <p className="text-primary-100 mt-1">
                Válido até{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
              </p>
              {subscription.cancelAtPeriodEnd && (
                <p className="text-primary-200 text-sm mt-1">
                  Cancelamento agendado para o fim do período
                </p>
              )}
            </div>
            <button
              onClick={() => setShowManageModal(true)}
              disabled={!!loadingAction}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer disabled:opacity-50"
            >
              Gerenciar
            </button>
          </div>
        </div>
      )}

      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Gerenciar assinatura</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">Informações sobre cancelamento</p>
              {isWithinRefundPeriod ? (
                <p className="text-sm text-blue-700 mt-1">
                  Você está dentro do <strong>prazo de 7 dias</strong> (direito de arrependimento).
                  Caso cancele, receberá <strong>reembolso integral</strong> e o acesso premium será
                  encerrado imediatamente.
                </p>
              ) : (
                <p className="text-sm text-blue-700 mt-1">
                  Caso cancele, sua assinatura continuará ativa até o <strong>fim do período atual</strong>
                  {subscription && (
                    <> ({new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')})</>
                  )}
                  . Após essa data, o acesso premium será encerrado.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowManageModal(false); handlePortal(); }}
                disabled={!!loadingAction}
                className="w-full px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium transition cursor-pointer disabled:opacity-50"
              >
                {loadingAction === 'portal' ? 'Abrindo...' : 'Abrir portal de pagamento'}
              </button>

              {!subscription?.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancel}
                  disabled={loadingAction === 'cancel'}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === 'cancel' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Cancelando...
                    </span>
                  ) : (
                    'Cancelar assinatura'
                  )}
                </button>
              )}

              <button
                onClick={() => setShowManageModal(false)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {!isPremium && uniquePlans.length === 0 && !loadingPage && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-500">Nenhum plano disponível no momento.</p>
        </div>
      )}

      {/* Com Premium ativo, o banner acima já basta — não repetir cards Mensal/Anual com "Plano ativo" */}
      {!isPremium && uniquePlans.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Plano atual: <strong>Gratuito</strong>. Os planos abaixo liberam foto, veículo, mais escolas e destaque na busca.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uniquePlans.map((plan) => (
              <div
                key={`${plan.interval}-${plan.id}`}
                className={`bg-white rounded-xl border-2 p-6 transition relative ${
                  plan.interval === 'YEARLY'
                    ? 'border-primary shadow-lg ring-1 ring-primary/20'
                    : 'border-gray-200'
                }`}
              >
                {plan.interval === 'YEARLY' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
                    Melhor custo-benefício
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mt-1">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.priceCents)}
                  </span>
                  <span className="text-gray-500">
                    /{plan.interval === 'MONTHLY' ? 'mês' : 'ano'}
                  </span>
                  {plan.interval === 'YEARLY' && (
                    <p className="text-xs text-secondary font-medium mt-1">
                      Equivale a {formatPrice(Math.round(plan.priceCents / 12))}/mês
                    </p>
                  )}
                </div>

                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Até 10 escolas extras
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Foto de perfil exibida
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Fotos do veículo exibidas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Selo premium no perfil
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Destaque nos resultados de busca
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={!!loadingAction}
                  className={`w-full py-3 rounded-lg font-bold transition cursor-pointer ${
                    plan.interval === 'YEARLY'
                      ? 'bg-primary hover:bg-primary-600 text-white shadow-md'
                      : 'bg-secondary hover:bg-secondary-600 text-white'
                  } disabled:opacity-50`}
                >
                  {loadingAction === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirecionando...
                    </span>
                  ) : (
                    'Assinar agora'
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Pagamento processado de forma segura via Stripe. Cancele a qualquer momento.
      </p>
    </div>
  );
}

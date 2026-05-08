'use client';

import Link from 'next/link';
import Loading from '@/components/Loading';
import { useMyProfile, useMySubscription } from '@/lib/swr';
import { MeuTransporteNoProfile } from './no-profile';

type Props = {
  children: React.ReactNode;
  /** Shown above the upgrade card when the user is not premium */
  title?: string;
};

export function MeuTransportePremiumGate({ children, title }: Props) {
  const { data: profile, isLoading: loadingProfile } = useMyProfile();
  const { data: subData, isLoading: loadingSub } = useMySubscription();

  if (loadingProfile || loadingSub) {
    return <Loading />;
  }

  if (!profile) {
    return <MeuTransporteNoProfile />;
  }

  const isPremium = subData?.isPremium ?? false;
  if (!isPremium) {
    return (
      <div className="max-w-2xl space-y-6">
        {title ? (
          <h1 className="text-2xl font-semibold text-primary-800">{title}</h1>
        ) : null}
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden>
            ✨
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Ferramentas do transporte (Premium)
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-md mx-auto">
            Dados para PDF (contrato e recibo), cadastro de responsáveis com convite por link, recibos mensais e contratos
            de transporte escolar com assinatura digital fazem parte do plano premium.
          </p>
          <Link
            href="/dashboard/assinatura"
            className="inline-block bg-secondary hover:bg-secondary-600 text-white px-6 py-2.5 rounded-lg font-semibold transition"
          >
            Ver planos
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

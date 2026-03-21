'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import type { Profile } from '@/types';

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api
      .getMyProfile()
      .then((data) => {
        setProfile(data as Profile);
        setHasProfile(true);
      })
      .catch(() => setHasProfile(false));
  }, []);

  const handleConfirmActive = async () => {
    setConfirming(true);
    try {
      const updated = (await api.confirmActive()) as Profile;
      setProfile(updated);
      toast.success('Cadastro confirmado com sucesso!');
    } catch {
      toast.error('Erro ao confirmar cadastro');
    } finally {
      setConfirming(false);
    }
  };

  if (hasProfile === null) {
    return <Loading />;
  }

  if (!hasProfile) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6 flex justify-center">
          <img
            src="/bannerAlotio.png"
            alt="Alô Tio — transporte escolar"
            className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl h-auto object-contain rounded-2xl shadow-lg"
          />
        </div>
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-4">Bem-vindo ao aloTio!</h1>
        <p className="text-gray-600 mb-6">
          Você ainda não tem um perfil de Tio. Crie seu perfil para ser encontrado por pais.
        </p>
        <Link
          href="/dashboard/perfil"
          className="inline-block bg-secondary hover:bg-secondary-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Criar meu perfil
        </Link>
      </div>
    );
  }

  const isPremium = profile!.subscriptions?.length > 0;
  const statusColors: Record<string, string> = {
    PENDING: 'bg-primary-100 text-primary-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAUSED: 'bg-amber-100 text-amber-800',
  };
  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    PAUSED: 'Pausado',
  };

  const isPending = profile!.status === 'PENDING';
  const isRejected = profile!.status === 'REJECTED';
  const isPaused = profile!.status === 'PAUSED';
  const needsConfirmation = !!profile!.confirmationRequestedAt;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Meu Painel</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[profile!.status]}`}>
          {statusLabels[profile!.status]}
        </span>
      </div>

      {isPending && (
        <div className="border-2 border-amber-400 bg-amber-50 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 text-base">Perfil em análise</h3>
            <p className="text-sm text-amber-700 mt-1">
              Seus documentos foram enviados e estão aguardando a aprovação de um administrador.
              Enquanto isso, seu perfil não será exibido nas buscas públicas.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="border-2 border-red-400 bg-red-50 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-800 text-base">Perfil rejeitado</h3>
            <p className="text-sm text-red-700 mt-1">
              Seu cadastro foi rejeitado pelo administrador. Verifique se seus documentos comprobatórios estão corretos
              e atualize-os na página de perfil para uma nova análise.
            </p>
            <Link href="/dashboard/perfil" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900">
              Atualizar documentos
            </Link>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="border-2 border-amber-400 bg-amber-50 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 text-base">Perfil pausado</h3>
            <p className="text-sm text-amber-700 mt-1">
              Seu perfil foi temporariamente pausado e não está sendo exibido nas buscas públicas.
            </p>
            {profile!.rejectedReason && (
              <div className="mt-3 bg-white border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Mensagem:</p>
                <p className="text-sm text-amber-700 whitespace-pre-wrap">{profile!.rejectedReason}</p>
              </div>
            )}
            {needsConfirmation ? (
              <button
                onClick={handleConfirmActive}
                disabled={confirming}
                className="mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold transition"
              >
                {confirming ? 'Confirmando...' : 'Confirmo que ainda sou transportador escolar'}
              </button>
            ) : (
              <p className="text-xs text-amber-600 mt-2">
                Entre em contato pelo <Link href="/contato" className="font-semibold underline hover:text-amber-800">Fale Conosco</Link> se tiver dúvidas.
              </p>
            )}
          </div>
        </div>
      )}

      {!isPaused && needsConfirmation && (
        <div className="border-2 border-blue-400 bg-blue-50 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 text-base">Confirmação anual necessária</h3>
            <p className="text-sm text-blue-700 mt-1">
              Faz um ano que você está cadastrado no aloTio. Para manter seu perfil ativo, confirme que ainda atua como transportador escolar.
            </p>
            <button
              onClick={handleConfirmActive}
              disabled={confirming}
              className="mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold transition"
            >
              {confirming ? 'Confirmando...' : 'Confirmo que ainda sou transportador escolar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Prefixo</p>
          <p className="text-2xl font-bold text-gray-900">{profile!.prefixo}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Cidade</p>
          <p className="text-lg font-semibold text-gray-900">{profile!.city.name}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Escolas</p>
          <p className="text-2xl font-bold text-gray-900">
            {1 + (profile!.secondarySchool ? 1 : 0) + profile!.schools.length}
          </p>
        </div>
      </div>

      {profile!.neighborhoods?.length === 0 && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">📍</span>
          <div>
            <h3 className="font-semibold text-amber-900">Informe os bairros que você atende</h3>
            <p className="text-sm text-amber-800 mt-0.5">
              Os bairros ajudam as famílias a encontrá-lo na busca. Não deixe de preencher.
            </p>
            <Link
              href="/dashboard/perfil"
              className="inline-block mt-2 text-sm font-semibold text-amber-700 underline hover:text-amber-900"
            >
              Completar no perfil →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/perfil"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
            Editar Perfil
          </h3>
          <p className="text-sm text-gray-500">Atualize suas informações pessoais e bairros</p>
        </Link>
        <Link
          href="/dashboard/escolas"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
            Gerenciar Escolas
          </h3>
          <p className="text-sm text-gray-500">
            {isPremium ? 'Adicione até 10 escolas extras' : 'Default + secundária'}
          </p>
        </Link>
        <Link
          href="/dashboard/fotos"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
            Fotos
          </h3>
          <p className="text-sm text-gray-500">
            {isPremium ? 'Gerencie avatar e fotos do veículo' : 'Disponível no plano premium'}
          </p>
        </Link>
        <Link
          href="/dashboard/assinatura"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
            Assinatura
          </h3>
          <p className="text-sm text-gray-500">
            {isPremium ? 'Gerencie sua assinatura premium' : 'Assine para mais recursos'}
          </p>
        </Link>
      </div>
    </div>
  );
}

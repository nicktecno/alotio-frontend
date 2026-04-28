'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/**
 * Transportadores com conta antiga sem registro de aceite dos termos: obriga concordância após login.
 */
export default function TransportadorTermsModal() {
  const [submitting, setSubmitting] = useState(false);
  const logout = useAuth((s) => s.logout);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const { user } = await api.acceptTransportadorTerms();
      useAuth.setState({
        user: {
          ...user,
          mustCaptureEmail: user.mustCaptureEmail ?? false,
          transportadorTermsAcceptedAt: user.transportadorTermsAcceptedAt ?? null,
        },
      });
      toast.success('Termos aceitos. Obrigado!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível registrar o aceite.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <h2
          id="terms-modal-title"
          className="text-xl font-bold text-gray-900 font-heading mb-2"
        >
          Termos para transportadores
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Atualizamos as regras sobre a sua responsabilidade pelas informações do seu perfil e pelo
          serviço de transporte escolar. É preciso aceitar para continuar usando o painel do Alô Tio.
        </p>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700 space-y-3 mb-6">
          <p>
            Ao aceitar, você confirma que as informações que cadastra são verdadeiras, que cumpre a
            legislação e as exigências dos órgãos competentes para o transporte escolar, e que o Alô Tio
            apenas divulga seu perfil — o contrato é entre você e as famílias.
          </p>
          <p className="font-medium text-gray-900">
            Leia o texto completo antes de confirmar.
          </p>
        </div>
        <Link
          href="/termos-transportador"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-semibold text-primary hover:underline mb-6"
        >
          Abrir termos completos em nova aba →
        </Link>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleAccept}
            disabled={submitting}
            className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
          >
            {submitting ? 'Salvando...' : 'Li e aceito os termos'}
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}

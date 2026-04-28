'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/**
 * Contas criadas por import/seed com e-mail provisório: obriga cadastrar e-mail real após login.
 */
export default function EmailCaptureModal() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const logout = useAuth((s) => s.logout);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { user } = await api.updateCapturedEmail(email.trim());
      useAuth.setState({
        user: {
          ...user,
          mustCaptureEmail: user.mustCaptureEmail ?? false,
          transportadorTermsAcceptedAt:
            user.transportadorTermsAcceptedAt ?? null,
        },
      });
      toast.success('E-mail salvo com sucesso!');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível salvar o e-mail';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-capture-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-6 sm:p-8">
        <h2
          id="email-capture-title"
          className="text-xl font-bold text-gray-900 font-heading mb-2"
        >
          Cadastre seu e-mail
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Sua conta foi criada com acesso por telefone. Informe um e-mail válido para
          receber avisos e recuperar a senha quando precisar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="capture-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail
            </label>
            <input
              id="capture-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
          >
            {submitting ? 'Salvando...' : 'Salvar e continuar'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

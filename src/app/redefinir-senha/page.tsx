'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="bg-red-500/20 border border-red-400/40 rounded-lg p-6 text-center">
        <h2 className="text-white font-bold text-lg mb-2">Link inválido</h2>
        <p className="text-primary-100 text-sm mb-4">
          O link de redefinição de senha é inválido ou está incompleto.
        </p>
        <Link
          href="/esqueci-senha"
          className="text-secondary hover:text-secondary-400 underline text-sm"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao redefinir senha';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-secondary/20 border border-secondary/40 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-white font-bold text-lg mb-2">
          Senha redefinida!
        </h2>
        <p className="text-primary-100 text-sm mb-4">
          Sua senha foi alterada com sucesso. Você será redirecionado para o login...
        </p>
        <Link
          href="/login"
          className="text-secondary hover:text-secondary-400 underline text-sm"
        >
          Ir para login agora
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-primary-100 mb-1.5">
          Nova senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-100 mb-1.5">
          Confirmar nova senha
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
          placeholder="Repita a nova senha"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold font-heading text-lg tracking-wide transition cursor-pointer"
      >
        {loading ? 'Redefinindo...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-primary-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/login"
            className="text-primary-100 hover:text-white transition text-sm"
          >
            &larr; Voltar ao login
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img src="/alotio-title.svg" alt="aloTio" className="h-8" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-heading">
            Nova senha
          </h1>
          <p className="text-primary-200 mt-3 text-sm">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-primary-200">Carregando...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-primary-100 text-sm mt-6">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="text-white hover:text-secondary font-semibold underline"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}

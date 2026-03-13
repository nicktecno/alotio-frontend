'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
      toast.success('Verifique seu email!');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao enviar email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
            Esqueci minha senha
          </h1>
          <p className="text-primary-200 mt-3 text-sm">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {sent ? (
          <div className="bg-secondary/20 border border-secondary/40 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-white font-bold text-lg mb-2">
              Email enviado!
            </h2>
            <p className="text-primary-100 text-sm mb-4">
              Se existe uma conta com o email <strong className="text-white">{email}</strong>,
              você receberá um link para redefinir sua senha. Verifique também sua caixa de spam.
            </p>
            <p className="text-primary-300 text-xs mb-6">
              O link expira em 1 hora.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-secondary hover:text-secondary-400 underline text-sm cursor-pointer"
            >
              Enviar novamente para outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold font-heading text-lg tracking-wide transition cursor-pointer"
            >
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>
        )}

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

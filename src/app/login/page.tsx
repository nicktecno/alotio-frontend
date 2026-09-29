'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const user = useAuth.getState().user;
      toast.success('Login realizado!');
      setRedirecting(true);
      router.push(user?.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      setSubmitting(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-primary-600 flex flex-col items-center justify-center gap-6">
        <img
          src="/logoAloTioVector.svg"
          alt="Alô Tio"
          className="h-14 w-auto max-h-16 object-contain"
        />
        <img src="/bus.gif" alt="Carregando" className="w-52 h-auto" />
        <p className="text-primary-200 text-sm font-medium">Entrando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-primary-100 hover:text-white transition text-sm">
            &larr; Voltar
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logoAloTioVector.svg"
              alt="Alô Tio"
              className="h-10 w-auto max-h-11 object-contain"
            />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-heading">
            Entre com seu Login
          </h1>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/20 border border-red-400/40 text-white px-4 py-3 rounded-lg text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary-100 mb-1.5">
              E-mail ou telefone
            </label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
              placeholder="seu@email.com ou (11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-100 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-white p-1.5 focus:outline-none transition cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-primary-200 hover:text-secondary text-sm underline transition"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold font-heading text-lg tracking-wide transition cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Entrando...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-8 border border-primary-400/30 rounded-xl p-5 text-center bg-primary-700/30">
          <p className="text-white font-semibold text-base mb-1">Ainda não tem cadastro?</p>
          <p className="text-primary-200 text-sm mb-4">Cadastre-se gratuitamente e comece a ser encontrado por famílias da sua região.</p>
          <Link
            href="/cadastro"
            className="inline-block bg-secondary hover:bg-secondary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition"
          >
            Criar minha conta
          </Link>
        </div>
      </div>
    </div>
  );
}

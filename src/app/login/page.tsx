'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const user = useAuth.getState().user;
      toast.success('Login realizado!');
      router.push(user?.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      toast.error(message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-600 flex flex-col items-center justify-center gap-6">
        <img src="/alotio-title.svg" alt="aloTio" className="h-12" />
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
            <img src="/alotio-title.svg" alt="aloTio" className="h-8" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-heading">
            Entre com seu Login
          </h1>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-primary-100 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
              placeholder="••••••••"
            />
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
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold font-heading text-lg tracking-wide transition cursor-pointer"
          >
            Login
          </button>
        </form>

        <p className="text-center text-primary-100 text-sm mt-6">
          Ainda não tem cadastro?{' '}
          <Link href="/cadastro" className="text-white hover:text-secondary font-semibold underline">
            Faça agora!
          </Link>
        </p>
      </div>
    </div>
  );
}

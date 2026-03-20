'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function CadastroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      await login(email, password);
      toast.success('Conta criada com sucesso! Bem-vindo(a)!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      toast.error(message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-600 flex flex-col items-center justify-center gap-6">
        <img
          src="/logoAloTio.png"
          alt="Alô Tio"
          className="h-14 w-auto max-h-16 object-contain"
        />
        <img src="/bus.gif" alt="Carregando" className="w-52 h-auto" />
        <p className="text-primary-200 text-sm font-medium">Criando sua conta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-600 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img
              src="/logoAloTio.png"
              alt="Alô Tio"
              className="h-12 w-auto max-h-14 object-contain"
            />
          </Link>
          <h1 className="text-4xl font-bold text-white font-heading">
            Crie seu cadastro como Tio(a)
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
              minLength={6}
              className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-100 mb-1.5">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-primary-700/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold font-heading text-lg tracking-wide transition"
          >
            Cadastrar
          </button>
        </form>

        <p className="text-center text-primary-100 text-sm mt-6">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-white hover:text-secondary font-semibold underline">
            Faça o Login
          </Link>
        </p>
      </div>
    </div>
  );
}

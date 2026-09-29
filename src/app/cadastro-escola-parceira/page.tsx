'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function PartnerSchoolSignupPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast.error('A senha deve ter ao menos 6 caracteres.');
    if (password !== confirm) return toast.error('As senhas não conferem.');
    setLoading(true);
    try {
      await register(email.trim(), password, 'LOJISTA');
      await login(email.trim(), password);
      router.push('/lojista?tipo=ESCOLA');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-[#fffdf7] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-primary-900">Divulgue sua escola</h1>
          <p className="text-gray-600 mt-2 mb-3">Crie o perfil da instituição e publique promoções, benefícios e campanhas de matrícula.</p>
          <p className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">A divulgação de escolas é paga e permite até 20 publicações ativas.</p>
          <form onSubmit={submit} className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm space-y-4">
            <label className="block text-sm font-medium text-gray-700">E-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" /></label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 pl-4 pr-11 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 focus:outline-none transition cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 pl-4 pr-11 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 focus:outline-none transition cursor-pointer"
                  aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                >
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-60">{loading ? 'Criando…' : 'Criar conta da escola'}</button>
            <p className="text-center text-sm text-gray-500">Já tem conta? <Link href="/login" className="text-primary font-semibold underline">Entrar</Link></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
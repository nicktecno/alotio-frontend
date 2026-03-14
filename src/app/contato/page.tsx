'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContatoPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sendContact(form);
      toast.success('Mensagem enviada com sucesso!');
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Fale Conosco</h1>
        <p className="text-gray-500 mb-8">
          Tem alguma dúvida, sugestão ou precisa de ajuda? Envie sua mensagem e responderemos o mais breve possível.
        </p>

        {sent ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mensagem enviada!</h2>
            <p className="text-gray-500 mb-6">
              Recebemos sua mensagem e entraremos em contato em breve pelo email informado.
            </p>
            <button
              onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
              className="bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold transition cursor-pointer"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Seu nome completo"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={5}
                placeholder="Escreva sua mensagem..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/2000</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              {loading ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Ou envie um email diretamente para{' '}
            <a href="mailto:contato@alotio.com.br" className="text-primary hover:underline font-medium">
              contato@alotio.com.br
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

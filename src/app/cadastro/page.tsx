'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TioProfileForm } from '@/app/dashboard/perfil/_components/TioProfileForm';

export default function CadastroPage() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-primary-600 flex flex-col items-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logoAloTioVector.svg" alt="Alô Tio" className="h-12 w-auto max-h-14 object-contain" />
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
          <TioProfileForm
            variant="cadastro"
            onSubmittingChange={setSubmitting}
          />
        </div>

        <p className="text-center text-primary-100 text-sm mt-8">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-white hover:text-secondary font-semibold underline">
            Faça o Login
          </Link>
        </p>
      </div>

      {submitting && (
        <div className="fixed inset-0 z-50 bg-primary-900/80 flex flex-col items-center justify-center gap-6">
          <img src="/logoAloTioVector.svg" alt="Alô Tio" className="h-14 w-auto max-h-16 object-contain" />
          <img src="/bus.gif" alt="Carregando" className="w-52 h-auto" />
          <p className="text-primary-100 text-sm font-medium px-4 text-center">Criando sua conta e enviando o perfil...</p>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import Loading from '@/components/Loading';
import { useMyProfile } from '@/lib/swr';
import { MeuTransporteNoProfile } from './_components/no-profile';

const sections: {
  href: string;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    href: '/dashboard/meu-transporte/dados',
    title: 'Dados do transportador',
    description:
      'Nome ou razão social e CNPJ/CPF usados nos PDFs de contrato e recibo — separados do perfil público da AloTio.',
    icon: '📋',
  },
  {
    href: '/dashboard/meu-transporte/responsaveis',
    title: 'Responsáveis e recibos',
    description:
      'Convite por link, cadastro manual, lista de responsáveis e recibos em PDF (download ou WhatsApp).',
    icon: '👨‍👩‍👧',
  },
  {
    href: '/dashboard/meu-transporte/contratos',
    title: 'Contratos',
    description: 'Crie contratos de transporte escolar, assine, envie o link ao pai e acompanhe o status.',
    icon: '📝',
  },
];

export default function MeuTransportePage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  if (profileLoading) {
    return <Loading />;
  }

  if (!profile) {
    return <MeuTransporteNoProfile />;
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-primary-800">Meu transporte</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Cadastre pais ou responsáveis, envie um link para eles preencherem sozinhos, gere recibos em PDF e contratos de
          transporte escolar — em um só lugar.
        </p>
        <p className="text-gray-500 mt-2 text-xs leading-relaxed max-w-2xl">
          Esta área faz parte das <strong className="font-medium text-gray-600">ferramentas adicionais</strong> da AloTio:
          cadastros de responsáveis, recibos e contratos para você administrar o dia a dia do transporte. É independente do
          restante da plataforma — não altera busca, assinatura AloTio nem o seu perfil público.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">O que você pode fazer</h2>
        <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/40"
              >
                <span className="text-2xl mb-2" aria-hidden>
                  {s.icon}
                </span>
                <span className="font-medium text-primary-900">{s.title}</span>
                <span className="mt-1 text-sm text-gray-600 leading-relaxed">{s.description}</span>
                <span className="mt-3 text-sm font-medium text-primary-700">Abrir →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

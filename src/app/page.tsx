import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO_SITE_DESCRIPTION, SEO_SITE_TITLE } from '@/lib/seo-copy';

export const metadata: Metadata = {
  title: SEO_SITE_TITLE,
  description: SEO_SITE_DESCRIPTION,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br',
  },
};

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Como encontrar transporte escolar para meu filho?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No Alô Tio, selecione o estado, a cidade e a escola do seu filho. A plataforma mostrará todos os transportadores escolares cadastrados que atendem aquela escola, com informações de contato, fotos do veículo e bairros atendidos.',
        },
      },
      {
        '@type': 'Question',
        name: 'O Alô Tio é gratuito para pais?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, a busca por transporte escolar no Alô Tio é totalmente gratuita para pais e responsáveis. Basta acessar a plataforma e pesquisar pela escola.',
        },
      },
      {
        '@type': 'Question',
        name: 'O que é condutor escolar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Condutor escolar é o profissional autorizado a transportar alunos entre casa e escola, em van escolar ou perua. No Alô Tio você encontra condutores cadastrados por escola e bairro atendido.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como me cadastrar como condutor de transporte escolar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Crie sua conta gratuitamente, preencha seu perfil com prefixo, escolas atendidas e bairros. Envie seu documento profissional para verificação. Após aprovação, seu perfil ficará visível para pais que buscam transporte escolar na sua região.',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero - Purple background matching original */}
        <section className="bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary to-primary-600 opacity-90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Logo + text */}
              <div className="text-center lg:text-left">
                <img
                  src="/logoAloTioVector.svg"
                  alt="Alô Tio"
                  className="h-20 sm:h-24 lg:h-28 w-auto max-w-full mx-auto lg:mx-0 mb-6 object-contain drop-shadow-md"
                />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-heading">
                  Encontre transporte escolar e condutor escolar na sua região
                </h1>
                <p className="mt-4 text-lg text-primary-100 max-w-xl">
                  Busque por escola, cidade ou bairro e encontre van escolar, motorista e tio da
                  van verificados — o jeito mais fácil de encontrar transporte escolar com
                  segurança.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/tios"
                    className="bg-secondary hover:bg-secondary-600 text-white px-8 py-4 rounded-lg text-lg font-bold font-heading tracking-wide transition shadow-lg text-center"
                  >
                    Encontrar transporte escolar
                  </Link>
                  <Link
                    href="/login"
                    className="bg-primary-300 hover:bg-primary-400 text-white px-8 py-4 rounded-lg text-lg font-bold font-heading tracking-wide transition text-center"
                  >
                    Login para os Tios
                  </Link>
                </div>
              </div>

              {/* Right - Ilustração (banner) */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/bannerAlotio.png"
                  alt="Encontrar transporte escolar — Alô Tio"
                  className="w-full max-w-md sm:max-w-xl lg:max-w-2xl xl:max-w-3xl h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-primary-900 mb-12 font-heading">
              Como funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Busque por escola',
                  desc: 'Selecione estado, cidade e escola para encontrar transporte escolar e condutores disponíveis.',
                  icon: '🔍',
                  color: 'bg-primary-50 border-primary-200',
                },
                {
                  title: 'Veja os perfis',
                  desc: 'Confira informações, bairros atendidos, fotos do veículo e detalhes dos profissionais.',
                  icon: '👤',
                  color: 'bg-secondary/5 border-secondary/20',
                },
                {
                  title: 'Entre em contato',
                  desc: 'Ligue ou envie mensagem ao condutor escolar e combine o transporte do seu filho.',
                  icon: '📱',
                  color: 'bg-primary-50 border-primary-200',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className={`${f.color} border rounded-2xl p-8 text-center hover:shadow-lg transition`}
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2 font-heading">
                    {f.title}
                  </h3>
                  <p className="text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 font-heading mb-4">
              Plataforma para encontrar transporte escolar
            </h2>
            <p className="text-gray-600 leading-relaxed">
              O <strong>Alô Tio</strong> conecta famílias a <strong>condutor escolar</strong>,
              van escolar e motoristas de transporte escolar cadastrados por escola e bairro. Se
              você procura <strong>encontrar transporte escolar</strong> perto da escola do seu
              filho, use a busca gratuita — também conhecido como tio da van ou perua escolar em
              muitas cidades.
            </p>
            <Link
              href="/transporte-escolar"
              className="inline-block mt-6 text-primary font-semibold hover:underline"
            >
              Ver transporte escolar por cidade e bairro →
            </Link>
          </div>
        </section>

        {/* CTA for Tios */}
        <section className="py-20 bg-gradient-to-r from-primary-700 to-primary">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <img
              src="/bannerAlotio.png"
              alt="Alô Tio"
              className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto mx-auto mb-6 opacity-95 object-contain"
            />
            <h2 className="text-3xl font-bold text-white mb-4 font-heading">
              É Tio? Cadastre-se gratuitamente!
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Crie seu perfil, adicione suas escolas e bairros e seja encontrado
              por pais da sua região. Com o plano premium, tenha ainda mais destaque.
            </p>
            <Link
              href="/cadastro"
              className="inline-block bg-secondary hover:bg-secondary-600 text-white px-8 py-4 rounded-lg text-lg font-bold font-heading transition shadow-lg"
            >
              Criar meu perfil
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

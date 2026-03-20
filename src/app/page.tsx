import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'aloTio - Transporte Escolar | Encontre o Tio da Van Escolar',
  description:
    'Encontre transporte escolar seguro e verificado para seu filho. Pesquise por escola, cidade ou bairro e conecte-se com motoristas de van escolar cadastrados na sua região. Serviço gratuito.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br',
  },
};

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alotio.com.br';

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'aloTio - Transporte Escolar',
    description: 'Plataforma para encontrar transporte escolar seguro e verificado por escola, cidade e bairro.',
    url: siteUrl,
    areaServed: {
      '@type': 'State',
      name: 'São Paulo',
    },
    serviceType: 'Transporte Escolar',
    priceRange: 'Gratuito para busca',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Como encontrar transporte escolar para meu filho?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No aloTio, selecione o estado, a cidade e a escola do seu filho. A plataforma mostrará todos os transportadores escolares cadastrados que atendem aquela escola, com informações de contato, fotos do veículo e bairros atendidos.',
        },
      },
      {
        '@type': 'Question',
        name: 'O aloTio é gratuito para pais?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, a busca por transporte escolar no aloTio é totalmente gratuita para pais e responsáveis. Basta acessar a plataforma e pesquisar pela escola.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como me cadastrar como motorista de transporte escolar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Crie sua conta gratuitamente, preencha seu perfil com seu prefixo, escolas atendidas e bairros. Envie seu documento profissional para verificação. Após aprovação, seu perfil ficará visível para pais da sua região.',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
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
                  src="/logo-alotio.png"
                  alt="Alô Tio"
                  className="h-20 sm:h-24 lg:h-28 w-auto max-w-full mx-auto lg:mx-0 mb-6 object-contain drop-shadow-md"
                />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-heading">
                  Encontre o Tio para o transporte do seu filho
                </h1>
                <p className="mt-4 text-lg text-primary-100 max-w-xl">
                  Pesquise por escola, cidade ou bairro e encontre profissionais verificados
                  para o transporte escolar com segurança e confiança.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/tios"
                    className="bg-secondary hover:bg-secondary-600 text-white px-8 py-4 rounded-lg text-lg font-bold font-heading tracking-wide transition shadow-lg text-center"
                  >
                    Procurar por Tios
                  </Link>
                  <Link
                    href="/login"
                    className="bg-primary-300 hover:bg-primary-400 text-white px-8 py-4 rounded-lg text-lg font-bold font-heading tracking-wide transition text-center"
                  >
                    Login para os Tios
                  </Link>
                </div>
              </div>

              {/* Right - Ilustração (antigo alotio-logo) */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/alotio-logo.png"
                  alt="Alô Tio - Transporte escolar"
                  className="w-64 sm:w-72 lg:w-80 max-w-full h-auto object-contain drop-shadow-2xl"
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
                  desc: 'Selecione o estado, a cidade e a escola do seu filho para encontrar os tios disponíveis.',
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
                  desc: 'Ligue ou envie mensagem diretamente para o tio e combine o transporte escolar.',
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

        {/* CTA for Tios */}
        <section className="py-20 bg-gradient-to-r from-primary-700 to-primary">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <img
              src="/alotio-logo.png"
              alt="Alô Tio"
              className="w-40 sm:w-48 h-auto max-w-full mx-auto mb-6 opacity-95 object-contain"
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

import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sobre o Alô Tio — Nossa Missão, Equipe e Compromisso com a Segurança',
  description:
    'Conheça o Alô Tio: plataforma brasileira dedicada a aproximar famílias e condutores escolares regularizados, promovendo segurança, informação e mobilidade responsável.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/sobre` : 'https://alotio.com.br/sobre',
  },
};

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Sobre</span>
        </nav>

        <div className="mb-8">
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-800">
            Institucional
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-3">
            Sobre o Alô Tio
          </h1>
          <p className="mt-3 text-lg text-gray-600 leading-relaxed">
            Conectando famílias, escolas e profissionais de transporte escolar com foco em segurança,
            legalidade e transparência.
          </p>
        </div>

        <div className="space-y-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 leading-relaxed text-gray-700 shadow-sm">
          {/* Quem Somos */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">Quem Somos</h2>
            <p className="mb-4">
              O <strong>Alô Tio</strong> é uma plataforma brasileira idealizada para solucionar uma dor real de milhões de famílias: encontrar transporte escolar seguro, confiável e devidamente regularizado para seus filhos, de forma simples, transparente e sem burocracia.
            </p>
            <p>
              Ao mesmo tempo, valorizamos o trabalho dos condutores escolares — os conhecidos e queridos “Tios” e “Tias” da van —, oferecendo-lhes visibilidade digital profissional para organizarem suas rotas, exibirem suas áreas de atendimento e conquistarem novos clientes na sua comunidade.
            </p>
          </section>

          {/* Missão, Visão e Valores */}
          <section className="grid gap-6 sm:grid-cols-3 pt-6 border-t border-gray-100">
            <div className="rounded-xl bg-primary-50/50 p-5 border border-primary-100">
              <h3 className="font-heading font-bold text-primary-900 mb-2">🎯 Nossa Missão</h3>
              <p className="text-sm text-gray-600">
                Garantir que pais encontrem transporte escolar com facilidade, promovendo a segurança no trânsito infantil e a valorização dos motoristas legalizados.
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/50 p-5 border border-amber-100">
              <h3 className="font-heading font-bold text-amber-900 mb-2">👁️ Nossa Visão</h3>
              <p className="text-sm text-gray-600">
                Ser o principal ecossistema digital de mobilidade escolar do Brasil, reconhecido por famílias, escolas e órgãos de trânsito pela confiabilidade.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50/50 p-5 border border-emerald-100">
              <h3 className="font-heading font-bold text-emerald-900 mb-2">🛡️ Nossos Valores</h3>
              <p className="text-sm text-gray-600">
                Segurança infantil inegociável, transparência nas informações, respeito aos direitos do consumidor e responsabilidade social.
              </p>
            </div>
          </section>

          {/* O que fazemos */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">O que Fazemos</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Nossa atuação é estruturada em três frentes complementares:
              </p>
              <ul className="list-disc list-inside space-y-2.5 pl-2">
                <li>
                  <strong>Diretório Inteligente por Escola e Bairro:</strong> Os pais informam a cidade e a escola do filho e visualizam instantaneamente os transportadores que cobrem aquele itinerário com fotos do veículo, bairros e canais diretos de contato.
                </li>
                <li>
                  <strong>Central de Guias Educativos e Legislação:</strong> Produzimos artigos e orientações sobre os artigos 136 a 139 do Código de Trânsito Brasileiro (CTB), contratos de transporte, direitos do consumidor e checklists práticos de vistoria.
                </li>
                <li>
                  <strong>Parcerias com Escolas e Lojas Especializadas:</strong> Espaço para instituições de ensino divulgarem diferenciais e para fornecedores de autopeças e manutenção apoiarem a frota de vans com preços justos.
                </li>
              </ul>
            </div>
          </section>

          {/* Segurança e Escolha Responsável */}
          <section className="rounded-xl bg-gray-50 p-6 border border-gray-200">
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">
              Segurança e Escolha Responsável: Nosso Compromisso
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
              O Alô Tio opera como um facilitador de contato e divulgação. Lembramos sempre a todas as famílias que a decisão final de contratação deve ser acompanhada da verificação presencial dos documentos:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-2">
              <li>Conferência do selo ou adesivo de vistoria semestral emitido pelo órgão de trânsito municipal.</li>
              <li>Checagem da CNH na categoria D/E com anotação de transporte escolar.</li>
              <li>Confirmação da existência de cinto de segurança individual para cada passageiro.</li>
              <li>Formalização de contrato de prestação de serviços por escrito.</li>
            </ul>
            <p className="mt-4 text-sm font-semibold">
              <Link href="/guias/como-escolher-transporte-escolar-seguro" className="text-primary hover:underline">
                Acesse o Guia Completo de Segurança no Transporte Escolar →
              </Link>
            </p>
          </section>

          {/* Transparência e Responsabilidade Editorial */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">
              Linha Editorial e Transparência
            </h2>
            <p className="leading-relaxed mb-4">
              Os conteúdos publicados em nossa Central de Guias são elaborados e revisados por profissionais com experiência em legislação de trânsito, direitos do consumidor e mobilidade urbana. Não publicamos artigos patrocinados sem aviso explícito e mantemos independência editorial para proteger sempre o bem-estar das crianças.
            </p>
            <p className="leading-relaxed">
              Respeitamos rigorosamente a privacidade dos nossos usuários conforme a Lei Geral de Proteção de Dados (LGPD). Para mais detalhes sobre como tratamos os dados da plataforma, consulte nossa{' '}
              <Link href="/privacidade" className="font-medium text-primary hover:underline">
                Política de Privacidade
              </Link>{' '}
              e os{' '}
              <Link href="/termos-de-uso" className="font-medium text-primary hover:underline">
                Termos de Uso
              </Link>
              .
            </p>
          </section>

          {/* Fale com a Equipe */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">Canais de Atendimento</h2>
            <p className="leading-relaxed mb-4">
              Dúvidas, sugestões de pauta, correções em dados cadastrais ou solicitações institucionais podem ser enviadas diretamente à nossa equipe:
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href="/contato"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-600 transition"
              >
                Formulário de Contato
              </Link>
              <a
                href="mailto:contato@alotio.com.br"
                className="text-sm font-semibold text-primary hover:underline"
              >
                contato@alotio.com.br
              </a>
              <a
                href="https://www.instagram.com/alo.tio/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-800 transition"
              >
                Instagram: @alo.tio
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
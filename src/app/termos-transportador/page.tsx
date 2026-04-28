import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Termos para transportadores | Alô Tio',
  description:
    'Termos sobre veracidade das informações e responsabilidade do transportador escolar na plataforma Alô Tio.',
};

export default function TermosTransportadorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/"
          className="text-primary hover:underline text-sm mb-6 inline-block"
        >
          &larr; Voltar ao início
        </Link>
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          Termos para transportadores
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Última atualização: abril de 2026. Estes termos complementam o uso da plataforma Alô Tio por
          profissionais de transporte escolar cadastrados como transportadores.
        </p>

        <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-0">1. Natureza do serviço</h2>
            <p>
              O Alô Tio é uma plataforma digital que permite divulgar seu perfil e facilitar o contato
              entre transportadores escolares e famílias. O contrato de transporte é celebrado entre
              você e a família; o Alô Tio não é parte desse contrato e não presta o serviço de
              transporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Veracidade das informações</h2>
            <p>
              Você é o único responsável pela exatidão e atualização dos dados que cadastra, incluindo,
              sem limitação: nome de exibição, prefixo, telefone, cidade e escolas atendidas, bairros,
              descrição do serviço, documentação enviada à administração, informações sobre vagas e
              qualquer outro conteúdo visível no seu perfil ou enviado pelo aplicativo.
            </p>
            <p>
              Informações falsas, enganosas ou desatualizadas podem induzir famílias em erro e sujeitar
              você a sanções na plataforma, inclusive reprovação ou exclusão do cadastro, além das
              consequências legais cabíveis em relação a terceiros e aos órgãos competentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Documentação e conformidade</h2>
            <p>
              Você declara que possui habilitação, autorizações, licenças e seguros exigidos pela
              legislação e pelos órgãos locais para o transporte escolar que exerce. O envio de
              documentos para análise não substitui a obrigação de manter tudo regular fora da
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Conduta e segurança</h2>
            <p>
              Compromete-se a respeitar as leis de trânsito e de proteção infantil, as normas das
              escolas e um trato respeitoso com crianças, adolescentes e responsáveis. Conteúdo ofensivo,
              discriminatório ou ilícito em perfil ou comunicações pode resultar na remoção imediata do
              cadastro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Limitação de responsabilidade da plataforma</h2>
            <p>
              Na medida permitida pela lei aplicável, o Alô Tio não se responsabiliza por danos
              decorrentes de informações incorretas fornecidas por transportadores, por disputas entre
              transportador e família, nem por indisponibilidade pontual do serviço online.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Aceite</h2>
            <p>
              Ao marcar a opção de aceite no cadastro ou ao confirmar no aviso exibido após o login,
              você declara ter lido e compreendido estes termos e assumir integralmente a
              responsabilidade pelas suas informações e pela legalidade do seu serviço de transporte
              escolar.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

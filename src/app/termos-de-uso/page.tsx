import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Regras gerais para utilização da plataforma Alô Tio.',
};

export default function TermosDeUsoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="mt-2 text-sm text-gray-500">Última atualização: 2 de setembro de 2026</p>
        <div className="mt-8 space-y-8 rounded-lg border border-gray-200 bg-white p-6 leading-7 text-gray-700 sm:p-10">
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">1. Finalidade</h2>
            <p className="mt-3">
              O Alô Tio facilita a divulgação e a busca de profissionais de transporte escolar e
              de serviços relacionados. Não somos transportadora, empregadora, representante ou
              parte dos contratos firmados entre usuários.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">2. Responsabilidade dos usuários</h2>
            <p className="mt-3">
              Você deve fornecer informações verdadeiras, manter sua conta protegida e usar a
              plataforma de forma lícita. É proibido publicar conteúdo falso, ofensivo, ilegal,
              discriminatório, que viole direitos de terceiros ou tente manipular avaliações.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">3. Contratação e segurança</h2>
            <p className="mt-3">
              Pais e responsáveis devem verificar diretamente as credenciais, autorizações,
              veículo, seguro e referências do profissional. Transportadores são responsáveis por
              licenças, informações do perfil, qualidade e execução de seus serviços.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">4. Conteúdo e moderação</h2>
            <p className="mt-3">
              Podemos analisar, recusar, ocultar ou remover perfis, avaliações e conteúdos que
              violem estes termos, a legislação ou a segurança da plataforma. A análise de
              documentos não constitui garantia sobre a conduta futura ou a qualidade do serviço.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">5. Disponibilidade</h2>
            <p className="mt-3">
              Buscamos manter informações e serviços disponíveis, mas não garantimos operação
              ininterrupta nem a exatidão de conteúdo fornecido por terceiros. Funcionalidades
              podem ser alteradas ou descontinuadas mediante necessidade técnica ou legal.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">6. Privacidade e contato</h2>
            <p className="mt-3">
              O tratamento de dados segue a Política de Privacidade. Para dúvidas, denúncias ou
              solicitações, use contato@alotio.com.br.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
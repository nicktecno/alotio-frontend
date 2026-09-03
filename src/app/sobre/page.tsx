import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sobre o Alô Tio',
  description: 'Conheça a finalidade e o funcionamento da plataforma Alô Tio.',
};

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Sobre o Alô Tio</h1>
        <div className="mt-8 space-y-7 rounded-lg border border-gray-200 bg-white p-6 leading-7 text-gray-700 sm:p-10">
          <p>
            O Alô Tio é uma plataforma brasileira de busca e divulgação de profissionais de
            transporte escolar. Nosso objetivo é facilitar o primeiro contato entre famílias e
            condutores que atendem escolas, cidades e bairros específicos.
          </p>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">Como funciona</h2>
            <p className="mt-3">
              Profissionais criam perfis e informam suas áreas de atendimento. Pais e responsáveis
              pesquisam gratuitamente e entram em contato diretamente com os profissionais. O Alô
              Tio não realiza o transporte nem participa da contratação.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">Escolha responsável</h2>
            <p className="mt-3">
              Antes de contratar, confirme autorizações, habilitação, documentação do veículo,
              seguro, referências e requisitos do órgão de trânsito e do município. A presença de
              um perfil na plataforma não substitui essas verificações.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">Contato editorial</h2>
            <p className="mt-3">
              Dúvidas, correções ou solicitações podem ser enviadas para{' '}
              <a href="mailto:contato@alotio.com.br" className="font-medium text-primary hover:underline">
                contato@alotio.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
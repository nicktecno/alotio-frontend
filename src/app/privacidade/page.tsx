import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como o Alô Tio coleta, usa, compartilha e protege dados pessoais.',
};

const sections = [
  {
    title: '1. Quem somos',
    content:
      'O Alô Tio é uma plataforma que aproxima pais e responsáveis de profissionais de transporte escolar e disponibiliza recursos para perfis, escolas, avaliações, contato e serviços relacionados. Para assuntos de privacidade, escreva para contato@alotio.com.br.',
  },
  {
    title: '2. Dados que tratamos',
    content:
      'Podemos tratar dados fornecidos por você, como nome, e-mail, telefone, mensagem de contato, dados de perfil, escolas e regiões atendidas, fotos e documentos enviados para análise. Também recebemos dados técnicos, como endereço IP, navegador, dispositivo, páginas acessadas e registros de uso, quando permitido.',
  },
  {
    title: '3. Finalidades e bases legais',
    content:
      'Usamos os dados para criar e administrar contas, publicar perfis, facilitar contatos, analisar documentos, responder solicitações, prevenir fraudes, proteger a plataforma, cumprir obrigações legais e melhorar nossos serviços. O tratamento ocorre conforme a execução do serviço, o cumprimento de obrigação legal, o legítimo interesse ou o consentimento, conforme aplicável.',
  },
  {
    title: '4. Google, cookies e publicidade',
    content:
      'Com sua autorização, usamos Google Analytics para medir o uso do site e Google AdSense para exibir anúncios. Esses serviços podem usar cookies, web beacons, endereços IP e outros identificadores, e terceiros podem inserir ou ler cookies no seu navegador. Você pode aceitar ou recusar cookies opcionais no aviso do site e alterar sua escolha em “Preferências de cookies” no rodapé.',
  },
  {
    title: '5. Compartilhamento',
    content:
      'Compartilhamos dados somente quando necessário com provedores que apoiam hospedagem, armazenamento, e-mail, análise, publicidade e segurança, ou quando exigido por lei. Informações escolhidas para um perfil público podem ser vistas pelos visitantes. Não vendemos dados pessoais.',
  },
  {
    title: '6. Retenção e segurança',
    content:
      'Mantemos dados pelo período necessário às finalidades descritas, ao funcionamento da conta e ao cumprimento de prazos legais. Aplicamos medidas técnicas e administrativas razoáveis, embora nenhum sistema seja totalmente imune a incidentes.',
  },
  {
    title: '7. Seus direitos',
    content:
      'Nos termos da LGPD, você pode solicitar confirmação do tratamento, acesso, correção, portabilidade, informação sobre compartilhamentos, anonimização, bloqueio, exclusão e revogação do consentimento, quando aplicável. Envie a solicitação para contato@alotio.com.br; poderemos confirmar sua identidade antes de atendê-la.',
  },
  {
    title: '8. Crianças e adolescentes',
    content:
      'A plataforma é destinada a adultos responsáveis e profissionais. Não solicitamos que crianças criem contas ou forneçam dados diretamente. Pais e responsáveis devem evitar inserir dados pessoais desnecessários de menores nos campos livres.',
  },
  {
    title: '9. Atualizações',
    content:
      'Esta política pode ser atualizada para refletir mudanças legais ou no serviço. A versão vigente será publicada nesta página com a data de atualização.',
  },
];

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-gray-500">Última atualização: 2 de setembro de 2026</p>
        <div className="mt-8 space-y-8 rounded-lg border border-gray-200 bg-white p-6 sm:p-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-bold text-gray-900">{section.title}</h2>
              <p className="mt-3 leading-7 text-gray-700">{section.content}</p>
            </section>
          ))}
          <section>
            <h2 className="font-heading text-xl font-bold text-gray-900">10. Informações do Google</h2>
            <p className="mt-3 leading-7 text-gray-700">
              Consulte também{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites?hl=pt-BR"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                como o Google usa informações de sites que utilizam seus serviços
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
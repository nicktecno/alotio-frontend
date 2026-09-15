import Link from 'next/link';
import MonthlyFeeCalculator from '@/components/MonthlyFeeCalculator';
import DigitalCardGenerator from '@/components/DigitalCardGenerator';

export default function HomeToolsSection() {
  return (
    <section
      id="ferramentas-transportador"
      className="py-16 sm:py-20 bg-gradient-to-b from-white to-primary/5 border-y border-primary/10"
      aria-labelledby="home-tools-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-700">
            Ferramentas gratuitas
          </span>
          <h2
            id="home-tools-heading"
            className="mt-3 font-heading text-3xl sm:text-4xl font-bold text-primary-900 leading-tight"
          >
            Ferramentas para o condutor escolar
          </h2>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed">
            Precifique sua rota e divulgue seu serviço com cartão digital — tudo grátis no{' '}
            <strong>Alô Tio</strong>. Ideal para <strong>van escolar</strong>, perua e{' '}
            <strong>transporte escolar</strong> em qualquer cidade.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/ferramentas/calculadora-mensalidade"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Calculadora completa
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/ferramentas/cartao-digital"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Cartão digital completo
            </Link>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <div className="flex flex-col">
            <h3 className="font-heading text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🧮</span>
              Quanto cobrar na mensalidade?
            </h3>
            <div className="flex-1">
              <MonthlyFeeCalculator variant="compact" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-heading text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl" aria-hidden>💳</span>
              Cartão para Instagram e WhatsApp
            </h3>
            <div className="flex-1">
              <DigitalCardGenerator variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

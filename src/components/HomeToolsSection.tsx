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
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-secondary-700">
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

          {/* Destaque principal para as chamadas das ferramentas completas */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/ferramentas/calculadora-mensalidade"
              className="group relative flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-primary/20 hover:border-primary shadow-md hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center text-2xl transition shrink-0">
                🧮
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Simulação Avançada</span>
                <p className="font-heading font-bold text-gray-900 group-hover:text-primary transition text-base leading-tight">
                  Abrir Calculadora Completa
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">Custos detalhados e ponto de equilíbrio</p>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition text-lg font-bold shrink-0">
                →
              </span>
            </Link>

            <Link
              href="/ferramentas/cartao-digital"
              className="group relative flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-secondary/30 hover:border-secondary shadow-md hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary-700 group-hover:bg-secondary group-hover:text-white flex items-center justify-center text-2xl transition shrink-0">
                💳
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-700">Com Foto e Formatos</span>
                <p className="font-heading font-bold text-gray-900 group-hover:text-secondary-700 transition text-base leading-tight">
                  Abrir Gerador de Cartão Completo
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">Artes para WhatsApp e Instagram</p>
              </div>
              <span className="text-secondary-700 group-hover:translate-x-1 transition text-lg font-bold shrink-0">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Card Calculadora */}
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="font-heading text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl" aria-hidden>🧮</span>
                Quanto cobrar na mensalidade?
              </h3>
              <Link
                href="/ferramentas/calculadora-mensalidade"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-full transition w-fit border border-primary/20 shadow-sm"
              >
                <span>Abrir calculadora completa</span>
                <span>→</span>
              </Link>
            </div>
            <div className="flex-1">
              <MonthlyFeeCalculator variant="compact" />
            </div>
            <div className="mt-3.5 text-center">
              <Link
                href="/ferramentas/calculadora-mensalidade"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white shadow-sm transition"
              >
                <span>💡 Quer simular custos completos e margem de lucro?</span>
                <span className="underline font-bold">Abrir Calculadora Completa →</span>
              </Link>
            </div>
          </div>

          {/* Card Cartão Digital */}
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="font-heading text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl" aria-hidden>💳</span>
                Cartão para Instagram e WhatsApp
              </h3>
              <Link
                href="/ferramentas/cartao-digital"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-800 hover:text-white bg-secondary/15 hover:bg-secondary px-3 py-1.5 rounded-full transition w-fit border border-secondary/30 shadow-sm"
              >
                <span>Abrir gerador completo</span>
                <span>→</span>
              </Link>
            </div>
            <div className="flex-1">
              <DigitalCardGenerator variant="compact" />
            </div>
            <div className="mt-3.5 text-center">
              <Link
                href="/ferramentas/cartao-digital"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-secondary/30 px-4 py-2 text-sm font-semibold text-secondary-800 hover:bg-secondary hover:text-white shadow-sm transition"
              >
                <span>🎨 Personalize com a foto da sua van e logomarca:</span>
                <span className="underline font-bold">Abrir Gerador Completo →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

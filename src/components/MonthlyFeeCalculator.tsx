'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DEFAULT_PRICING_INPUTS,
  calculateMonthlyFee,
  formatBrl,
  type PricingInputs,
} from '@/lib/pricing-calculator';

type Props = {
  /** Versão compacta para a home; completa na página dedicada. */
  variant?: 'compact' | 'full';
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block h-full">
      <span className="text-sm font-semibold text-gray-800 leading-snug">{label}</span>
      <span
        className={`mt-0.5 block min-h-[2rem] text-xs leading-snug ${
          hint ? 'text-gray-500' : 'text-transparent'
        }`}
        aria-hidden={!hint}
      >
        {hint || 'Reservado para alinhar campos'}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function MonthlyFeeCalculator({ variant = 'full' }: Props) {
  const [inputs, setInputs] = useState<PricingInputs>(DEFAULT_PRICING_INPUTS);

  const result = useMemo(() => calculateMonthlyFee(inputs), [inputs]);

  const setNum = (key: keyof PricingInputs, raw: string) => {
    const n = parseFloat(raw.replace(',', '.'));
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
  };

  const compact = variant === 'compact';

  return (
    <div
      className={
        compact
          ? 'rounded-2xl border border-secondary/30 bg-white shadow-xl overflow-hidden'
          : 'rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden'
      }
    >
      <div
        className={
          compact
            ? 'bg-gradient-to-r from-secondary to-secondary-600 px-5 py-4 sm:px-6'
            : 'bg-primary px-6 py-5'
        }
      >
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          Ferramenta gratuita
        </p>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mt-1">
          Calculadora de mensalidade
        </h3>
        <p className="text-sm text-white/90 mt-1 max-w-xl">
          Descubra quanto cobrar por assento com base nos seus custos reais de van escolar.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-0">
        <div className="p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <Field label="Km rodados por mês" hint="Ida + volta × dias úteis">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={inputs.monthlyKm}
                onChange={(e) => setNum('monthlyKm', e.target.value)}
              />
            </Field>
            <Field label="Consumo (km/L)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                className={inputClass}
                value={inputs.fuelConsumptionKmPerL}
                onChange={(e) => setNum('fuelConsumptionKmPerL', e.target.value)}
              />
            </Field>
            <Field label="Combustível (R$/L)">
              <input
                type="number"
                min={0}
                step={0.01}
                className={inputClass}
                value={inputs.fuelPricePerL}
                onChange={(e) => setNum('fuelPricePerL', e.target.value)}
              />
            </Field>
            <Field label="Assentos ocupados">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={inputs.occupiedSeats}
                onChange={(e) => setNum('occupiedSeats', e.target.value)}
              />
            </Field>
            {!compact && (
              <>
                <Field label="Manutenção mensal (R$)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={inputs.maintenanceMonthly}
                    onChange={(e) => setNum('maintenanceMonthly', e.target.value)}
                  />
                </Field>
                <Field label="Seguro / proteção (R$)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={inputs.insuranceMonthly}
                    onChange={(e) => setNum('insuranceMonthly', e.target.value)}
                  />
                </Field>
                <Field label="Monitor(a) (R$)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={inputs.monitorSalary}
                    onChange={(e) => setNum('monitorSalary', e.target.value)}
                  />
                </Field>
                <Field label="Outros custos fixos (R$)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={inputs.otherFixedMonthly}
                    onChange={(e) => setNum('otherFixedMonthly', e.target.value)}
                  />
                </Field>
              </>
            )}
          </div>

          <Field
            label={`Margem de lucro desejada (${inputs.profitMarginPercent}%)`}
            hint="Quanto você quer ganhar acima do custo"
          >
            <input
              type="range"
              min={0}
              max={60}
              step={1}
              className="w-full accent-secondary"
              value={inputs.profitMarginPercent}
              onChange={(e) => setNum('profitMarginPercent', e.target.value)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>30%</span>
              <span>60%</span>
            </div>
          </Field>

          {compact && (
            <p className="text-xs text-gray-500">
              <Link
                href="/ferramentas/calculadora-mensalidade"
                className="text-primary font-semibold hover:underline"
              >
                Abrir calculadora completa
              </Link>
              {' '}
              com manutenção, seguro e mais detalhes.
            </p>
          )}
        </div>

        <div className="p-5 sm:p-6 bg-gray-50 flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Mensalidade sugerida por assento
            </p>
            <p className="font-heading text-4xl sm:text-5xl font-extrabold text-secondary mt-2">
              {formatBrl(result.suggestedPerSeat)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Ponto de equilíbrio:{' '}
              <strong className="text-gray-800">{formatBrl(result.breakEvenPerSeat)}</strong>
              /assento
            </p>
          </div>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
              <dt className="text-gray-600">Combustível/mês</dt>
              <dd className="font-semibold text-gray-900">{formatBrl(result.fuelMonthly)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
              <dt className="text-gray-600">Custo total/mês</dt>
              <dd className="font-semibold text-gray-900">{formatBrl(result.totalCost)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
              <dt className="text-gray-600">Receita sugerida/mês</dt>
              <dd className="font-semibold text-primary">{formatBrl(result.suggestedMonthlyRevenue)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Lucro estimado/assento</dt>
              <dd className="font-semibold text-secondary">{formatBrl(result.profitPerSeat)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/cadastro"
              className="flex-1 text-center bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
            >
              Cadastrar e salvar simulação
            </Link>
            {!compact && (
              <Link
                href="/seguro"
                className="flex-1 text-center border border-orange-300 bg-orange-50 text-orange-900 hover:bg-orange-100 font-bold py-3 px-4 rounded-lg transition text-sm"
              >
                Ver proteção veicular
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

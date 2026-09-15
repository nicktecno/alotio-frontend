export type PricingInputs = {
  monthlyKm: number;
  fuelConsumptionKmPerL: number;
  fuelPricePerL: number;
  maintenanceMonthly: number;
  insuranceMonthly: number;
  monitorSalary: number;
  otherFixedMonthly: number;
  occupiedSeats: number;
  profitMarginPercent: number;
};

export type PricingResult = {
  fuelMonthly: number;
  totalCost: number;
  breakEvenPerSeat: number;
  suggestedPerSeat: number;
  suggestedMonthlyRevenue: number;
  profitPerSeat: number;
};

export const DEFAULT_PRICING_INPUTS: PricingInputs = {
  monthlyKm: 1800,
  fuelConsumptionKmPerL: 8,
  fuelPricePerL: 6.2,
  maintenanceMonthly: 800,
  insuranceMonthly: 300,
  monitorSalary: 0,
  otherFixedMonthly: 200,
  occupiedSeats: 14,
  profitMarginPercent: 25,
};

export function calculateMonthlyFee(inputs: PricingInputs): PricingResult {
  const seats = Math.max(1, inputs.occupiedSeats);
  const consumption = Math.max(0.1, inputs.fuelConsumptionKmPerL);
  const fuelMonthly =
    (Math.max(0, inputs.monthlyKm) / consumption) *
    Math.max(0, inputs.fuelPricePerL);

  const totalCost =
    fuelMonthly +
    Math.max(0, inputs.maintenanceMonthly) +
    Math.max(0, inputs.insuranceMonthly) +
    Math.max(0, inputs.monitorSalary) +
    Math.max(0, inputs.otherFixedMonthly);

  const breakEvenPerSeat = totalCost / seats;
  const margin = Math.max(0, inputs.profitMarginPercent) / 100;
  const suggestedPerSeat = breakEvenPerSeat * (1 + margin);
  const profitPerSeat = suggestedPerSeat - breakEvenPerSeat;

  return {
    fuelMonthly,
    totalCost,
    breakEvenPerSeat,
    suggestedPerSeat,
    suggestedMonthlyRevenue: suggestedPerSeat * seats,
    profitPerSeat,
  };
}

export function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

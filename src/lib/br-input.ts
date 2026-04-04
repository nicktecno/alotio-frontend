/** Apenas dígitos, limitado a `max` caracteres. */
export function digitsOnly(value: string, max?: number): string {
  let d = value.replace(/\D/g, '');
  if (max != null) d = d.slice(0, max);
  return d;
}

/** Formata CNPJ: 00.000.000/0000-00 */
export function formatCnpjMask(digits: string): string {
  const d = digitsOnly(digits, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Formata CPF: 000.000.000-00 */
export function formatCpfMask(digits: string): string {
  const d = digitsOnly(digits, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  if (d.length <= 3) return p1;
  if (d.length <= 6) return `${p1}.${p2}`;
  if (d.length <= 9) return `${p1}.${p2}.${p3}`;
  return `${p1}.${p2}.${p3}-${p4}`;
}

/** Celular BR: (DD) 9XXXX-XXXX — 11 dígitos com DDD */
export function formatBrazilMobileMask(digits: string): string {
  const d = digitsOnly(digits, 11);
  if (d.length === 0) return '';
  const ddd = d.slice(0, 2);
  if (d.length <= 2) return `(${ddd}`;
  const rest = d.slice(2);
  if (rest.length <= 5) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/** RG: letras e números, tamanho razoável */
export function sanitizeRg(value: string): string {
  return value.replace(/[^0-9A-Za-z.\-]/g, '').slice(0, 14);
}

/** Valida dígitos verificadores do CPF (11 dígitos). */
export function isValidCpfDigits(digits11: string): boolean {
  const cpf = digitsOnly(digits11, 11);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i), 10) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9), 10)) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i), 10) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10), 10);
}

/**
 * Entrada de valor em reais: usuário digita apenas números; interpretamos como centavos
 * (ex.: digitar 1 8 0 0 0 → R$ 180,00).
 */
export function parseMoneyDigitsToCents(digits: string): number {
  const d = digitsOnly(digits, 12);
  if (!d) return 0;
  return Math.min(parseInt(d, 10), 999_999_999_999);
}

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

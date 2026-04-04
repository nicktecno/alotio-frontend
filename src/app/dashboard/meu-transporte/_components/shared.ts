export interface ServedParentRow {
  id: string;
  fullName: string;
  whatsappPhone: string;
  city: { name: string };
  neighborhood: { name: string };
}

export interface ContractRow {
  id: string;
  status: string;
  servedParentId: string;
  installmentCount: number;
  installmentValueCents: number;
  tioSignedAt?: string | null;
  parentAcceptedAt?: string | null;
}

export const CONTRACT_STATUS_PT: Record<string, string> = {
  DRAFT: 'Rascunho',
  TIO_SIGNED: 'Você assinou — aguardando o pai',
  AWAITING_PARENT: 'Aguardando assinatura do pai',
  COMPLETED: 'Concluído — pai aceitou',
};

export const RECEIPT_MONTHS_PT: { value: number; label: string }[] = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export function receiptYearOptions(): number[] {
  const y = new Date().getFullYear();
  return [y - 2, y - 1, y, y + 1];
}

export function formatAcceptedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

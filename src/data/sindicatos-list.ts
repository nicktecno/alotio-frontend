import sindicatosJson from './sindicatos-associacoes.json';
import type { ContactItem, ContactListGroup } from './preloaded-contact-lists';

export interface SindicatoContactItem extends ContactItem {
  sigla?: string;
  tipo?: 'sindicato' | 'associacao' | 'cooperativa' | 'federacao';
  uf?: string;
  telefoneFixo?: string;
  email?: string;
  website?: string;
  responsavel?: string;
  endereco?: string;
  cnpj?: string;
  observacoes?: string;
}

export const SINDICATOS_LIST: SindicatoContactItem[] = sindicatosJson as SindicatoContactItem[];

export const SINDICATOS_CONTACT_GROUP: ContactListGroup = {
  id: 'sindicatos-associacoes',
  title: '🏛️ Sindicatos & Associações Brasil (' + SINDICATOS_LIST.length + ')',
  description: 'Sindicatos, associações e cooperativas de transporte escolar em cidades cadastradas no Alô Tio',
  hasCredentials: false,
  contacts: SINDICATOS_LIST,
};

export function findSindicatoByIdOrSlug(slugOrId: string): SindicatoContactItem | undefined {
  if (!slugOrId) return undefined;
  const target = decodeURIComponent(slugOrId).trim().toLowerCase();
  return SINDICATOS_LIST.find((s) => {
    if (s.id.toLowerCase() === target) return true;
    if (s.sigla && s.sigla.toLowerCase() === target) return true;
    const nameSlug = s.nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (nameSlug === target) return true;
    return false;
  });
}


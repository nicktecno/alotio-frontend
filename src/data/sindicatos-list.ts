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

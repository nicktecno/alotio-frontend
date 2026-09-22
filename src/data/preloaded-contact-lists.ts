import preloadedJson from './preloaded-contact-lists.json';

export interface ContactItem {
  id: string;
  nome: string;
  telefone: string;
  telefoneRaw: string;
  telefoneValido: boolean;
  usuario?: string;
  senha?: string;
  prefixo?: string;
  cidade?: string;
  source?: string;
}

export interface ContactListGroup {
  id: string;
  title: string;
  description: string;
  hasCredentials: boolean;
  contacts: ContactItem[];
}

export const PRELOADED_CONTACT_LISTS: ContactListGroup[] = preloadedJson as ContactListGroup[];

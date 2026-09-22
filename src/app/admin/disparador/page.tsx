'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PRELOADED_CONTACT_LISTS,
  type ContactItem,
  type ContactListGroup,
} from '@/data/preloaded-contact-lists';
import toast from 'react-hot-toast';

type ContactStatus = 'pending' | 'sent' | 'skipped';

interface ContactProgress {
  [contactId: string]: {
    status: ContactStatus;
    sentAt?: string;
    channel?: 'sms' | 'whatsapp' | 'manual';
  };
}

const MESSAGE_FOOTER =
  ' Este cadastro foi feito para acelerar o processo da plataforma e é gratuito.';

const TEMPLATE_PRESETS = [
  {
    id: 'credentials',
    name: 'Acesso com Login e Senha (Recomendado)',
    text:
      'Olá {nome}! Seu perfil no Alô Tio está ativo para pais encontrarem seu transporte escolar. Acesse https://alotio.com.br/login com Login (seu telefone): {usuario} e Senha: {senha}. Qualquer dúvida estamos à disposição!',
  },
  {
    id: 'santos-divulgacao',
    name: 'Divulgação Geral (sem senha)',
    text:
      'Olá {nome}! Seu cadastro de transporte escolar no Alô Tio já está no ar para famílias da sua região encontrarem suas rotas. Confira em https://alotio.com.br/tios - Dúvidas no WhatsApp (13) 99107-8953.',
  },
  {
    id: 'short-sms',
    name: 'SMS Curto (Até 160 caracteres)',
    text:
      'Ola {nome}! Alo Tio: https://alotio.com.br/login Login (telefone): {usuario} Senha: {senha}.',
  },
  {
    id: 'vagas-ano',
    name: 'Atualização de Vagas e Escolas',
    text:
      'Olá {nome}! Atualize seu perfil no Alô Tio: https://alotio.com.br/login Login (telefone): {usuario} Senha: {senha}.',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    text:
      'Olá {nome}! Acesse https://alotio.com.br/login — Login (telefone): {usuario} | Senha: {senha}',
  },
];

/** Login exibido na mensagem: telefone com DDD (só dígitos), mais fácil que e-mail. */
function loginForContact(contact: ContactItem): string {
  const phoneInfo = cleanPhoneForDispatch(contact.telefoneRaw || contact.telefone);
  if (phoneInfo.digits) return phoneInfo.digits;
  return String(contact.telefone || '').replace(/\D/g, '');
}

function channelLabel(channel?: 'sms' | 'whatsapp' | 'manual'): string {
  if (channel === 'sms') return 'SMS';
  if (channel === 'whatsapp') return 'WhatsApp';
  if (channel === 'manual') return 'Manual';
  return '—';
}

function formatSentAt(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function cleanPhoneForDispatch(raw: string): { digits: string; formatted: string; isValid: boolean } {
  if (!raw) return { digits: '', formatted: '', isValid: false };
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) {
    d = d.slice(2);
  }
  const isValid = d.length >= 10 && d.length <= 11;
  let formatted = raw;
  if (d.length === 11) {
    formatted = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  } else if (d.length === 10) {
    formatted = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return { digits: d, formatted, isValid };
}

export default function AdminDisparadorPage() {
  const [activeTab, setActiveTab] = useState<
    'queue' | 'table' | 'history' | 'template' | 'import'
  >('queue');
  const [selectedListId, setSelectedListId] = useState<string>('todos-senhas');
  const [customList, setCustomList] = useState<ContactListGroup | null>(null);

  // Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('credentials');
  const [customTemplateText, setCustomTemplateText] = useState<string>(TEMPLATE_PRESETS[0].text);

  // Progress state stored in localStorage per list
  const [progress, setProgress] = useState<ContactProgress>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Search and filter for table tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'skipped'>('all');

  // Import raw text state
  const [importText, setImportText] = useState('');
  const [importTitle, setImportTitle] = useState('Minha Lista Importada');

  // All available lists (preloaded + custom if exists)
  const allLists = useMemo(() => {
    if (customList) {
      return [...PRELOADED_CONTACT_LISTS, customList];
    }
    return PRELOADED_CONTACT_LISTS;
  }, [customList]);

  // Current active list
  const currentList = useMemo(() => {
    return allLists.find((l) => l.id === selectedListId) || allLists[0];
  }, [allLists, selectedListId]);

  // Load custom list and progress from localStorage on mount or list change
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem('alotio_disparador_custom_list');
      if (savedCustom) {
        setCustomList(JSON.parse(savedCustom));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(`alotio_disparador_prog_${selectedListId}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        setProgress({});
      }

      const savedIdx = localStorage.getItem(`alotio_disparador_idx_${selectedListId}`);
      if (savedIdx) {
        setCurrentIndex(Math.max(0, parseInt(savedIdx, 10) || 0));
      } else {
        setCurrentIndex(0);
      }
    } catch {
      setProgress({});
      setCurrentIndex(0);
    }
  }, [selectedListId]);

  // Auto-select template based on list capabilities
  useEffect(() => {
    if (!currentList.hasCredentials) {
      setSelectedTemplateId('santos-divulgacao');
    } else {
      setSelectedTemplateId((id) => (id === 'santos-divulgacao' ? 'credentials' : id));
    }
  }, [currentList.id, currentList.hasCredentials]);

  useEffect(() => {
    if (selectedTemplateId === 'custom') return;
    const preset = TEMPLATE_PRESETS.find((p) => p.id === selectedTemplateId);
    if (preset) setCustomTemplateText(preset.text);
  }, [selectedTemplateId]);

  // Save progress helper
  const persistProgress = useCallback(
    (next: ContactProgress) => {
      try {
        localStorage.setItem(`alotio_disparador_prog_${selectedListId}`, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [selectedListId],
  );

  const updateContactStatus = useCallback(
    (contactId: string, status: ContactStatus, channel?: 'sms' | 'whatsapp' | 'manual') => {
      setProgress((prev) => {
        const next: ContactProgress = {
          ...prev,
          [contactId]: {
            status,
            sentAt: status === 'sent' ? new Date().toISOString() : undefined,
            channel: status === 'sent' ? channel : undefined,
          },
        };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress],
  );

  /** Volta contato enviado (ou pulado) para a fila — ex.: falha no envio. */
  const restoreContactToQueue = useCallback(
    (contactId: string) => {
      setProgress((prev) => {
        const next = { ...prev };
        delete next[contactId];
        persistProgress(next);
        return next;
      });
      toast.success('Contato restaurado na fila.');
    },
    [persistProgress],
  );

  /** Fila ativa: enviados saem da lista definitivamente. */
  const queueContacts = useMemo(() => {
    return currentList.contacts.filter((c) => progress[c.id]?.status !== 'sent');
  }, [currentList.contacts, progress]);

  const saveCurrentIndex = useCallback(
    (idx: number) => {
      const maxIdx = Math.max(0, queueContacts.length - 1);
      const clamped = Math.max(0, Math.min(idx, maxIdx));
      setCurrentIndex(clamped);
      try {
        localStorage.setItem(`alotio_disparador_idx_${selectedListId}`, String(clamped));
      } catch {
        /* ignore */
      }
    },
    [queueContacts.length, selectedListId],
  );

  useEffect(() => {
    if (queueContacts.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }
    if (currentIndex >= queueContacts.length) {
      saveCurrentIndex(queueContacts.length - 1);
    }
  }, [queueContacts.length, currentIndex, saveCurrentIndex]);

  // Statistics
  const stats = useMemo(() => {
    const total = currentList.contacts.length;
    let sent = 0;
    let skipped = 0;
    for (const c of currentList.contacts) {
      const p = progress[c.id];
      if (p?.status === 'sent') sent++;
      else if (p?.status === 'skipped') skipped++;
    }
    const remaining = queueContacts.length;
    const pending = queueContacts.filter(
      (c) => !progress[c.id] || progress[c.id]?.status === 'pending',
    ).length;
    const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { total, sent, skipped, pending, remaining, percent };
  }, [currentList.contacts, progress, queueContacts]);

  const sentHistory = useMemo(() => {
    return currentList.contacts
      .filter((c) => progress[c.id]?.status === 'sent')
      .map((contact) => ({
        contact,
        meta: progress[contact.id]!,
      }))
      .sort((a, b) => (b.meta.sentAt || '').localeCompare(a.meta.sentAt || ''));
  }, [currentList.contacts, progress]);

  const filteredSentHistory = useMemo(() => {
    if (!searchQuery) return sentHistory;
    const q = searchQuery.toLowerCase();
    return sentHistory.filter(
      ({ contact }) =>
        contact.nome.toLowerCase().includes(q) ||
        contact.telefone.includes(q) ||
        loginForContact(contact).includes(q),
    );
  }, [sentHistory, searchQuery]);

  // Current contact (somente na fila, sem enviados)
  const currentContact: ContactItem | undefined = queueContacts[currentIndex];
  const currentContactStatus: ContactStatus = currentContact
    ? progress[currentContact.id]?.status || 'pending'
    : 'pending';

  // Format message text with variables
  const formatMessage = useCallback(
    (template: string, contact?: ContactItem): string => {
      if (!contact) return '';
      let text = template;
      const login = loginForContact(contact);
      text = text.replace(/{nome}/g, contact.nome || 'Transportador(a)');
      text = text.replace(/{telefone}/g, contact.telefone || '');
      text = text.replace(/{usuario}/g, login || '(seu telefone)');
      text = text.replace(/{senha}/g, contact.senha || '(sua senha)');
      text = text.replace(/{prefixo}/g, contact.prefixo || '');
      text = text.replace(/{cidade}/g, contact.cidade || '');
      text = text.replace(/{link}/g, 'https://alotio.com.br/login');
      if (!text.includes('cadastro foi feito para acelerar')) {
        text += MESSAGE_FOOTER;
      }
      return text;
    },
    [],
  );

  const activeMessageText = useMemo(() => {
    return formatMessage(customTemplateText, currentContact);
  }, [customTemplateText, currentContact, formatMessage]);

  // Action: Open native SMS
  const handleOpenSms = () => {
    if (!currentContact) return;
    const phoneInfo = cleanPhoneForDispatch(currentContact.telefoneRaw || currentContact.telefone);
    if (!phoneInfo.isValid) {
      toast.error('Telefone inválido para envio de SMS');
      return;
    }

    // iOS Safari expects "&body=", Android Chrome expects "?body="
    const isIOS =
      typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const targetUrl = `sms:+55${phoneInfo.digits}${separator}body=${encodeURIComponent(activeMessageText)}`;

    window.location.href = targetUrl;

    if (autoAdvance) {
      updateContactStatus(currentContact.id, 'sent', 'sms');
      toast.success('SMS aberto! Contato removido da fila.', { duration: 2500 });
    }
  };

  // Action: Open WhatsApp
  const handleOpenWhatsApp = () => {
    if (!currentContact) return;
    const phoneInfo = cleanPhoneForDispatch(currentContact.telefoneRaw || currentContact.telefone);
    if (!phoneInfo.isValid) {
      toast.error('Telefone inválido para envio de WhatsApp');
      return;
    }

    const targetUrl = `https://wa.me/55${phoneInfo.digits}?text=${encodeURIComponent(activeMessageText)}`;
    window.open(targetUrl, '_blank');

    if (autoAdvance) {
      updateContactStatus(currentContact.id, 'sent', 'whatsapp');
      toast.success('WhatsApp aberto! Contato removido da fila.', { duration: 2500 });
    }
  };

  // Action: Mark sent manually & advance
  const handleMarkSent = () => {
    if (!currentContact) return;
    updateContactStatus(currentContact.id, 'sent', 'manual');
    toast.success('Enviado! Removido da fila.');
  };

  // Action: Skip contact
  const handleSkip = () => {
    if (!currentContact) return;
    updateContactStatus(currentContact.id, 'skipped');
    if (currentIndex < queueContacts.length - 1) {
      saveCurrentIndex(currentIndex + 1);
    }
    toast('Contato pulado', { icon: '⏭️' });
  };

  // Action: Reset progress for this list
  const handleResetProgress = () => {
    if (window.confirm(`Deseja zerar todo o progresso da lista "${currentList.title}"?`)) {
      setProgress({});
      setCurrentIndex(0);
      try {
        localStorage.removeItem(`alotio_disparador_prog_${selectedListId}`);
        localStorage.removeItem(`alotio_disparador_idx_${selectedListId}`);
      } catch {
        /* ignore */
      }
      toast.success('Progresso zerado!');
    }
  };

  // Action: Parse pasted text or CSV
  const handleProcessImport = () => {
    if (!importText.trim()) {
      toast.error('Cole um texto ou lista com contatos.');
      return;
    }

    const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedContacts: ContactItem[] = [];

    lines.forEach((line, i) => {
      // support tab or comma or semicolon
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split(';');
      if (parts.length < 2) parts = line.split(',');

      const cleanParts = parts.map((p) => p.replace(/^["']|["']$/g, '').trim());
      const nome = cleanParts[0] || `Contato ${i + 1}`;
      const tel = cleanParts[1] || '';
      const usuario = cleanParts[2] || '';
      const senha = cleanParts[3] || '';

      if (tel) {
        const phone = cleanPhoneForDispatch(tel);
        parsedContacts.push({
          id: `custom-${Date.now()}-${i}`,
          nome,
          telefone: phone.formatted || tel,
          telefoneRaw: phone.digits ? `55${phone.digits}` : tel,
          telefoneValido: phone.isValid,
          usuario: usuario || phone.digits,
          senha,
        });
      }
    });

    if (parsedContacts.length === 0) {
      toast.error('Nenhum telefone reconhecido. Verifique o formato (Nome, Telefone, Usuário, Senha).');
      return;
    }

    const newCustom: ContactListGroup = {
      id: `custom-${Date.now()}`,
      title: importTitle || 'Lista Personalizada',
      description: `${parsedContacts.length} contatos importados via texto/CSV`,
      hasCredentials: parsedContacts.some((c) => !!c.senha),
      contacts: parsedContacts,
    };

    setCustomList(newCustom);
    setSelectedListId(newCustom.id);
    try {
      localStorage.setItem('alotio_disparador_custom_list', JSON.stringify(newCustom));
    } catch {
      /* ignore */
    }

    toast.success(`${parsedContacts.length} contatos importados com sucesso!`);
    setActiveTab('queue');
  };

  // Filtered contacts for the table view
  const filteredContacts = useMemo(() => {
    return currentList.contacts.filter((c) => {
      const p = progress[c.id];
      const status = p?.status || 'pending';
      if (statusFilter === 'all' && status === 'sent') return false;
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.nome.toLowerCase().includes(q) ||
          c.telefone.includes(q) ||
          (c.usuario && c.usuario.toLowerCase().includes(q)) ||
          (c.prefixo && c.prefixo.includes(q))
        );
      }
      return true;
    });
  }, [currentList.contacts, progress, statusFilter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📲</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading">
                Disparador de Acessos
              </h1>
              <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Mobile & SMS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Envie mensagens personalizadas em 1 toque usando o app nativo de SMS ou WhatsApp do seu celular.
            </p>
          </div>

          {/* List Selector Dropdown */}
          <div className="min-w-64">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Lista Ativa:
            </label>
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary transition"
            >
              {allLists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.contacts.length} contatos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar & Badges */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800">
                {stats.sent} de {stats.total} enviados
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-green-600 font-semibold">{stats.percent}% concluído</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="text-amber-600 font-medium">{stats.skipped} pulados</span>
              <span className="text-gray-500">{stats.remaining} na fila</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.sent / stats.total) * 100 : 0}%` }}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.skipped / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mt-6 -mb-4 sm:-mb-6 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'queue'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚡ Fila de Disparo (1 Toque)
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'table'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Todos os Contatos ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📜 Histórico ({stats.sent})
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'template'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ✍️ Mensagem & Templates
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📥 Importar CSV / Texto
          </button>
        </div>
      </div>

      {/* TAB 1: QUEUE (CARD INTERATIVO MOBILE-FIRST) */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {currentList.contacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500">
              Nenhum contato encontrado nesta lista.
            </div>
          ) : queueContacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 space-y-4">
              <span className="text-4xl">🎉</span>
              <h3 className="text-xl font-bold text-gray-900">Fila concluída!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Não há mais contatos na fila ({stats.sent} marcados como enviados). Veja o histórico
                e restaure quem tiver falhado.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-xl font-semibold text-sm transition"
                >
                  Ver histórico de enviados
                </button>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition"
                >
                  Reiniciar tudo
                </button>
              </div>
            </div>
          ) : !currentContact ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 space-y-4">
              <span className="text-4xl">🎉</span>
              <h3 className="text-xl font-bold text-gray-900">Você chegou ao final da lista!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Todos os {stats.total} contatos foram processados ({stats.sent} enviados, {stats.skipped} pulados).
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => saveCurrentIndex(0)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition"
                >
                  Voltar ao início
                </button>
                <button
                  onClick={handleResetProgress}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition"
                >
                  Reiniciar disparos
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200 space-y-6">
              {/* Card Navigation and Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Contato {currentIndex + 1} de {queueContacts.length}
                </span>
                <div className="flex items-center gap-2">
                  {currentContactStatus === 'skipped' && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      ⏭ Pulado
                    </span>
                  )}
                  {currentContactStatus === 'pending' && (
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                      Pendente
                    </span>
                  )}
                </div>
              </div>

              {/* Main Contact Info Card */}
              <div className="bg-gradient-to-br from-primary-50/50 to-amber-50/30 rounded-2xl p-5 border border-primary-100/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heading">
                      {currentContact.nome}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 font-mono text-base font-bold text-primary-900 bg-white px-3 py-1 rounded-lg border border-primary-200 shadow-sm">
                        📞 {currentContact.telefone}
                      </span>
                      {currentContact.prefixo && (
                        <span className="text-xs font-semibold bg-white text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
                          Prefixo: {currentContact.prefixo}
                        </span>
                      )}
                      {currentContact.cidade && (
                        <span className="text-xs font-semibold bg-white text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
                          📍 {currentContact.cidade}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Copy Phone Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentContact.telefone);
                      toast.success('Telefone copiado!');
                    }}
                    className="self-start sm:self-auto text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl transition shadow-sm"
                  >
                    📋 Copiar número
                  </button>
                </div>

                {/* Credentials details (if any) */}
                {(loginForContact(currentContact) || currentContact.senha) && (
                  <div className="mt-4 pt-4 border-t border-primary-200/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {loginForContact(currentContact) && (
                      <div className="bg-white/80 p-2.5 rounded-xl border border-primary-100 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 block font-semibold">LOGIN (TELEFONE):</span>
                          <span className="font-mono font-bold text-gray-800 break-all">
                            {loginForContact(currentContact)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(loginForContact(currentContact));
                            toast.success('Login copiado!');
                          }}
                          className="text-primary hover:text-primary-700 p-1"
                        >
                          📋
                        </button>
                      </div>
                    )}
                    {currentContact.senha && (
                      <div className="bg-white/80 p-2.5 rounded-xl border border-primary-100 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 block font-semibold">SENHA PROVISÓRIA:</span>
                          <span className="font-mono font-bold text-primary-700 text-sm">{currentContact.senha}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentContact.senha || '');
                            toast.success('Senha copiada!');
                          }}
                          className="text-primary hover:text-primary-700 p-1"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Bubble Preview */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">Preview da Mensagem que será enviada:</span>
                  <span>{activeMessageText.length} caracteres (~{Math.ceil(activeMessageText.length / 160)} SMS)</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans relative group">
                  {activeMessageText}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeMessageText);
                      toast.success('Texto da mensagem copiado!');
                    }}
                    className="absolute top-2 right-2 opacity-80 hover:opacity-100 bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 shadow-sm"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* BIG ACTION BUTTONS (MOBILE-FIRST) */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp Big Button */}
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl text-base sm:text-lg shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer"
                  >
                    <span className="text-2xl">💬</span>
                    <span>Enviar no WhatsApp</span>
                  </button>

                  {/* SMS Big Button */}
                  <button
                    onClick={handleOpenSms}
                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl text-base sm:text-lg shadow-lg shadow-blue-600/20 active:scale-[0.98] transition cursor-pointer"
                  >
                    <span className="text-2xl">📱</span>
                    <span>Enviar por SMS</span>
                  </button>
                </div>

                {/* Secondary controls */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                  <button
                    onClick={() => saveCurrentIndex(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ◀ Anterior
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSkip}
                      className="px-3 sm:px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm transition"
                    >
                      Pular ⏭
                    </button>
                    <button
                      onClick={handleMarkSent}
                      className="px-3 sm:px-4 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold text-xs sm:text-sm transition"
                    >
                      ✓ Marcar Enviado
                    </button>
                  </div>

                  <button
                    onClick={() => saveCurrentIndex(currentIndex + 1)}
                    disabled={currentIndex >= queueContacts.length - 1}
                    className="px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Próximo ▶
                  </button>
                </div>
              </div>

              {/* Auto advance toggle */}
              <div className="pt-2 flex items-center justify-between bg-gray-50 p-3 rounded-xl text-xs text-gray-600">
                <span>
                  Modo rápido: ao enviar por SMS ou WhatsApp, marca como enviado e remove o contato da fila
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TABLE / LISTA COMPLETA */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, telefone, prefixo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="flex gap-2 text-xs font-semibold">
              {(['all', 'pending', 'sent', 'skipped'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl transition ${
                    statusFilter === s
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' && `Na fila (${stats.remaining})`}
                  {s === 'pending' && `Pendentes (${stats.pending})`}
                  {s === 'sent' && `Enviados (${stats.sent})`}
                  {s === 'skipped' && `Pulados (${stats.skipped})`}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Telefone</th>
                  {currentList.hasCredentials && <th className="p-3">Login (tel.)</th>}
                  {currentList.hasCredentials && <th className="p-3">Senha</th>}
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((contact, idx) => {
                  const status = progress[contact.id]?.status || 'pending';
                  const isCurrent = queueContacts[currentIndex]?.id === contact.id;

                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-gray-50/80 transition ${
                        isCurrent ? 'bg-primary-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-medium text-gray-900">{contact.nome}</td>
                      <td className="p-3 font-mono text-gray-700">{contact.telefone}</td>
                      {currentList.hasCredentials && (
                        <td className="p-3 font-mono text-gray-500 truncate max-w-40">
                          {loginForContact(contact) || '-'}
                        </td>
                      )}
                      {currentList.hasCredentials && (
                        <td className="p-3 font-mono text-primary font-bold">{contact.senha || '-'}</td>
                      )}
                      <td className="p-3">
                        {status === 'sent' && (
                          <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Enviado
                          </span>
                        )}
                        {status === 'skipped' && (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Pulado
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {status === 'sent' ? (
                          <button
                            type="button"
                            onClick={() => restoreContactToQueue(contact.id)}
                            className="text-amber-800 hover:text-amber-900 font-bold text-xs bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shadow-sm"
                          >
                            ↩ Restaurar
                          </button>
                        ) : status === 'skipped' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => restoreContactToQueue(contact.id)}
                              className="text-amber-800 font-bold text-xs bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg"
                            >
                              ↩ Fila
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const queueIdx = queueContacts.findIndex((c) => c.id === contact.id);
                                if (queueIdx >= 0) {
                                  saveCurrentIndex(queueIdx);
                                  setActiveTab('queue');
                                }
                              }}
                              className="text-primary font-bold text-xs bg-white border border-primary-200 px-2.5 py-1 rounded-lg"
                            >
                              Disparar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const queueIdx = queueContacts.findIndex((c) => c.id === contact.id);
                              if (queueIdx >= 0) {
                                saveCurrentIndex(queueIdx);
                                setActiveTab('queue');
                              }
                            }}
                            className="text-primary hover:text-primary-700 font-bold text-xs bg-white border border-primary-200 px-2.5 py-1 rounded-lg shadow-sm"
                          >
                            Disparar →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-500">Mostrando {filteredContacts.length} contatos</span>
            <button
              onClick={handleResetProgress}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
            >
              🗑️ Zerar status da lista
            </button>
          </div>
        </div>
      )}

      {/* TAB: HISTÓRICO DE ENVIADOS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-heading">Histórico de enviados</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Contatos marcados como enviados saem da fila, mas ficam aqui. Se houve falha, use{' '}
              <strong>Restaurar</strong> para voltar à fila de disparo.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          {filteredSentHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-200 rounded-2xl">
              {stats.sent === 0
                ? 'Nenhum envio registrado nesta lista ainda.'
                : 'Nenhum resultado para a busca.'}
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Telefone</th>
                    <th className="p-3">Enviado em</th>
                    <th className="p-3">Canal</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSentHistory.map(({ contact, meta }) => (
                    <tr key={contact.id} className="hover:bg-gray-50/80">
                      <td className="p-3 font-medium text-gray-900">{contact.nome}</td>
                      <td className="p-3 font-mono text-gray-700">{contact.telefone}</td>
                      <td className="p-3 text-gray-600">{formatSentAt(meta.sentAt)}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {channelLabel(meta.channel)}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => restoreContactToQueue(contact.id)}
                          className="text-amber-800 hover:text-amber-900 font-bold text-xs bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg"
                        >
                          ↩ Restaurar à fila
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-500">
            {filteredSentHistory.length} de {stats.sent} enviados nesta lista.
          </p>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 'template' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-heading">Modelos de Mensagem</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Escolha um modelo pronto ou personalize o texto com as variáveis dinâmicas.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedTemplateId(preset.id);
                  setCustomTemplateText(preset.text);
                  toast.success(`Modelo "${preset.name}" selecionado!`);
                }}
                className={`p-3.5 rounded-2xl text-left border transition ${
                  selectedTemplateId === preset.id
                    ? 'border-primary bg-primary-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="font-bold text-sm text-gray-900 block">{preset.name}</span>
                <span className="text-xs text-gray-500 mt-1 line-clamp-2">{preset.text}</span>
              </button>
            ))}
          </div>

          {/* Variable tags */}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Clique em uma tag para inserir no texto:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { tag: '{nome}', desc: 'Nome do transportador' },
                { tag: '{telefone}', desc: 'Telefone' },
                { tag: '{usuario}', desc: 'Login (telefone com DDD, só números)' },
                { tag: '{senha}', desc: 'Senha temporária' },
                { tag: '{prefixo}', desc: 'Prefixo' },
                { tag: '{cidade}', desc: 'Cidade' },
                { tag: '{link}', desc: 'Link de login' },
              ].map(({ tag, desc }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCustomTemplateText((prev) => `${prev} ${tag}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-mono font-semibold transition"
                  title={desc}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              rows={4}
              value={customTemplateText}
              onChange={(e) => {
                setCustomTemplateText(e.target.value);
                setSelectedTemplateId('custom');
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 text-sm text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary transition leading-relaxed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Tamanho atual: {customTemplateText.length} caracteres</span>
              <span>Recomendado para SMS: até 160 caracteres</span>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('queue');
              toast.success('Modelo salvo e pronto para envio!');
            }}
            className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition"
          >
            Usar Este Modelo e Voltar à Fila →
          </button>
        </div>
      )}

      {/* TAB 4: IMPORT */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-heading">Importar Nova Lista de Contatos</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Cole uma lista de contatos ou faça upload de um arquivo CSV/TSV. O sistema reconhece colunas de Nome, Telefone, Usuário e Senha.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da Lista:</label>
              <input
                type="text"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder="Ex: Transportadores Campinas - Outubro"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cole o conteúdo (CSV separado por vírgula, ponto e vírgula ou Tabulação):
              </label>
              <textarea
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Exemplo:\n"Tio Carlos","11999998888","carlos@alotio.com","senha123"\n"Tia Ana","13988887777","ana@alotio.com","senha456"`}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 text-xs sm:text-sm font-mono text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleProcessImport}
                className="bg-primary hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
              >
                Processar e Carregar Lista
              </button>

              {customList && (
                <button
                  onClick={() => {
                    if (window.confirm('Deseja remover a lista importada personalizada?')) {
                      setCustomList(null);
                      setSelectedListId('todos-senhas');
                      try {
                        localStorage.removeItem('alotio_disparador_custom_list');
                      } catch {
                        /* ignore */
                      }
                      toast.success('Lista personalizada removida.');
                    }
                  }}
                  className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-4 py-3 rounded-xl text-sm transition"
                >
                  Excluir lista personalizada atual
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

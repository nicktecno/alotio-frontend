'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PRELOADED_CONTACT_LISTS,
  type ContactItem,
  type ContactListGroup,
} from '@/data/preloaded-contact-lists';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

type ContactStatus = 'new' | 'reprocess' | 'sent' | 'skipped';

interface ContactProgress {
  [contactId: string]: {
    status: ContactStatus;
    sentAt?: string;
    previousSentAt?: string;
    reprocessAt?: string;
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
    'queue_new' | 'queue_reprocess' | 'table' | 'history' | 'template' | 'import'
  >('queue_new');
  const [selectedListId, setSelectedListId] = useState<string>('todos-senhas');
  const [customList, setCustomList] = useState<ContactListGroup | null>(null);

  // Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('credentials');
  const [customTemplateText, setCustomTemplateText] = useState<string>(TEMPLATE_PRESETS[0].text);

  const [progress, setProgress] = useState<ContactProgress>({});
  const [newIndex, setNewIndex] = useState<number>(0);
  const [reprocessIndex, setReprocessIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [stateHydrated, setStateHydrated] = useState(false);
  const [syncingState, setSyncingState] = useState(false);
  const skipSaveRef = useRef(true);

  // Search and filter for table tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reprocess' | 'sent' | 'skipped'>('all');

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

  useEffect(() => {
    let cancelled = false;
    api
      .adminGetDisparadorCustomList()
      .then((raw) => {
        if (!cancelled && raw) {
          setCustomList(raw);
        }
      })
      .catch((err: unknown) => {
        const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
        if (status === 404) return;
        toast.error('Não foi possível carregar lista personalizada do servidor.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStateHydrated(false);
    skipSaveRef.current = true;

    api
      .adminGetDisparadorState(selectedListId)
      .then((data) => {
        if (cancelled) return;
        if (!data || typeof data !== 'object') {
          setProgress({});
          setNewIndex(0);
          setReprocessIndex(0);
          setStateHydrated(true);
          return;
        }
        setProgress((data.progress as ContactProgress) || {});
        setNewIndex(data.currentIndex ?? 0);
        setReprocessIndex(data.currentIndex ?? 0);
        setStateHydrated(true);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar o progresso desta lista.');
          setProgress({});
          setNewIndex(0);
          setReprocessIndex(0);
          setStateHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedListId]);

  useEffect(() => {
    if (!stateHydrated) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setSyncingState(true);
      api
        .adminUpsertDisparadorState({
          listId: selectedListId,
          progress,
          currentIndex: activeTab === 'queue_reprocess' ? reprocessIndex : newIndex,
        })
        .catch(() => {
          toast.error('Falha ao salvar progresso no servidor.');
        })
        .finally(() => setSyncingState(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [progress, newIndex, reprocessIndex, selectedListId, stateHydrated, activeTab]);

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

  const updateContactStatus = useCallback(
    (contactId: string, status: ContactStatus, channel?: 'sms' | 'whatsapp' | 'manual') => {
      setProgress((prev) => {
        const cur = prev[contactId];
        return {
          ...prev,
          [contactId]: {
            ...cur,
            status,
            sentAt: status === 'sent' ? new Date().toISOString() : cur?.sentAt,
            channel: status === 'sent' ? channel : cur?.channel,
          },
        };
      });
    },
    [],
  );

  /**
   * Sempre que colocar de volta pra fila vai para esse reprocessados.
   * Não apaga o registro nem o transforma em 'novo', mas sim marca como 'reprocess'.
   */
  const restoreContactToQueue = useCallback((contactId: string) => {
    setProgress((prev) => {
      const current = prev[contactId];
      return {
        ...prev,
        [contactId]: {
          ...current,
          status: 'reprocess',
          previousSentAt: current?.sentAt || current?.previousSentAt || new Date().toISOString(),
          reprocessAt: new Date().toISOString(),
        },
      };
    });
    toast.success('Contato colocado de volta na fila de Reprocessamento.');
  }, []);

  /** Fila de Novos: apenas contatos que nunca foram processados nem enviados. */
  const newContacts = useMemo(() => {
    return currentList.contacts.filter((c) => {
      const p = progress[c.id];
      return !p || p.status === 'new';
    });
  }, [currentList.contacts, progress]);

  /** Fila de Reprocessamento: contatos que já foram processados anteriormente ou devolvidos à fila. */
  const reprocessContacts = useMemo(() => {
    return currentList.contacts.filter((c) => progress[c.id]?.status === 'reprocess');
  }, [currentList.contacts, progress]);

  /** Enviados nesta rodada. */
  const sentContacts = useMemo(() => {
    return currentList.contacts.filter((c) => progress[c.id]?.status === 'sent');
  }, [currentList.contacts, progress]);

  /** Pulados. */
  const skippedContacts = useMemo(() => {
    return currentList.contacts.filter((c) => progress[c.id]?.status === 'skipped');
  }, [currentList.contacts, progress]);

  // Clamp indexes
  useEffect(() => {
    if (newContacts.length === 0) {
      if (newIndex !== 0) setNewIndex(0);
    } else if (newIndex >= newContacts.length) {
      setNewIndex(Math.max(0, newContacts.length - 1));
    }
  }, [newContacts.length, newIndex]);

  useEffect(() => {
    if (reprocessContacts.length === 0) {
      if (reprocessIndex !== 0) setReprocessIndex(0);
    } else if (reprocessIndex >= reprocessContacts.length) {
      setReprocessIndex(Math.max(0, reprocessContacts.length - 1));
    }
  }, [reprocessContacts.length, reprocessIndex]);

  // Statistics
  const stats = useMemo(() => {
    const total = currentList.contacts.length;
    const newCount = newContacts.length;
    const reprocessCount = reprocessContacts.length;
    const sent = sentContacts.length;
    const skipped = skippedContacts.length;
    const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { total, newCount, reprocessCount, sent, skipped, percent };
  }, [
    currentList.contacts.length,
    newContacts.length,
    reprocessContacts.length,
    sentContacts.length,
    skippedContacts.length,
  ]);

  const sentHistory = useMemo(() => {
    return sentContacts
      .map((contact) => ({
        contact,
        meta: progress[contact.id]!,
      }))
      .sort((a, b) => (b.meta.sentAt || '').localeCompare(a.meta.sentAt || ''));
  }, [sentContacts, progress]);

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

  // Dynamic queue selection based on activeTab
  const isReprocessQueue = activeTab === 'queue_reprocess';
  const activeQueueContacts = isReprocessQueue ? reprocessContacts : newContacts;
  const currentQueueIndex = isReprocessQueue ? reprocessIndex : newIndex;
  const setCurrentQueueIndex = isReprocessQueue ? setReprocessIndex : setNewIndex;

  const currentContact: ContactItem | undefined = activeQueueContacts[currentQueueIndex];
  const currentContactStatus: ContactStatus = currentContact
    ? progress[currentContact.id]?.status || (isReprocessQueue ? 'reprocess' : 'new')
    : 'new';

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

    const isIOS =
      typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const targetUrl = `sms:+55${phoneInfo.digits}${separator}body=${encodeURIComponent(activeMessageText)}`;

    window.location.href = targetUrl;

    if (autoAdvance) {
      updateContactStatus(currentContact.id, 'sent', 'sms');
      toast.success(
        isReprocessQueue ? 'SMS aberto! Contato reprocessado com sucesso.' : 'SMS aberto! Contato enviado.',
        { duration: 2500 },
      );
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
      toast.success(
        isReprocessQueue
          ? 'WhatsApp aberto! Contato reprocessado com sucesso.'
          : 'WhatsApp aberto! Contato enviado.',
        { duration: 2500 },
      );
    }
  };

  // Action: Mark sent manually & advance
  const handleMarkSent = () => {
    if (!currentContact) return;
    updateContactStatus(currentContact.id, 'sent', 'manual');
    toast.success('Marcado como enviado!');
  };

  // Action: Skip contact
  const handleSkip = () => {
    if (!currentContact) return;
    updateContactStatus(currentContact.id, 'skipped');
    if (currentQueueIndex < activeQueueContacts.length - 1) {
      setCurrentQueueIndex(currentQueueIndex + 1);
    }
    toast('Contato pulado', { icon: '⏭️' });
  };

  // Action: Mover todos os enviados para reprocessamento
  const handleReprocessAllSent = () => {
    if (sentContacts.length === 0) {
      toast.error('Nenhum contato enviado no histórico.');
      return;
    }
    if (!window.confirm(`Deseja mover todos os ${sentContacts.length} contatos enviados para a fila de Reprocessamento?`)) {
      return;
    }
    setProgress((prev) => {
      const next = { ...prev };
      for (const c of sentContacts) {
        const cur = next[c.id];
        next[c.id] = {
          ...cur,
          status: 'reprocess',
          previousSentAt: cur?.sentAt || cur?.previousSentAt || new Date().toISOString(),
          reprocessAt: new Date().toISOString(),
        };
      }
      return next;
    });
    setActiveTab('queue_reprocess');
    toast.success(`${sentContacts.length} contatos movidos para a fila de Reprocessamento!`);
  };

  // Action: Reset progress for this list
  const handleResetProgress = async () => {
    if (!window.confirm(`Deseja mover todos os contatos processados da lista "${currentList.title}" para Reprocessamento?`)) {
      return;
    }
    setProgress((prev) => {
      const next = { ...prev };
      for (const c of currentList.contacts) {
        const cur = next[c.id];
        if (cur) {
          next[c.id] = {
            ...cur,
            status: 'reprocess',
            previousSentAt: cur?.sentAt || cur?.previousSentAt || new Date().toISOString(),
            reprocessAt: new Date().toISOString(),
          };
        }
      }
      return next;
    });
    setReprocessIndex(0);
    setActiveTab('queue_reprocess');
    toast.success('Todos os contatos processados foram movidos para a fila de Reprocessamento!');
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

    void (async () => {
      try {
        await api.adminUpsertDisparadorCustomList(newCustom);
        setCustomList(newCustom);
        setSelectedListId(newCustom.id);
        toast.success(`${parsedContacts.length} contatos importados com sucesso!`);
        setActiveTab('queue_new');
      } catch {
        toast.error('Falha ao salvar lista personalizada no servidor.');
      }
    })();
  };

  // Filtered contacts for the table view
  const filteredContacts = useMemo(() => {
    return currentList.contacts.filter((c) => {
      const p = progress[c.id];
      const contactStatus: ContactStatus = p ? p.status : 'new';

      if (statusFilter !== 'all' && contactStatus !== statusFilter) return false;
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
              {syncingState ? (
                <span className="block text-primary font-semibold mt-1">Salvando no servidor…</span>
              ) : null}
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
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm mb-2 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-bold text-gray-800">
                {stats.sent} de {stats.total} enviados ({stats.percent}%)
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-blue-700 bg-blue-50 font-bold px-2.5 py-0.5 rounded-md text-xs border border-blue-200">
                🆕 {stats.newCount} novos
              </span>
              <span className="text-purple-700 bg-purple-50 font-bold px-2.5 py-0.5 rounded-md text-xs border border-purple-200">
                🔄 {stats.reprocessCount} reprocessamento
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="text-amber-600 font-medium">{stats.skipped} pulados</span>
              <span className="text-gray-600 font-semibold">{stats.total} total</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.sent / stats.total) * 100 : 0}%` }}
              title={`${stats.sent} enviados`}
            />
            <div
              className="bg-purple-400 h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.reprocessCount / stats.total) * 100 : 0}%` }}
              title={`${stats.reprocessCount} em reprocessamento`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.skipped / stats.total) * 100 : 0}%` }}
              title={`${stats.skipped} pulados`}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mt-6 -mb-4 sm:-mb-6 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('queue_new')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'queue_new'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>🆕</span>
            <span>Novos na Fila ({stats.newCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('queue_reprocess')}
            className={`py-3 px-4 font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'queue_reprocess'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>🔄</span>
            <span>Reprocessamento ({stats.reprocessCount})</span>
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

      {/* QUEUE CARD COMPONENT (USADO PARA NOVOS E REPROCESSAMENTO) */}
      {(activeTab === 'queue_new' || activeTab === 'queue_reprocess') && (
        <div className="space-y-4">
          {currentList.contacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500">
              Nenhum contato encontrado nesta lista.
            </div>
          ) : activeQueueContacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 space-y-4">
              <span className="text-4xl">{isReprocessQueue ? '✨' : '🎉'}</span>
              <h3 className="text-xl font-bold text-gray-900">
                {isReprocessQueue
                  ? 'Fila de reprocessamento zerada!'
                  : 'Fila de novos contatos concluída!'}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {isReprocessQueue
                  ? `Nenhum contato aguardando reprocessamento nesta lista no momento. Existem ${stats.newCount} contatos na fila de novos e ${stats.sent} contatos no histórico.`
                  : `Todos os contatos novos foram processados! Existem ${stats.reprocessCount} contatos na fila de reprocessamento e ${stats.sent} enviados.`}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {isReprocessQueue ? (
                  <>
                    {stats.newCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('queue_new')}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold text-sm transition"
                      >
                        Ir para Novos na Fila ({stats.newCount}) →
                      </button>
                    )}
                    {stats.sent > 0 && (
                      <button
                        type="button"
                        onClick={handleReprocessAllSent}
                        className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl font-semibold text-sm transition"
                      >
                        🔄 Reprocessar Todos os Enviados ({stats.sent})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {stats.reprocessCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('queue_reprocess')}
                        className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl font-semibold text-sm transition"
                      >
                        Ir para Reprocessamento ({stats.reprocessCount}) →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="px-4 py-2 bg-primary text-white hover:bg-primary-600 rounded-xl font-semibold text-sm transition"
                    >
                      Ver Histórico ({stats.sent})
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : !currentContact ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 space-y-4">
              <span className="text-4xl">🎉</span>
              <h3 className="text-xl font-bold text-gray-900">Final da fila alcançado!</h3>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentQueueIndex(0)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition"
                >
                  Voltar ao início
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200 space-y-6">
              {/* Card Navigation and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isReprocessQueue ? (
                    <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                      🔄 REPROCESSAMENTO • {currentQueueIndex + 1} de {activeQueueContacts.length}
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                      🆕 CONTATO NOVO • {currentQueueIndex + 1} de {activeQueueContacts.length}
                    </span>
                  )}
                  {progress[currentContact.id]?.previousSentAt && (
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                      (Anteriormente enviado em {formatSentAt(progress[currentContact.id]?.previousSentAt)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentContactStatus === 'skipped' && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      ⏭ Pulado
                    </span>
                  )}
                </div>
              </div>

              {/* Main Contact Info Card */}
              <div
                className={`rounded-2xl p-5 border ${
                  isReprocessQueue
                    ? 'bg-gradient-to-br from-purple-50/60 to-indigo-50/30 border-purple-100'
                    : 'bg-gradient-to-br from-primary-50/50 to-blue-50/30 border-primary-100/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heading">
                      {currentContact.nome}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 font-mono text-base font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
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
                  <div className="mt-4 pt-4 border-t border-gray-200/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {loginForContact(currentContact) && (
                      <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between">
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
                          className="text-gray-400 hover:text-gray-600 text-xs ml-2"
                        >
                          Copiar
                        </button>
                      </div>
                    )}
                    {currentContact.senha && (
                      <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 block font-semibold">SENHA TEMPORÁRIA:</span>
                          <span className="font-mono font-black text-primary text-sm tracking-wide">
                            {currentContact.senha}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentContact.senha || '');
                            toast.success('Senha copiada!');
                          }}
                          className="text-gray-400 hover:text-gray-600 text-xs ml-2"
                        >
                          Copiar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Prévia da Mensagem Personalizada
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeMessageText);
                      toast.success('Mensagem copiada para a área de transferência!');
                    }}
                    className="text-xs text-primary hover:text-primary-700 font-semibold flex items-center gap-1"
                  >
                    <span>📋</span> Copiar texto completo
                  </button>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {activeMessageText}
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>{activeMessageText.length} caracteres</span>
                  <span>Variáveis dinâmicas preenchidas</span>
                </div>
              </div>

              {/* Primary Dispatch Buttons (Mobile-First 1-Touch) */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* SMS Button (Primary) */}
                  <button
                    onClick={handleOpenSms}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black py-4 px-6 rounded-2xl text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-3 transform active:scale-[0.98]"
                  >
                    <span className="text-xl">💬</span>
                    <span>{isReprocessQueue ? 'Reenviar SMS (1 Toque)' : 'Enviar SMS (1 Toque)'}</span>
                  </button>

                  {/* WhatsApp Button */}
                  <button
                    onClick={handleOpenWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black py-4 px-6 rounded-2xl text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-3 transform active:scale-[0.98]"
                  >
                    <span className="text-xl">📱</span>
                    <span>{isReprocessQueue ? 'Reenviar WhatsApp' : 'Enviar WhatsApp'}</span>
                  </button>
                </div>

                {/* Secondary navigation and manual controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (currentQueueIndex > 0) setCurrentQueueIndex(currentQueueIndex - 1);
                      }}
                      disabled={currentQueueIndex === 0}
                      className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 rounded-xl transition"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => {
                        if (currentQueueIndex < activeQueueContacts.length - 1) {
                          setCurrentQueueIndex(currentQueueIndex + 1);
                        }
                      }}
                      disabled={currentQueueIndex >= activeQueueContacts.length - 1}
                      className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100 rounded-xl transition"
                    >
                      Próximo →
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSkip}
                      className="px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition"
                    >
                      Pular ⏭
                    </button>
                    <button
                      onClick={handleMarkSent}
                      className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                    >
                      ✓ Marcar como enviado
                    </button>
                  </div>
                </div>

                {/* Auto advance toggle */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>Remover contato da fila e avançar automaticamente ao disparar</span>
                  </label>
                  <button
                    onClick={() => setActiveTab('template')}
                    className="text-primary hover:underline text-xs"
                  >
                    Alterar modelo de mensagem ↗
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TODOS OS CONTATOS (TABELA COM FILTRO DE STATUS) */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-heading">
                Todos os Contatos da Lista
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {currentList.contacts.length} cadastrados no total. Filtrar por status ou buscar por nome/telefone.
              </p>
            </div>
            {stats.sent > 0 && (
              <button
                type="button"
                onClick={handleReprocessAllSent}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl transition shadow-sm self-start sm:self-auto"
              >
                🔄 Mover todos os enviados ({stats.sent}) para Reprocessamento
              </button>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, telefone, login ou prefixo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('new')}
                className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                🆕 Novos ({stats.newCount})
              </button>
              <button
                onClick={() => setStatusFilter('reprocess')}
                className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === 'reprocess'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                🔄 Reprocessar ({stats.reprocessCount})
              </button>
              <button
                onClick={() => setStatusFilter('sent')}
                className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === 'sent'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                ✓ Enviados ({stats.sent})
              </button>
              <button
                onClick={() => setStatusFilter('skipped')}
                className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
                  statusFilter === 'skipped'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Pulados ({stats.skipped})
              </button>
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
                  {currentList.hasCredentials && <th className="p-3">Login</th>}
                  {currentList.hasCredentials && <th className="p-3">Senha</th>}
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((contact, idx) => {
                  const p = progress[contact.id];
                  const status: ContactStatus = p ? p.status : 'new';

                  return (
                    <tr
                      key={contact.id}
                      className={
                        status === 'sent'
                          ? 'bg-green-50/20'
                          : status === 'reprocess'
                          ? 'bg-purple-50/20'
                          : status === 'skipped'
                          ? 'bg-amber-50/20'
                          : 'hover:bg-gray-50/80'
                      }
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
                          <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            ✓ Enviado
                          </span>
                        )}
                        {status === 'reprocess' && (
                          <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            🔄 Reprocessar
                          </span>
                        )}
                        {status === 'skipped' && (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            ⏭ Pulado
                          </span>
                        )}
                        {status === 'new' && (
                          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            🆕 Novo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {status === 'sent' ? (
                          <button
                            type="button"
                            onClick={() => restoreContactToQueue(contact.id)}
                            className="text-purple-800 hover:text-purple-900 font-bold text-xs bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg shadow-sm"
                            title="Mover para a fila de Reprocessamento"
                          >
                            🔄 Reprocessar
                          </button>
                        ) : status === 'reprocess' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const qIdx = reprocessContacts.findIndex((c) => c.id === contact.id);
                              if (qIdx >= 0) setReprocessIndex(qIdx);
                              setActiveTab('queue_reprocess');
                            }}
                            className="text-purple-700 hover:text-purple-900 font-bold text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg shadow-sm"
                          >
                            Disparar 🔄
                          </button>
                        ) : status === 'skipped' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => restoreContactToQueue(contact.id)}
                              className="text-purple-800 font-bold text-xs bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg"
                              title="Mover para a fila de Reprocessamento"
                            >
                              🔄 Reprocessar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const qIdx = newContacts.findIndex((c) => c.id === contact.id);
                                if (qIdx >= 0) setNewIndex(qIdx);
                                setActiveTab('queue_new');
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
                              const qIdx = newContacts.findIndex((c) => c.id === contact.id);
                              if (qIdx >= 0) setNewIndex(qIdx);
                              setActiveTab('queue_new');
                            }}
                            className="text-blue-700 hover:text-blue-900 font-bold text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg shadow-sm"
                          >
                            Disparar Novo →
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
              className="text-xs text-purple-700 hover:text-purple-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-50 border border-purple-200 transition"
            >
              🔄 Mover todos processados para Reprocessamento
            </button>
          </div>
        </div>
      )}

      {/* TAB: HISTÓRICO DE ENVIADOS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-heading">Histórico de Enviados</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Contatos enviados nesta rodada. Se desejar disparar novamente, clique em{' '}
                <strong>Reprocessar</strong> para colocar de volta na fila de Reprocessamento.
              </p>
            </div>
            {stats.sent > 0 && (
              <button
                type="button"
                onClick={handleReprocessAllSent}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl transition shadow-sm self-start sm:self-auto"
              >
                🔄 Mover Todos para Reprocessamento
              </button>
            )}
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
                ? 'Nenhum envio registrado nesta rodada ainda. Dispare contatos da fila de Novos ou de Reprocessamento.'
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
                          className="text-purple-800 hover:text-purple-900 font-bold text-xs bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg transition hover:bg-purple-100"
                          title="Sempre que colocar de volta pra fila vai para Reprocessados"
                        >
                          🔄 Colocar em Reprocessamento
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
              setActiveTab('queue_new');
              toast.success('Modelo salvo e pronto para envio!');
            }}
            className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition"
          >
            Usar Este Modelo e Voltar à Fila de Novos →
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
                    if (!window.confirm('Deseja remover a lista importada personalizada?')) return;
                    void api.adminUpsertDisparadorCustomList(null).then(() => {
                      setCustomList(null);
                      setSelectedListId('todos-senhas');
                      toast.success('Lista personalizada removida.');
                    }).catch(() => {
                      toast.error('Falha ao remover lista no servidor.');
                    });
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

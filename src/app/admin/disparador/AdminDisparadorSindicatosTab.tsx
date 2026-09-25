'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { SINDICATOS_LIST, type SindicatoContactItem } from '@/data/sindicatos-list';

interface ContactProgressItem {
  status: 'new' | 'sent' | 'skipped';
  sentAt?: string;
  channel?: 'whatsapp' | 'sms' | 'manual' | 'email';
}

interface SindicatosProgress {
  [contactId: string]: ContactProgressItem;
}

export const SINDICATO_TEMPLATE_PRESETS = [
  {
    id: 'com-senha',
    name: '🔑 Acesso Oficial com Senha Temporária (Recomendado)',
    text:
      'Olá {responsavel}! Aqui é da equipe do Alô Tio (https://alotio.com.br).\n\nLiberamos o acesso oficial do {nome} no portal Alô Tio para gestão e apoio aos transportadores escolares de {cidade} ({uf}).\n\n🔑 Seus Dados de Acesso:\n• Painel: https://alotio.com.br/login\n• Login: {usuario}\n• Senha Temporária: {senha}\n\nCom esse acesso vocês podem validar condutores associados, divulgar comunicados e ajudar os pais a encontrarem transporte escolar legalizado na região.\n\nQualquer dúvida estamos à disposição por este WhatsApp!',
  },
  {
    id: 'convite-rapido',
    name: '⚡ Convite Rápido com Login e Senha',
    text:
      'Olá, {nome}! Tudo bem? Liberamos o acesso oficial da sua entidade no Alô Tio (https://alotio.com.br) para apoiar os condutores escolares de {cidade} ({uf}).\n\nAcesse https://alotio.com.br/login\nLogin: {usuario}\nSenha: {senha}\n\nEstamos à disposição para ajudar no primeiro acesso!',
  },
  {
    id: 'sem-senha',
    name: '🏛️ Proposta de Parceria Institucional (sem senha)',
    text:
      'Olá, {nome}! Tudo bem? Sou da equipe do Alô Tio (https://alotio.com.br), o maior portal de vans e transporte escolar do Brasil.\n\nNotamos o importante trabalho de vocês junto aos transportadores escolares de {cidade} ({uf}). Gostaríamos de propor uma parceria gratuita: criamos um canal oficial para o sindicato/associação cadastrar seus associados e divulgar benefícios, ajudando os pais da sua região a encontrarem vans escolares regulamentadas e fortalecendo a categoria.\n\nPodemos conversar no WhatsApp sobre como levar essa parceria aos seus associados?',
  },
];

const DEFAULT_SINDICATO_TEMPLATE = SINDICATO_TEMPLATE_PRESETS[0].text;

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

export default function AdminDisparadorSindicatosTab() {
  const [contacts, setContacts] = useState<SindicatoContactItem[]>(SINDICATOS_LIST);
  const [progress, setProgress] = useState<SindicatosProgress>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [templateText, setTemplateText] = useState<string>(DEFAULT_SINDICATO_TEMPLATE);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Filters
  const [ufFilter, setUfFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'sent' | 'skipped'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const skipSaveRef = useRef(true);

  // Load custom contacts & template from localStorage
  useEffect(() => {
    try {
      const savedTemplate = localStorage.getItem('alotio_sindicatos_template');
      if (savedTemplate) setTemplateText(savedTemplate);

      const savedContacts = localStorage.getItem('alotio_sindicatos_custom_contacts');
      if (savedContacts) {
        const parsed = JSON.parse(savedContacts) as SindicatoContactItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom with preloaded
          const existingIds = new Set(SINDICATOS_LIST.map((c) => c.id));
          const additions = parsed.filter((c) => !existingIds.has(c.id));
          setContacts([...SINDICATOS_LIST, ...additions]);
        }
      }
    } catch (e) {
      console.error('Falha ao ler localStorage:', e);
    }
  }, []);

  // Hydrate progress from server
  useEffect(() => {
    let cancelled = false;
    api
      .adminGetDisparadorState('sindicatos-associacoes')
      .then((res) => {
        if (cancelled) return;
        if (res && res.progress) {
          setProgress(res.progress as SindicatosProgress);
          if (typeof res.currentIndex === 'number' && res.currentIndex >= 0) {
            setCurrentIndex(res.currentIndex);
          }
        }
      })
      .catch(() => {
        // Fallback to local storage
        try {
          const local = localStorage.getItem('alotio_disparador_sindicatos_progress');
          if (local) setProgress(JSON.parse(local));
        } catch {
          // ignore
        }
      })
      .finally(() => {
        skipSaveRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Save progress to server & localStorage
  const saveState = async (newProgress: SindicatosProgress, newIdx: number) => {
    try {
      localStorage.setItem('alotio_disparador_sindicatos_progress', JSON.stringify(newProgress));
    } catch {
      // ignore
    }

    if (skipSaveRef.current) return;
    setIsSyncing(true);
    try {
      await api.adminUpsertDisparadorState({
        listId: 'sindicatos-associacoes',
        progress: newProgress,
        currentIndex: newIdx,
      });
    } catch (err) {
      console.warn('Falha ao salvar progresso dos sindicatos no servidor:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateContactStatus = (
    contactId: string,
    status: 'new' | 'sent' | 'skipped',
    channel?: 'whatsapp' | 'sms' | 'manual' | 'email',
  ) => {
    const next: SindicatosProgress = {
      ...progress,
      [contactId]: {
        status,
        sentAt: status === 'sent' ? new Date().toISOString() : progress[contactId]?.sentAt,
        channel: channel || progress[contactId]?.channel,
      },
    };
    setProgress(next);
    void saveState(next, currentIndex);
  };

  // Unique UFs and Cities for filter dropdowns
  const availableUfs = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      if (c.uf) set.add(c.uf);
    });
    return Array.from(set).sort();
  }, [contacts]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      if (ufFilter === 'ALL' || c.uf === ufFilter) {
        if (c.cidade) set.add(c.cidade);
      }
    });
    return Array.from(set).sort();
  }, [contacts, ufFilter]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (ufFilter !== 'ALL' && c.uf !== ufFilter) return false;
      if (cityFilter !== 'ALL' && c.cidade !== cityFilter) return false;
      if (typeFilter !== 'ALL' && c.tipo !== typeFilter) return false;

      const p = progress[c.id];
      const status = p?.status || 'new';
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.nome.toLowerCase().includes(q);
        const matchSigla = (c.sigla || '').toLowerCase().includes(q);
        const matchCity = (c.cidade || '').toLowerCase().includes(q);
        const matchPhone = (c.telefone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const matchResp = (c.responsavel || '').toLowerCase().includes(q);
        if (!matchName && !matchSigla && !matchCity && !matchPhone && !matchResp) return false;
      }

      return true;
    });
  }, [contacts, ufFilter, cityFilter, typeFilter, statusFilter, searchQuery, progress]);

  // Active contact for card view
  const currentContact: SindicatoContactItem | null = useMemo(() => {
    if (filteredContacts.length === 0) return null;
    const safeIdx = Math.min(Math.max(0, currentIndex), filteredContacts.length - 1);
    return filteredContacts[safeIdx] || null;
  }, [filteredContacts, currentIndex]);

  // Statistics
  const stats = useMemo(() => {
    const total = contacts.length;
    let sent = 0;
    let skipped = 0;
    contacts.forEach((c) => {
      const s = progress[c.id]?.status || 'new';
      if (s === 'sent') sent++;
      if (s === 'skipped') skipped++;
    });
    const pending = total - sent - skipped;
    const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
    const citiesCount = new Set(contacts.map((c) => `${c.cidade}-${c.uf}`)).size;
    return { total, sent, pending, skipped, percent, citiesCount };
  }, [contacts, progress]);

  // Message interpolation
  const interpolateMessage = (template: string, contact: SindicatoContactItem): string => {
    let msg = template;
    const displayName = contact.sigla || contact.nome.split('-')[0].split('|')[0].trim();
    const phoneInfo = cleanPhoneForDispatch(contact.telefoneRaw || contact.telefone);
    const userLogin =
      contact.usuario ||
      (phoneInfo.isValid ? phoneInfo.digits : '') ||
      contact.email ||
      contact.telefone ||
      '';
    const userPassword = contact.senha || 'alotio2026';

    msg = msg.replace(/\{nome\}/g, displayName);
    msg = msg.replace(/\{cidade\}/g, contact.cidade || 'sua cidade');
    msg = msg.replace(/\{uf\}/g, contact.uf || 'Brasil');
    msg = msg.replace(/\{responsavel\}/g, contact.responsavel || 'Diretoria');
    msg = msg.replace(/\{telefone\}/g, contact.telefone || '');
    msg = msg.replace(/\{usuario\}/g, userLogin);
    msg = msg.replace(/\{login\}/g, userLogin);
    msg = msg.replace(/\{senha\}/g, userPassword);
    msg = msg.replace(/\{email\}/g, contact.email || '');
    msg = msg.replace(/\{link\}/g, 'https://alotio.com.br/login');
    return msg;
  };

  const activeMessageText = currentContact ? interpolateMessage(templateText, currentContact) : '';

  // Actions
  const handleOpenWhatsApp = (contact?: SindicatoContactItem) => {
    const target = contact || currentContact;
    if (!target) return;
    const phoneInfo = cleanPhoneForDispatch(target.telefoneRaw || target.telefone);
    if (!phoneInfo.isValid) {
      toast.error('Telefone inválido para envio de WhatsApp.');
      return;
    }
    const text = interpolateMessage(templateText, target);
    const targetUrl = `https://wa.me/55${phoneInfo.digits}?text=${encodeURIComponent(text)}`;
    window.open(targetUrl, '_blank');

    updateContactStatus(target.id, 'sent', 'whatsapp');
    toast.success(`WhatsApp aberto para ${target.sigla || target.nome.slice(0, 20)}!`);

    if (autoAdvance && !contact && currentIndex < filteredContacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleOpenSms = (contact?: SindicatoContactItem) => {
    const target = contact || currentContact;
    if (!target) return;
    const phoneInfo = cleanPhoneForDispatch(target.telefoneRaw || target.telefone);
    if (!phoneInfo.isValid) {
      toast.error('Telefone inválido para envio de SMS.');
      return;
    }
    const text = interpolateMessage(templateText, target);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${phoneInfo.digits}${separator}body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;

    updateContactStatus(target.id, 'sent', 'sms');
    toast.success(`SMS iniciado para ${target.sigla || target.nome.slice(0, 20)}!`);

    if (autoAdvance && !contact && currentIndex < filteredContacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleCopyMessage = (contact?: SindicatoContactItem) => {
    const target = contact || currentContact;
    if (!target) return;
    const text = interpolateMessage(templateText, target);
    navigator.clipboard.writeText(text);
    toast.success('Mensagem copiada para a área de transferência!');
  };

  const handleSkip = () => {
    if (!currentContact) return;
    updateContactStatus(currentContact.id, 'skipped');
    toast('Contato pulado', { icon: '⏭️' });
    if (currentIndex < filteredContacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSaveTemplate = () => {
    localStorage.setItem('alotio_sindicatos_template', templateText);
    toast.success('Modelo de mensagem salvo com sucesso!');
    setIsTemplateEditorOpen(false);
  };

  const handleResetTemplate = () => {
    setTemplateText(DEFAULT_SINDICATO_TEMPLATE);
    localStorage.removeItem('alotio_sindicatos_template');
    toast.success('Modelo padrão restaurado.');
  };

  // Add new contact manual modal form
  const [newForm, setNewForm] = useState({
    nome: '',
    sigla: '',
    tipo: 'sindicato' as SindicatoContactItem['tipo'],
    cidade: '',
    uf: 'SP',
    telefone: '',
    email: '',
    website: '',
    responsavel: '',
    observacoes: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.nome.trim() || !newForm.telefone.trim() || !newForm.cidade.trim()) {
      toast.error('Preencha os campos obrigatórios (Nome, Cidade, Telefone).');
      return;
    }
    const phoneClean = cleanPhoneForDispatch(newForm.telefone);
    const newItem: SindicatoContactItem = {
      id: `manual-sind-${Date.now()}`,
      nome: newForm.nome.trim(),
      sigla: newForm.sigla.trim() || undefined,
      tipo: newForm.tipo || 'sindicato',
      cidade: newForm.cidade.trim(),
      uf: newForm.uf.toUpperCase().trim(),
      telefone: phoneClean.formatted,
      telefoneRaw: `55${phoneClean.digits}`,
      telefoneValido: phoneClean.isValid,
      email: newForm.email.trim() || undefined,
      website: newForm.website.trim() || undefined,
      responsavel: newForm.responsavel.trim() || undefined,
      observacoes: newForm.observacoes.trim() || undefined,
      source: 'Cadastro Manual no Disparador',
    };

    const nextContacts = [newItem, ...contacts];
    setContacts(nextContacts);
    try {
      localStorage.setItem('alotio_sindicatos_custom_contacts', JSON.stringify(nextContacts));
    } catch {
      // ignore
    }
    toast.success('Nova entidade cadastrada com sucesso!');
    setIsAddModalOpen(false);
    setNewForm({
      nome: '',
      sigla: '',
      tipo: 'sindicato',
      cidade: '',
      uf: 'SP',
      telefone: '',
      email: '',
      website: '',
      responsavel: '',
      observacoes: '',
    });
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Nome', 'Sigla', 'Tipo', 'Cidade', 'UF', 'Telefone', 'WhatsApp_Valido', 'Email', 'Status', 'Enviado_Em'];
    const rows = contacts.map((c) => {
      const p = progress[c.id];
      return [
        `"${c.id}"`,
        `"${c.nome.replace(/"/g, '""')}"`,
        `"${c.sigla || ''}"`,
        `"${c.tipo || ''}"`,
        `"${c.cidade || ''}"`,
        `"${c.uf || ''}"`,
        `"${c.telefone || ''}"`,
        `"${c.telefoneValido ? 'SIM' : 'NAO'}"`,
        `"${c.email || ''}"`,
        `"${p?.status || 'new'}"`,
        `"${p?.sentAt || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alotio_sindicatos_associacoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório CSV exportado com sucesso!');
  };

  return (
    <div className="space-y-3 sm:space-y-6 pb-12 w-full max-w-full min-w-0 overflow-hidden">
      {/* HERO BANNER (COMPACT ON MOBILE) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl sm:rounded-3xl p-3 sm:p-7 text-white shadow-md relative overflow-hidden w-full max-w-full">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 backdrop-blur border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <span>🏛️</span>
              <span>Sindicatos & Associações</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-200 sm:hidden">
              {stats.sent} de {stats.total} contatados ({stats.percent}%)
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold font-heading text-white tracking-tight mt-1.5 sm:mt-2">
            Parcerias com Sindicatos e Associações
          </h2>
          <p className="hidden sm:block mt-1.5 text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Contate lideranças, cooperativas, sindicatos e associações de transporte escolar em cada cidade cadastrada no Alô Tio. Proponha parceria gratuita para cadastrar associados e acelerar a difusão da plataforma.
          </p>
        </div>

        {/* METRICS BAR (4 COLUMNS ALWAYS) */}
        <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-4 border-t border-emerald-700/60 grid grid-cols-4 gap-1.5 sm:gap-3 text-center">
          <div className="bg-emerald-900/60 backdrop-blur rounded-xl p-1.5 sm:p-3 border border-emerald-600/30">
            <span className="block text-base sm:text-2xl font-black text-white">{stats.total}</span>
            <span className="text-[9px] sm:text-xs text-emerald-200 uppercase font-medium">Mapeados</span>
          </div>
          <div className="bg-emerald-900/60 backdrop-blur rounded-xl p-1.5 sm:p-3 border border-emerald-600/30">
            <span className="block text-base sm:text-2xl font-black text-emerald-300">{stats.citiesCount}</span>
            <span className="text-[9px] sm:text-xs text-emerald-200 uppercase font-medium">Cidades</span>
          </div>
          <div className="bg-emerald-900/60 backdrop-blur rounded-xl p-1.5 sm:p-3 border border-emerald-600/30">
            <span className="block text-base sm:text-2xl font-black text-green-400">{stats.sent}</span>
            <span className="text-[9px] sm:text-xs text-emerald-200 uppercase font-medium">Enviados</span>
          </div>
          <div className="bg-emerald-900/60 backdrop-blur rounded-xl p-1.5 sm:p-3 border border-emerald-600/30">
            <span className="block text-base sm:text-2xl font-black text-amber-300">{stats.pending}</span>
            <span className="text-[9px] sm:text-xs text-emerald-200 uppercase font-medium">Fila</span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-2.5 sm:mt-3 w-full bg-emerald-950/60 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* TOOLBAR & ACTIONS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-gray-200 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[36px] ${
                viewMode === 'card'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🎴</span>
              <span>Modo Fila (1 por 1)</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[36px] ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>📋</span>
              <span>Tabela ({filteredContacts.length})</span>
            </button>
          </div>

          {/* Quick Actions Buttons */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setIsTemplateEditorOpen(!isTemplateEditorOpen)}
              className="px-2 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition flex items-center justify-center gap-1 min-h-[38px]"
            >
              <span>✍️</span>
              <span>Mensagem</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-2 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold transition flex items-center justify-center gap-1 min-h-[38px]"
            >
              <span>➕</span>
              <span>Cadastrar</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-2 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition flex items-center justify-center gap-1 min-h-[38px]"
              title="Exportar CSV de Sindicatos"
            >
              <span>📤</span>
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* TEMPLATE EDITOR ACCORDION */}
        {isTemplateEditorOpen && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 sm:p-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">Mensagem de Parceria</h4>
                <p className="text-[11px] text-emerald-700">Usada nos disparos de WhatsApp e SMS.</p>
              </div>
              <button
                onClick={handleResetTemplate}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
              >
                Restaurar Padrão
              </button>
            </div>

            {/* Modelos Predefinidos */}
            <div className="flex flex-wrap gap-1.5">
              {SINDICATO_TEMPLATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setTemplateText(preset.text);
                    toast.success(`Modelo "${preset.name.split('(')[0].trim()}" aplicado!`);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition min-h-[32px] ${
                    templateText === preset.text
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs text-emerald-800">
              <span>{templateText.length} caracteres</span>
              <button
                onClick={handleSaveTemplate}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg transition min-h-[34px]"
              >
                Salvar Modelo
              </button>
            </div>
          </div>
        )}

        {/* QUICK STATE PILLS (CLICK TO FILTER BY UF - STRICTLY BOUNDED HORIZONTAL SCROLL) */}
        <div className="w-full max-w-full overflow-x-auto pb-1 pt-0.5 text-xs scrollbar-thin flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap mr-0.5 shrink-0">UF:</span>
          <button
            type="button"
            onClick={() => {
              setUfFilter('ALL');
              setCityFilter('ALL');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 shrink-0 min-h-[30px] ${
              ufFilter === 'ALL'
                ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Todos</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                ufFilter === 'ALL' ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {contacts.length}
            </span>
          </button>
          {availableUfs.map((uf) => {
            const count = contacts.filter((c) => c.uf === uf).length;
            const isSelected = ufFilter === uf;
            return (
              <button
                key={uf}
                type="button"
                onClick={() => {
                  setUfFilter(uf);
                  setCityFilter('ALL');
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 shrink-0 min-h-[30px] ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{uf}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE UF FILTER BANNER */}
        {ufFilter !== 'ALL' && (
          <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-emerald-950">
            <span className="truncate">
              📍 Entidades de <strong className="bg-emerald-700 text-white px-1.5 py-0.2 rounded text-[11px] font-black">{ufFilter}</strong> ({filteredContacts.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setUfFilter('ALL');
                setCityFilter('ALL');
                setCurrentIndex(0);
              }}
              className="text-emerald-800 font-bold hover:underline shrink-0 text-xs"
            >
              ✕ Ver todas
            </button>
          </div>
        )}

        {/* FILTERS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Search */}
          <div className="col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="Buscar por nome, sigla, cidade…"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
            />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
            >
              <option value="ALL">Cidades ({availableCities.length})</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentIndex(0);
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs sm:text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
            >
              <option value="all">Status: Todos</option>
              <option value="new">🆕 Pendentes ({stats.pending})</option>
              <option value="sent">✅ Enviados ({stats.sent})</option>
              <option value="skipped">⏭️ Pulados ({stats.skipped})</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: STEPPER CARD VIEW (MOBILE-FIRST TOP ACTIONS) */}
      {viewMode === 'card' && (
        <div className="w-full max-w-full min-w-0">
          {filteredContacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 sm:p-10 text-center border border-gray-200 text-gray-500 space-y-2">
              <span className="text-3xl block">🔍</span>
              <p className="font-bold text-gray-800 text-sm">Nenhum sindicato ou associação encontrado com estes filtros.</p>
              <button
                onClick={() => {
                  setUfFilter('ALL');
                  setCityFilter('ALL');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-emerald-700 underline text-xs font-semibold"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : currentContact ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm border border-gray-200 space-y-3.5 sm:space-y-5 w-full max-w-full min-w-0 overflow-hidden">
              {/* 1. Header: Entidade + Status + Stepper Nav */}
              <div className="space-y-2.5 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {currentContact.tipo ? currentContact.tipo.toUpperCase() : 'ENTIDADE'}
                      </span>
                      {currentContact.uf && (
                        <button
                          type="button"
                          onClick={() => {
                            setUfFilter(currentContact.uf || 'ALL');
                            setCityFilter('ALL');
                            setCurrentIndex(0);
                          }}
                          className="font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded text-[10px] transition border border-emerald-200"
                        >
                          {currentContact.uf}
                        </button>
                      )}
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-xs font-semibold text-gray-700">{currentContact.cidade}</span>
                    </div>
                    <h3 className="text-base sm:text-xl font-black text-gray-900 mt-1 font-heading break-words">
                      {currentContact.nome}
                    </h3>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0 text-right">
                    {progress[currentContact.id]?.status === 'sent' ? (
                      <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs inline-flex items-center gap-1">
                        ✓ Enviado
                      </span>
                    ) : progress[currentContact.id]?.status === 'skipped' ? (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                        ⏭️ Pulado
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                        🆕 Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper bar (Anterior / X de Y / Próximo) */}
                <div className="flex items-center justify-between gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white text-gray-700 font-bold text-xs flex items-center gap-1 min-h-[36px]"
                  >
                    <span>◀</span>
                    <span>Anterior</span>
                  </button>
                  <span className="text-xs font-extrabold text-gray-800">
                    {currentIndex + 1} de {filteredContacts.length}
                  </span>
                  <button
                    onClick={() => setCurrentIndex(Math.min(filteredContacts.length - 1, currentIndex + 1))}
                    disabled={currentIndex >= filteredContacts.length - 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white text-gray-700 font-bold text-xs flex items-center gap-1 min-h-[36px]"
                  >
                    <span>Próximo</span>
                    <span>▶</span>
                  </button>
                </div>
              </div>

              {/* 2. THE BIG ACTION DISPATCH BUTTONS (IMMEDIATELY VISIBLE ON MOBILE!) */}
              <div className="space-y-2 pt-0.5">
                <button
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-black py-3 sm:py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm sm:text-base min-h-[50px]"
                >
                  <span className="text-xl">💬</span>
                  <span>Enviar WhatsApp ({currentContact.telefone})</span>
                </button>

                <button
                  onClick={() => handleOpenSms()}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black py-2.5 sm:py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px]"
                >
                  <span className="text-lg">📱</span>
                  <span>Enviar SMS</span>
                </button>

                {/* Secondary actions: Pular / Marcar Enviado / Ligar */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={handleSkip}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold py-2 px-1 rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px]"
                    title="Pular este contato"
                  >
                    <span>⏭️</span>
                    <span>Pular</span>
                  </button>
                  <button
                    onClick={() => {
                      updateContactStatus(currentContact.id, 'sent', 'manual');
                      toast.success('Marcado como enviado!');
                      if (autoAdvance && currentIndex < filteredContacts.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                      }
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold py-2 px-1 rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px]"
                    title="Marcar como Enviado"
                  >
                    <span>✅</span>
                    <span>Enviado</span>
                  </button>
                  {currentContact.email ? (
                    <a
                      href={`mailto:${currentContact.email}?subject=${encodeURIComponent(
                        'Alô Tio — Proposta de Parceria com Transporte Escolar',
                      )}&body=${encodeURIComponent(activeMessageText)}`}
                      onClick={() => updateContactStatus(currentContact.id, 'sent', 'email')}
                      className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold py-2 px-1 rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px] text-center"
                    >
                      <span>✉️</span>
                      <span>E-mail</span>
                    </a>
                  ) : (
                    <a
                      href={`tel:${cleanPhoneForDispatch(currentContact.telefone).digits}`}
                      className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-bold py-2 px-1 rounded-xl text-xs transition flex items-center justify-center gap-1 min-h-[40px] text-center"
                    >
                      <span>📞</span>
                      <span>Ligar</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 3. COMPACT CONTACT & CREDENTIALS CARD (NEVER CUTS OFF, NEVER OVERFLOWS) */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                  <span className="font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">
                    Dados de Acesso & Contato
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentContact.senha || 'alotio2026');
                      toast.success('Senha copiada!');
                    }}
                    className="text-[11px] font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded transition"
                  >
                    Copiar Senha
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Telefone / Zap</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono font-bold text-gray-900 text-xs truncate">
                        {currentContact.telefone}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentContact.telefone);
                          toast.success('Telefone copiado!');
                        }}
                        className="text-[10px] text-gray-500 hover:text-gray-800"
                        title="Copiar telefone"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-800 block font-semibold uppercase">Senha Temporária</span>
                    <span className="font-mono font-black text-amber-950 text-xs block truncate mt-0.5">
                      {currentContact.senha || 'alotio2026'}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-gray-200/80 col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Login da Entidade</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentContact.usuario || currentContact.telefone);
                          toast.success('Login copiado!');
                        }}
                        className="text-[10px] text-gray-500 hover:text-gray-800 underline"
                      >
                        Copiar
                      </button>
                    </div>
                    <span className="font-mono font-bold text-gray-800 text-xs block truncate mt-0.5">
                      {currentContact.usuario || currentContact.telefone}
                    </span>
                  </div>
                </div>

                {(currentContact.email || currentContact.website) && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    {currentContact.email && (
                      <span className="text-gray-600 truncate max-w-[50%]" title={currentContact.email}>
                        ✉️ {currentContact.email}
                      </span>
                    )}
                    {currentContact.website && (
                      <a
                        href={currentContact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline truncate max-w-[50%]"
                      >
                        🌐 {currentContact.website.replace(/^https?:\/\//, '')} ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* 4. MESSAGE PREVIEW (COLLAPSIBLE / ACCORDION ON MOBILE) */}
              <details className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-2.5 group">
                <summary className="cursor-pointer list-none flex items-center justify-between text-xs font-bold text-emerald-950 select-none">
                  <span className="flex items-center gap-1.5">
                    <span>💬</span>
                    <span>Pré-visualização da Mensagem</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyMessage();
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 px-2 py-0.5 rounded font-semibold"
                    >
                      Copiar
                    </button>
                    <span className="text-xs text-emerald-700 transition group-open:rotate-180">▼</span>
                  </div>
                </summary>
                <div className="mt-2.5 bg-white rounded-lg p-2.5 border border-emerald-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto break-words font-sans shadow-inner">
                  {activeMessageText}
                </div>
              </details>

              {/* Auto-advance checkbox */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                  />
                  <span>Avançar automaticamente após disparar</span>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-gray-200 overflow-hidden">
          <div className="-mx-3 sm:mx-0 overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs sm:text-sm text-gray-700">
              <thead className="bg-gray-50 text-[10px] sm:text-xs uppercase font-extrabold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Entidade & Sigla</th>
                  <th className="py-3 px-2.5 sm:px-3">Tipo</th>
                  <th className="py-3 px-2.5 sm:px-3">Cidade / UF</th>
                  <th className="py-3 px-3 sm:px-4">Telefone / WhatsApp</th>
                  <th className="py-3 px-2.5 sm:px-3">Login / Senha</th>
                  <th className="py-3 px-2.5 sm:px-3">E-mail / Site</th>
                  <th className="py-3 px-2.5 sm:px-3">Status</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((c) => {
                  const p = progress[c.id];
                  const isSent = p?.status === 'sent';
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-3 sm:px-4">
                        <span className="font-bold text-gray-900 block">{c.nome}</span>
                        {c.sigla && (
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                            {c.sigla}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2.5 sm:px-3">
                        <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-500">
                          {c.tipo || 'Sindicato'}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 sm:px-3">
                        <span className="font-semibold text-gray-900 block">{c.cidade}</span>
                        {c.uf && (
                          <button
                            type="button"
                            onClick={() => {
                              setUfFilter(c.uf || 'ALL');
                              setCityFilter('ALL');
                              setCurrentIndex(0);
                            }}
                            className="text-[10px] sm:text-xs font-black text-emerald-700 hover:text-emerald-900 hover:underline bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 transition"
                            title={`Filtrar apenas ${c.uf}`}
                          >
                            {c.uf}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 font-mono">{c.telefone}</span>
                        {c.telefoneFixo && (
                          <span className="text-xs text-gray-400 block font-mono">Fixo: {c.telefoneFixo}</span>
                        )}
                      </td>
                      <td className="py-3 px-2.5 sm:px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {c.senha || '—'}
                          </span>
                          {c.senha && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(c.senha || '');
                                toast.success('Senha copiada!');
                              }}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-800 transition"
                              title="Copiar senha"
                            >
                              📋
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block truncate max-w-36 mt-0.5 font-mono">
                          {c.usuario || c.telefone}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 sm:px-3">
                        {c.email ? (
                          <span className="text-xs text-gray-600 block truncate max-w-40" title={c.email}>
                            {c.email}
                          </span>
                        ) : null}
                        {c.website ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 hover:underline block truncate max-w-40"
                          >
                            Site Oficial ↗
                          </a>
                        ) : null}
                      </td>
                      <td className="py-3 px-2.5 sm:px-3 whitespace-nowrap">
                        {isSent ? (
                          <span className="bg-green-100 text-green-800 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
                            ✅ Enviado
                          </span>
                        ) : p?.status === 'skipped' ? (
                          <span className="bg-amber-100 text-amber-800 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
                            ⏭️ Pulado
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWhatsApp(c)}
                            className="p-2 sm:px-2.5 sm:py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold text-xs transition"
                            title="Disparar WhatsApp"
                          >
                            💬 Zap
                          </button>
                          <button
                            onClick={() => handleOpenSms(c)}
                            className="p-2 sm:px-2.5 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition"
                            title="Disparar SMS"
                          >
                            📱 SMS
                          </button>
                          <button
                            onClick={() => handleCopyMessage(c)}
                            className="p-2 sm:px-2.5 sm:py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-bold text-xs transition"
                            title="Copiar mensagem"
                          >
                            📋
                          </button>
                          {isSent ? (
                            <button
                              onClick={() => updateContactStatus(c.id, 'new')}
                              className="p-2 sm:px-2.5 sm:py-1.5 text-xs text-gray-400 hover:text-gray-700 font-medium"
                              title="Marcar como pendente"
                            >
                              ↺
                            </button>
                          ) : (
                            <button
                              onClick={() => updateContactStatus(c.id, 'sent', 'manual')}
                              className="p-2 sm:px-2.5 sm:py-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                              title="Marcar como enviado"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR NOVO SINDICATO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl space-y-3.5 sm:space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🏛️</span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 font-heading">
                  Cadastrar Sindicato ou Associação
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 sm:space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome da Entidade *
                </label>
                <input
                  required
                  value={newForm.nome}
                  onChange={(e) => setNewForm({ ...newForm, nome: e.target.value })}
                  placeholder="Ex: SINDOTEC - Sindicato dos Transportadores..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sigla</label>
                  <input
                    value={newForm.sigla}
                    onChange={(e) => setNewForm({ ...newForm, sigla: e.target.value })}
                    placeholder="Ex: SINDOTEC"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newForm.tipo}
                    onChange={(e) => setNewForm({ ...newForm, tipo: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  >
                    <option value="sindicato">Sindicato</option>
                    <option value="associacao">Associação</option>
                    <option value="cooperativa">Cooperativa</option>
                    <option value="federacao">Federação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade *</label>
                  <input
                    required
                    value={newForm.cidade}
                    onChange={(e) => setNewForm({ ...newForm, cidade: e.target.value })}
                    placeholder="Ex: Curitiba"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">UF *</label>
                  <input
                    required
                    maxLength={2}
                    value={newForm.uf}
                    onChange={(e) => setNewForm({ ...newForm, uf: e.target.value.toUpperCase() })}
                    placeholder="PR"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 uppercase focus:ring-2 focus:ring-emerald-500 text-center font-bold min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  required
                  value={newForm.telefone}
                  onChange={(e) => setNewForm({ ...newForm, telefone: e.target.value })}
                  placeholder="(41) 99999-8888"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="contato@entidade.com.br"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Website</label>
                  <input
                    value={newForm.website}
                    onChange={(e) => setNewForm({ ...newForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Responsável / Presidente
                </label>
                <input
                  value={newForm.responsavel}
                  onChange={(e) => setNewForm({ ...newForm, responsavel: e.target.value })}
                  placeholder="Nome do Presidente ou Diretor"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 min-h-[42px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm min-h-[42px]"
                >
                  Salvar Entidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-6">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-3">
            <span>🏛️</span>
            <span>Expansão Brasil • Sindicatos & Associações</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Parcerias com Sindicatos e Associações
          </h2>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Contate lideranças, sindicatos e associações de transporte escolar em cada cidade cadastrada no Alô Tio.
            Proponha parceria gratuita para cadastrar associados, publicar comunicados oficiais e acelerar a difusão da plataforma em todo o Brasil.
          </p>
        </div>

        {/* METRICS BAR */}
        <div className="mt-6 pt-6 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-emerald-900/50 backdrop-blur rounded-2xl p-3 border border-emerald-600/30">
            <span className="block text-2xl font-black text-white">{stats.total}</span>
            <span className="text-xs text-emerald-200 uppercase font-medium">Entidades Mapeadas</span>
          </div>
          <div className="bg-emerald-900/50 backdrop-blur rounded-2xl p-3 border border-emerald-600/30">
            <span className="block text-2xl font-black text-emerald-300">{stats.citiesCount}</span>
            <span className="text-xs text-emerald-200 uppercase font-medium">Cidades Cobertas</span>
          </div>
          <div className="bg-emerald-900/50 backdrop-blur rounded-2xl p-3 border border-emerald-600/30">
            <span className="block text-2xl font-black text-green-400">{stats.sent}</span>
            <span className="text-xs text-emerald-200 uppercase font-medium">Contatados ({stats.percent}%)</span>
          </div>
          <div className="bg-emerald-900/50 backdrop-blur rounded-2xl p-3 border border-emerald-600/30">
            <span className="block text-2xl font-black text-amber-300">{stats.pending}</span>
            <span className="text-xs text-emerald-200 uppercase font-medium">Pendentes na Fila</span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-4 w-full bg-emerald-950/60 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
      </div>

      {/* TOOLBAR & ACTIONS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                viewMode === 'card'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🎴</span>
              <span>Modo Fila (1 por 1)</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>📋</span>
              <span>Tabela Geral ({filteredContacts.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsTemplateEditorOpen(!isTemplateEditorOpen)}
              className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 transition flex items-center gap-1.5"
            >
              <span>✍️</span>
              <span>Personalizar Mensagem</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>Adicionar Sindicato</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 transition"
              title="Exportar CSV de Sindicatos"
            >
              📤 CSV
            </button>
          </div>
        </div>

        {/* TEMPLATE EDITOR ACCORDION */}
        {isTemplateEditorOpen && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Mensagem Proposta de Parceria Alô Tio</h4>
                <p className="text-xs text-emerald-700">Esta mensagem é usada nos envios de WhatsApp e SMS.</p>
              </div>
              <button
                onClick={handleResetTemplate}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
              >
                Restaurar Padrão
              </button>
            </div>

            {/* Modelos Predefinidos */}
            <div>
              <span className="text-xs font-bold text-emerald-900 block mb-1.5 uppercase tracking-wide">
                Modelos Rápidos Prontos:
              </span>
              <div className="flex flex-wrap gap-2">
                {SINDICATO_TEMPLATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setTemplateText(preset.text);
                      toast.success(`Modelo "${preset.name.split('(')[0].trim()}" aplicado!`);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 ${
                      templateText === preset.text
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variable Tags */}
            <div>
              <span className="text-xs font-bold text-emerald-900 block mb-1.5 uppercase tracking-wide">
                Tags Dinâmicas (clique para inserir):
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { tag: '{nome}', desc: 'Nome ou sigla da entidade' },
                  { tag: '{responsavel}', desc: 'Responsável / Presidente' },
                  { tag: '{usuario}', desc: 'Login / E-mail de acesso' },
                  { tag: '{senha}', desc: 'Senha temporária de acesso' },
                  { tag: '{link}', desc: 'Link do painel de login' },
                  { tag: '{cidade}', desc: 'Cidade da entidade' },
                  { tag: '{uf}', desc: 'Estado (UF)' },
                  { tag: '{telefone}', desc: 'Telefone oficial' },
                ].map(({ tag, desc }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTemplateText((prev) => `${prev} ${tag}`)}
                    className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition"
                    title={desc}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs text-emerald-800">
              <span>{templateText.length} caracteres</span>
              <button
                onClick={handleSaveTemplate}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl transition"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {/* QUICK STATE PILLS (CLICK TO FILTER BY UF) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs scrollbar-thin">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap mr-1">Estado (UF):</span>
          <button
            type="button"
            onClick={() => {
              setUfFilter('ALL');
              setCityFilter('ALL');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              ufFilter === 'ALL'
                ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Todos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
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
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{uf}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
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
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="text-sm">📍</span>
              <span>
                Filtrando entidades de <strong className="bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-black">{ufFilter}</strong> ({filteredContacts.length} {filteredContacts.length === 1 ? 'entidade' : 'entidades'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUfFilter('ALL');
                setCityFilter('ALL');
                setCurrentIndex(0);
              }}
              className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
            >
              <span>✕</span>
              <span>Limpar filtro UF (Ver todas as {contacts.length})</span>
            </button>
          </div>
        )}

        {/* FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="Buscar por nome, sigla, cidade ou telefone…"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* UF Filter */}
          <div>
            <select
              value={ufFilter}
              onChange={(e) => {
                setUfFilter(e.target.value);
                setCityFilter('ALL');
                setCurrentIndex(0);
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Todos os Estados (UF)</option>
              {availableUfs.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Todas as Cidades ({availableCities.length})</option>
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
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Status: Todos</option>
              <option value="new">🆕 Pendentes ({stats.pending})</option>
              <option value="sent">✅ Enviados ({stats.sent})</option>
              <option value="skipped">⏭️ Pulados ({stats.skipped})</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: STEPPER CARD VIEW */}
      {viewMode === 'card' && (
        <div>
          {filteredContacts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 text-gray-500 space-y-3">
              <span className="text-4xl block">🔍</span>
              <p className="font-bold text-gray-800 text-base">Nenhum sindicato ou associação encontrado com estes filtros.</p>
              <button
                onClick={() => {
                  setUfFilter('ALL');
                  setCityFilter('ALL');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-emerald-700 underline text-sm font-semibold"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : currentContact ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
              {/* Card Stepper Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
                    🏛️
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {currentContact.tipo ? currentContact.tipo.toUpperCase() : 'ENTIDADE'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1 font-heading">
                      {currentContact.nome}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>{currentContact.cidade}</span>
                      {currentContact.uf && (
                        <button
                          type="button"
                          onClick={() => {
                            setUfFilter(currentContact.uf || 'ALL');
                            setCityFilter('ALL');
                            setCurrentIndex(0);
                          }}
                          className="font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded text-xs transition border border-emerald-200"
                          title={`Filtrar apenas entidades de ${currentContact.uf}`}
                        >
                          {currentContact.uf}
                        </button>
                      )}
                      <span>• Fonte: {currentContact.source}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-gray-700"
                    title="Anterior"
                  >
                    ◀
                  </button>
                  <span className="text-xs font-bold text-gray-600 px-2">
                    {currentIndex + 1} de {filteredContacts.length}
                  </span>
                  <button
                    onClick={() => setCurrentIndex(Math.min(filteredContacts.length - 1, currentIndex + 1))}
                    disabled={currentIndex >= filteredContacts.length - 1}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition text-gray-700"
                    title="Próximo"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Entity Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="block text-xs uppercase font-semibold text-gray-400">Telefone / WhatsApp</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-gray-900 text-base">{currentContact.telefone}</span>
                    {currentContact.telefoneValido && (
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        WhatsApp Válido
                      </span>
                    )}
                  </div>
                  {currentContact.telefoneFixo && (
                    <span className="text-xs text-gray-500 block mt-1">Fixo: {currentContact.telefoneFixo}</span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="block text-xs uppercase font-semibold text-gray-400">E-mail Institucional</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block truncate">
                    {currentContact.email || '—'}
                  </span>
                  {currentContact.responsavel && (
                    <span className="text-xs text-gray-500 block mt-1 truncate">
                      Resp: {currentContact.responsavel}
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="block text-xs uppercase font-semibold text-gray-400">Website / Canal Oficial</span>
                  {currentContact.website ? (
                    <a
                      href={currentContact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:underline text-sm mt-1 block truncate"
                    >
                      {currentContact.website.replace(/^https?:\/\//, '')} ↗
                    </a>
                  ) : (
                    <span className="font-bold text-gray-400 text-sm mt-1 block">Não informado</span>
                  )}
                  {currentContact.sigla && (
                    <span className="text-xs text-emerald-800 font-semibold block mt-1">
                      Sigla: {currentContact.sigla}
                    </span>
                  )}
                </div>

                <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs uppercase font-extrabold text-amber-900">
                      🔑 Acesso & Senha
                    </span>
                    {currentContact.senha && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentContact.senha || '');
                          toast.success('Senha temporária copiada!');
                        }}
                        className="text-[11px] font-bold text-amber-900 bg-amber-200/90 hover:bg-amber-300 px-2 py-0.5 rounded-md transition"
                        title="Copiar senha"
                      >
                        Copiar Senha
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Login:</span>
                      <span className="font-bold text-gray-900 font-mono truncate max-w-[150px]">
                        {currentContact.usuario || currentContact.telefone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Senha:</span>
                      <span className="font-black text-amber-950 font-mono bg-white px-2 py-0.5 rounded border border-amber-300">
                        {currentContact.senha || 'alotio2026'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-500">Status atual:</span>
                  {progress[currentContact.id]?.status === 'sent' ? (
                    <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span>✅</span>
                      <span>
                        Enviado via {progress[currentContact.id]?.channel?.toUpperCase() || 'CANAL'} em{' '}
                        {new Date(progress[currentContact.id]?.sentAt || '').toLocaleDateString('pt-BR')}
                      </span>
                    </span>
                  ) : progress[currentContact.id]?.status === 'skipped' ? (
                    <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                      ⏭️ Pulado
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">
                      🆕 Pendente de Contato
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Avançar automaticamente após disparar</span>
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-900">
                    Pré-visualização da Mensagem Personalizada:
                  </span>
                  <button
                    onClick={() => handleCopyMessage()}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                  >
                    <span>📋</span>
                    <span>Copiar Texto</span>
                  </button>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner font-sans">
                  {activeMessageText}
                </div>
              </div>

              {/* Big Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold px-6 py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2.5 text-base"
                >
                  <span className="text-xl">💬</span>
                  <span>Enviar WhatsApp</span>
                </button>

                <button
                  onClick={() => handleOpenSms()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2.5 text-base"
                >
                  <span className="text-xl">📱</span>
                  <span>Enviar SMS</span>
                </button>

                {currentContact.email ? (
                  <a
                    href={`mailto:${currentContact.email}?subject=${encodeURIComponent(
                      'Alô Tio — Proposta de Parceria com Transporte Escolar',
                    )}&body=${encodeURIComponent(activeMessageText)}`}
                    onClick={() => updateContactStatus(currentContact.id, 'sent', 'email')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm text-center"
                  >
                    <span className="text-lg">✉️</span>
                    <span>Enviar E-mail</span>
                  </a>
                ) : (
                  <a
                    href={`tel:${cleanPhoneForDispatch(currentContact.telefone).digits}`}
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-extrabold px-4 py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm text-center"
                  >
                    <span className="text-lg">📞</span>
                    <span>Ligar no Telefone</span>
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSkip}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-4 rounded-2xl transition text-sm flex items-center justify-center gap-1"
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
                    className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-3 py-4 rounded-2xl transition text-sm flex items-center justify-center gap-1"
                    title="Marcar manualmente"
                  >
                    <span>✅</span>
                    <span>Marcar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase font-extrabold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Entidade & Sigla</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Cidade / UF</th>
                  <th className="py-3 px-4">Telefone / WhatsApp</th>
                  <th className="py-3 px-3">Login / Senha</th>
                  <th className="py-3 px-3">E-mail / Site</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((c) => {
                  const p = progress[c.id];
                  const isSent = p?.status === 'sent';
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{c.nome}</span>
                        {c.sigla && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                            {c.sigla}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs uppercase font-semibold text-gray-500">
                          {c.tipo || 'Sindicato'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-900 block">{c.cidade}</span>
                        {c.uf && (
                          <button
                            type="button"
                            onClick={() => {
                              setUfFilter(c.uf || 'ALL');
                              setCityFilter('ALL');
                              setCurrentIndex(0);
                            }}
                            className="text-xs font-black text-emerald-700 hover:text-emerald-900 hover:underline bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 transition"
                            title={`Filtrar apenas ${c.uf}`}
                          >
                            {c.uf}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{c.telefone}</span>
                        {c.telefoneFixo && (
                          <span className="text-xs text-gray-400 block">Fixo: {c.telefoneFixo}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
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
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isSent ? (
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            ✅ Enviado
                          </span>
                        ) : p?.status === 'skipped' ? (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            ⏭️ Pulado
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWhatsApp(c)}
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold text-xs transition"
                            title="Disparar WhatsApp"
                          >
                            💬 Zap
                          </button>
                          <button
                            onClick={() => handleOpenSms(c)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition"
                            title="Disparar SMS"
                          >
                            📱 SMS
                          </button>
                          <button
                            onClick={() => handleCopyMessage(c)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-bold text-xs transition"
                            title="Copiar mensagem"
                          >
                            📋
                          </button>
                          {isSent ? (
                            <button
                              onClick={() => updateContactStatus(c.id, 'new')}
                              className="p-2 text-xs text-gray-400 hover:text-gray-700 font-medium"
                              title="Marcar como pendente"
                            >
                              ↺
                            </button>
                          ) : (
                            <button
                              onClick={() => updateContactStatus(c.id, 'sent', 'manual')}
                              className="p-2 text-xs text-emerald-700 hover:text-emerald-900 font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <h3 className="text-lg font-bold text-gray-900 font-heading">
                  Cadastrar Sindicato ou Associação
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome da Entidade *
                </label>
                <input
                  required
                  value={newForm.nome}
                  onChange={(e) => setNewForm({ ...newForm, nome: e.target.value })}
                  placeholder="Ex: SINDOTEC - Sindicato dos Transportadores..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sigla</label>
                  <input
                    value={newForm.sigla}
                    onChange={(e) => setNewForm({ ...newForm, sigla: e.target.value })}
                    placeholder="Ex: SINDOTEC"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newForm.tipo}
                    onChange={(e) => setNewForm({ ...newForm, tipo: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="sindicato">Sindicato</option>
                    <option value="associacao">Associação</option>
                    <option value="cooperativa">Cooperativa</option>
                    <option value="federacao">Federação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade *</label>
                  <input
                    required
                    value={newForm.cidade}
                    onChange={(e) => setNewForm({ ...newForm, cidade: e.target.value })}
                    placeholder="Ex: Curitiba"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 uppercase focus:ring-2 focus:ring-emerald-500 text-center font-bold"
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
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="contato@entidade.com.br"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Website</label>
                  <input
                    value={newForm.website}
                    onChange={(e) => setNewForm({ ...newForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
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

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { ADMIN_LIST_PAGE_SIZE, type Profile } from '@/types';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';

export default function AdminWhatsAppPage() {
  const [status, setStatus] = useState<{
    configured: boolean;
    monthlyLimit: number;
    sentThisMonth: number;
    remaining: number;
    monthLabel: string;
  } | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('APPROVED');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const lastDebounced = useRef<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [label, setLabel] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    sentCount: number;
    failedCount: number;
    results: { displayName: string; ok: boolean; error?: string }[];
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchInput.trim();
      if (
        lastDebounced.current !== undefined &&
        lastDebounced.current !== next
      ) {
        setPage(1);
      }
      lastDebounced.current = next;
      setSearch(next);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadStatus = useCallback(async () => {
    try {
      const s = await api.adminWhatsAppStatus();
      setStatus(s);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar status');
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(ADMIN_LIST_PAGE_SIZE),
      };
      if (filter) params.status = filter;
      if (search) params.search = search;
      const res = await api.adminGetProfiles(params);
      if (res.totalPages >= 1 && page > res.totalPages) {
        setPage(res.totalPages);
        return;
      }
      setProfiles(res.data.filter((p) => p.phone?.replace(/\D/g, '').length));
      setTotalPages(res.totalPages);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  }, [filter, page, search]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of profiles) {
        if (p.phone) next.add(p.id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const sendBulk = async () => {
    const ids = [...selected];
    const text = message.trim();
    if (ids.length === 0) {
      toast.error('Selecione ao menos um transportador.');
      return;
    }
    if (!text) {
      toast.error('Escreva a mensagem.');
      return;
    }
    if (
      status &&
      ids.length > status.remaining
    ) {
      toast.error(
        `Restam ${status.remaining} envios neste mês; você selecionou ${ids.length}.`,
      );
      return;
    }
    if (
      !confirm(
        `Enviar para ${ids.length} transportador(es) via template WhatsApp?`,
      )
    ) {
      return;
    }
    setSending(true);
    try {
      const res = await api.adminWhatsAppBulk({
        profileIds: ids,
        message: text,
        ...(label.trim() ? { label: label.trim() } : {}),
      });
      setLastResult(res);
      toast.success(
        `Enviados: ${res.sentCount} · Falhas: ${res.failedCount}`,
      );
      clearSelection();
      await loadStatus();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro no envio');
    } finally {
      setSending(false);
    }
  };

  if (loading && profiles.length === 0 && !status) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">
        WhatsApp (admin)
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Envio em massa para transportadores via API oficial da Meta (Cloud API).
        Mensagens proativas usam template aprovado. Cota gratuita de desenvolvedor:
        até 1.000 conversas/mês (contamos cada envio bem-sucedido).
      </p>

      {status && (
        <div
          className={`rounded-xl border p-4 mb-6 ${
            status.configured
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <p className="text-sm font-medium text-gray-800">
            {status.configured
              ? `API configurada · ${status.monthLabel}`
              : 'API não configurada no servidor'}
          </p>
          {status.configured ? (
            <p className="text-sm text-gray-600 mt-1">
              Enviados: {status.sentThisMonth} / {status.monthlyLimit} · Restam:{' '}
              {status.remaining}
            </p>
          ) : (
            <p className="text-xs text-gray-600 mt-2">
              Defina WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID e
              WHATSAPP_VERIFY_TOKEN no backend.
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Mensagem (corpo do template — variável {'{{1}}'})
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1024}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Olá! Temos uma novidade no Alô Tio…"
          />
        </label>
        <label className="block text-xs text-gray-500">
          Rótulo interno (opcional)
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Ex.: aviso maio 2026"
          />
        </label>
        <p className="text-xs text-gray-500">
          Template padrão: <code className="bg-gray-100 px-1 rounded">alotio_mensagem</code>{' '}
          (crie no Meta Business com corpo: {'{{1}}'}).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            { value: 'APPROVED', label: 'Aprovados' },
            { value: '', label: 'Todos' },
            { value: 'PENDING', label: 'Pendentes' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => {
              setPage(1);
              setFilter(opt.value);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === opt.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Buscar por nome ou prefixo…"
        className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />

      <div className="flex flex-wrap gap-2 mb-3 text-sm">
        <button
          type="button"
          onClick={selectAllOnPage}
          className="text-primary font-medium hover:underline"
        >
          Selecionar página
        </button>
        <span className="text-gray-400">·</span>
        <button
          type="button"
          onClick={clearSelection}
          className="text-gray-600 hover:underline"
        >
          Limpar ({selected.size})
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <ul className="space-y-2 mb-6">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3"
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                className="mt-1"
                aria-label={`Selecionar ${p.displayName}`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {p.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {p.phone} · prefixo {p.prefixo} · {p.status}
                </p>
              </div>
            </li>
          ))}
          {profiles.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum perfil com telefone.</p>
          )}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600 py-1.5">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      <button
        type="button"
        disabled={sending || !status?.configured || selected.size === 0}
        onClick={sendBulk}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
      >
        {sending
          ? 'Enviando…'
          : `Enviar WhatsApp (${selected.size})`}
      </button>

      {lastResult && lastResult.failedCount > 0 && (
        <div className="mt-6 border border-red-200 bg-red-50 rounded-xl p-4">
          <p className="text-sm font-medium text-red-800 mb-2">Falhas no último envio</p>
          <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
            {lastResult.results
              .filter((r) => !r.ok)
              .map((r, i) => (
                <li key={i}>
                  {r.displayName}: {r.error}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

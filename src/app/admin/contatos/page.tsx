'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ContactSubmission, ContactSubmissionStatus } from '@/types';
import { ADMIN_LIST_PAGE_SIZE } from '@/types';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';

function sourceLabel(s: ContactSubmission['source']): string {
  return s === 'FALE_CONOSCO' ? 'Fale Conosco' : 'Cadastro escola';
}

export default function AdminContatosPage() {
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ContactSubmissionStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyChannel, setReplyChannel] = useState<'email' | 'whatsapp' | 'both'>(
    'email',
  );
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.adminListContactSubmissions({
        page,
        limit: ADMIN_LIST_PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setRows(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (row: ContactSubmission) => {
    setSelected(row);
    setReplyText('');
    setReplySubject('');
    try {
      const full = await api.adminGetContactSubmission(row.id);
      setSelected(full);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao abrir');
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setReplyText('');
    setReplySubject('');
    setReplyChannel('email');
  };

  const sendReply = async () => {
    if (!selected || selected.status !== 'PENDING') return;
    const msg = replyText.trim();
    if (!msg) {
      toast.error('Escreva a resposta antes de enviar.');
      return;
    }
    setSending(true);
    try {
      await api.adminReplyContactSubmission(selected.id, {
        message: msg,
        channel: replyChannel,
        ...(replySubject.trim() ? { subject: replySubject.trim() } : {}),
      });
      toast.success(
        replyChannel === 'email'
          ? 'E-mail enviado ao visitante.'
          : replyChannel === 'whatsapp'
            ? 'WhatsApp enviado.'
            : 'E-mail e WhatsApp enviados.',
      );
      closeDetail();
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar');
    } finally {
      setSending(false);
    }
  };

  if (loading && rows.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">
        Mensagens do site
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Pedidos do Fale Conosco e do formulário de cadastro de escola. Responda por aqui — o visitante recebe o e-mail pela plataforma.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            { value: '' as const, label: 'Todas' },
            { value: 'PENDING' as const, label: 'Pendentes' },
            { value: 'REPLIED' as const, label: 'Respondidas' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => {
              setPage(1);
              setStatusFilter(opt.value);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === opt.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {total === 0 ? 'Nenhuma mensagem.' : `${total} mensagem(ns) no total.`}
      </p>

      <div className="space-y-3">
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => openDetail(r)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-primary-200 transition"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {r.name}{' '}
                  <span className="text-gray-500 font-normal">· {r.email}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {sourceLabel(r.source)} ·{' '}
                  {new Date(r.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  r.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {r.status === 'PENDING' ? 'Pendente' : 'Respondida'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2 whitespace-pre-wrap">
              {r.message}
            </p>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="py-2 text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contato-detalhe-titulo"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fechar"
            onClick={closeDetail}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto sm:m-0">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
              <h2 id="contato-detalhe-titulo" className="font-semibold text-gray-900">
                {sourceLabel(selected.source)}
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">De</p>
                <p className="font-medium text-gray-900">
                  {selected.name} &lt;{selected.email}&gt;
                </p>
                {selected.phone ? (
                  <p className="text-sm text-gray-600 mt-1">Tel. {selected.phone}</p>
                ) : null}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(selected.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Mensagem</p>
                <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100 max-h-48 overflow-y-auto">
                  {selected.message}
                </div>
              </div>

              {selected.status === 'REPLIED' && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Já respondida
                  </p>
                  {selected.replySubject ? (
                    <p className="text-xs text-gray-500 mb-2">
                      Assunto: {selected.replySubject}
                    </p>
                  ) : null}
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-green-50 rounded-lg p-3 border border-green-100">
                    {selected.replyText}
                  </div>
                  {selected.repliedAt ? (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(selected.repliedAt).toLocaleString('pt-BR')}
                      {selected.repliedBy?.email
                        ? ` · por ${selected.repliedBy.email}`
                        : ''}
                    </p>
                  ) : null}
                </div>
              )}

              {selected.status === 'PENDING' && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-800">Responder</p>
                  <fieldset className="space-y-2">
                    <legend className="text-xs text-gray-500 mb-1">Canal</legend>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="reply-channel"
                        checked={replyChannel === 'email'}
                        onChange={() => setReplyChannel('email')}
                      />
                      Só e-mail
                    </label>
                    <label
                      className={`flex items-center gap-2 text-sm ${
                        selected.phone ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reply-channel"
                        checked={replyChannel === 'whatsapp'}
                        onChange={() => setReplyChannel('whatsapp')}
                        disabled={!selected.phone}
                      />
                      Só WhatsApp
                      {!selected.phone ? ' (sem telefone)' : ''}
                    </label>
                    <label
                      className={`flex items-center gap-2 text-sm ${
                        selected.phone ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reply-channel"
                        checked={replyChannel === 'both'}
                        onChange={() => setReplyChannel('both')}
                        disabled={!selected.phone}
                      />
                      E-mail e WhatsApp
                    </label>
                  </fieldset>
                  {replyChannel !== 'whatsapp' && (
                    <label className="block text-xs text-gray-500">
                      Assunto do e-mail (opcional)
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder="Padrão: aloTio — resposta ao seu contato"
                        className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                      />
                    </label>
                  )}
                  <label className="block text-xs text-gray-500">
                    Mensagem
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={8}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900"
                      placeholder="Sua resposta…"
                    />
                  </label>
                  {replyChannel !== 'email' && selected.phone && (
                    <p className="text-xs text-gray-500">
                      Se o contato já mandou WhatsApp para o número da plataforma nas
                      últimas 24h, a resposta vai em texto livre; caso contrário, usa o
                      template configurado (ex.: alotio_mensagem).
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={sending}
                    onClick={sendReply}
                    className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? 'Enviando…' : 'Enviar resposta'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

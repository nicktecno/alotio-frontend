'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api, assetUrl } from '@/lib/api';
import { compressImage } from '@/lib/compressImage';
import type { Product, StoreType } from '@/types';

function formatPrice(cents: number | null): string {
  if (cents == null) return 'Sob consulta';
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  BLOCKED: 'Bloqueado',
};
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-gray-100 text-gray-600',
  BLOCKED: 'bg-red-100 text-red-700',
};

/** Parser CSV mínimo com suporte a campos entre aspas. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeType, setStoreType] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);
  const imageRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productsResponse, storeResponse] = await Promise.all([
        api.listMyProducts({ limit: '100' }),
        api.getMyStore(),
      ]);
      setProducts(productsResponse.data);
      setStoreType(storeResponse.store?.type ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const priceToCents = (v: string): number | undefined => {
    const clean = v.replace(/[^\d,.-]/g, '').replace(',', '.');
    if (!clean) return undefined;
    const n = Number(clean);
    return Number.isFinite(n) ? Math.round(n * 100) : undefined;
  };

  const isSchool = storeType === 'ESCOLA';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(`Informe o título ${isSchool ? 'da promoção' : 'do anúncio'}.`);
      return;
    }
    setSaving(true);
    try {
      await api.createProduct({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priceCents: priceToCents(form.price),
        category: form.category.trim() || undefined,
      });
      toast.success(isSchool ? 'Promoção publicada!' : 'Anúncio publicado!');
      setForm({ title: '', description: '', price: '', category: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao publicar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCsv = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast.error('Arquivo vazio.');
        return;
      }
      // Detecta cabeçalho
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const hasHeader = header.includes('titulo') || header.includes('title');
      const dataRows = hasHeader ? rows.slice(1) : rows;
      const items = dataRows
        .map((r) => ({
          title: (r[0] ?? '').trim(),
          description: (r[1] ?? '').trim() || undefined,
          priceCents: priceToCents(r[2] ?? ''),
          category: (r[3] ?? '').trim() || undefined,
        }))
        .filter((p) => p.title);
      if (items.length === 0) {
        toast.error('Nenhum anúncio válido encontrado no arquivo.');
        return;
      }
      const res = await api.createProductsBulk(items);
      toast.success(`${res.created} anúncio(s) importado(s)!`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao importar.');
    } finally {
      setImporting(false);
    }
  };

  const toggleStatus = async (p: Product) => {
    const next = p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateProduct(p.id, { status: next });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar.');
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Excluir ${isSchool ? 'a promoção' : 'o anúncio'} "${p.title}"?`)) return;
    try {
      await api.deleteProduct(p.id);
      toast.success(isSchool ? 'Promoção excluída.' : 'Anúncio excluído.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir.');
    }
  };

  const addImage = async (productId: string, file: File) => {
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('image', compressed);
      await api.uploadProductImage(productId, fd);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      await api.deleteProductImage(imageId);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover imagem.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primary-900">
          {isSchool ? 'Promoções da escola' : 'Meus Anúncios'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => csvRef.current?.click()}
            disabled={importing}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
          >
            {importing ? 'Importando…' : '📄 Importar CSV'}
          </button>
          <input
            ref={csvRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleCsv(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            {isSchool ? '+ Nova promoção' : '+ Novo anúncio'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        CSV: colunas <code>título, descrição, preço, categoria</code> (uma linha
        por {isSchool ? 'promoção' : 'anúncio'}). O preço é opcional.
      </p>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 mb-6"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (opcional)
              </label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ex.: 4500,00"
                className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria (opcional)
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {saving ? 'Publicando…' : isSchool ? 'Publicar promoção' : 'Publicar anúncio'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">
          Você ainda não tem {isSchool ? 'promoções' : 'anúncios'}. Crie a primeira publicação acima.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-primary-900">{p.title}</h3>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatPrice(p.priceCents)}</p>
                  {p.status === 'BLOCKED' && p.blockedReason && (
                    <p className="text-xs text-red-600 mt-1">
                      Motivo: {p.blockedReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.status !== 'BLOCKED' && (
                    <>
                      <button
                        onClick={() => toggleStatus(p)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                      >
                        {p.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => imageRefs.current[p.id]?.click()}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                      >
                        + Imagem
                      </button>
                      <input
                        ref={(el) => {
                          imageRefs.current[p.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) addImage(p.id, f);
                          e.target.value = '';
                        }}
                      />
                    </>
                  )}
                  <button
                    onClick={() => remove(p)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {p.images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {p.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={assetUrl(img.url) ?? ''}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition"
                        aria-label="Remover imagem"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

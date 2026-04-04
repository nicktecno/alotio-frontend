'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function Body() {
  const search = useSearchParams();
  const token = search.get('token');
  const [preview, setPreview] = useState<{ previewText: string; transportadorName: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    api.publicContractParentPreview(token).then(setPreview).catch((e) => toast.error(e.message));
  }, [token]);

  const accept = async () => {
    if (!token) return;
    try {
      const r = await api.publicContractParentAccept(token);
      toast.success(r.finalPdfUrl ? 'Contrato registrado' : 'Aceite registrado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro');
    }
  };

  if (!token) return <p className="p-6">Link inválido.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Contrato — {preview?.transportadorName ?? '…'}</h1>
      <pre className="whitespace-pre-wrap text-xs bg-gray-50 border rounded p-4 max-h-[60vh] overflow-auto">{preview?.previewText ?? 'Carregando…'}</pre>
      <button type="button" onClick={accept} className="px-4 py-2 bg-primary text-white rounded-lg">
        Li e aceito o contrato
      </button>
    </div>
  );
}

export default function AssinarContratoPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando…</div>}>
      <Body />
    </Suspense>
  );
}

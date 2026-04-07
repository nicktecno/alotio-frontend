'use client';

import { useEffect, useState } from 'react';

export function SchoolRegistrationModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (cityName: string, schoolName: string) => Promise<void>;
}) {
  const [cityName, setCityName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCityName('');
      setSchoolName('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = cityName.trim();
    const s = schoolName.trim();
    if (!c && !s) return;
    setSubmitting(true);
    try {
      await onSubmit(c, s);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-reg-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="school-reg-title" className="text-lg font-semibold text-gray-900">
          Pedir cadastro no sistema
        </h2>
        <p className="text-xs text-gray-500">
          Preencha o que faltar na lista. Pelo menos cidade ou escola. Seus dados de login vão no pedido automaticamente.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="school-reg-city" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              id="school-reg-city"
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="Nome da cidade"
              autoComplete="address-level2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label htmlFor="school-reg-school" className="block text-sm font-medium text-gray-700 mb-1">
              Escola
            </label>
            <input
              id="school-reg-school"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Nome da escola"
              autoComplete="organization"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-end pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || (!cityName.trim() && !schoolName.trim())}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando…' : 'Enviar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

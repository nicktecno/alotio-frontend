'use client';

export function DeleteConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  submitting,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-confirm-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <div className="text-sm text-gray-600 leading-relaxed">{description}</div>
        <div className="flex flex-wrap gap-3 justify-end pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export default function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  disabled,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
      <span>
        {total === 0
          ? 'Nenhum registro'
          : `Mostrando ${from}–${to} de ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
        >
          Anterior
        </button>
        <span className="text-gray-500 tabular-nums">
          Página {page} de {totalPages || 1}
        </span>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

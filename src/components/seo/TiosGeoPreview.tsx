import { TioPublicCard } from '@/components/seo/TioPublicCard';
import type { TiosGeoSearch } from '@/lib/seo-transporte-api';

type Props = {
  preview: TiosGeoSearch;
  regionLabel?: string;
};

/** Bloco indexável (SSR) — renderizado só quando /tios tem filtros GEO na URL. */
export function TiosGeoPreview({ preview, regionLabel }: Props) {
  const label = regionLabel?.trim() || 'esta região';

  return (
    <section className="mb-10" aria-labelledby="tios-geo-preview-heading">
      <h2
        id="tios-geo-preview-heading"
        className="font-heading mb-2 text-xl font-semibold text-gray-900"
      >
        Condutores escolares em {label}
      </h2>
      <p className="mb-5 max-w-2xl text-sm text-gray-600">
        {preview.total} transportador{preview.total === 1 ? '' : 'es'} cadastrado
        {preview.total === 1 ? '' : 's'}. Escolha a escola abaixo para refinar a
        busca.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {preview.data.map((tio) => (
          <li key={tio.id}>
            <TioPublicCard tio={tio} heading="h3" />
          </li>
        ))}
      </ul>
      {preview.totalPages > 1 && (
        <p className="mt-4 text-sm text-gray-500">
          Mostrando {preview.data.length} de {preview.total} perfis nesta região.
        </p>
      )}
    </section>
  );
}

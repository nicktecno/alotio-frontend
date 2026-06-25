import Link from 'next/link';
import { assetUrl } from '@/lib/api';
import type { TioPublicView } from '@/types';

type Props = {
  tio: TioPublicView;
  /** Heading level for SEO hierarchy on listing pages. */
  heading?: 'h2' | 'h3';
};

export function TioPublicCard({ tio, heading = 'h3' }: Props) {
  const Heading = heading;
  const avatar = assetUrl(tio.avatarUrl);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <Link href={`/tios/${tio.id}`} className="group block">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {tio.displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Heading className="truncate font-semibold text-gray-900 group-hover:text-primary">
              {tio.displayName}
            </Heading>
            <p className="text-sm text-gray-500">Prefixo {tio.prefixo}</p>
            <p className="mt-1 text-sm text-gray-600">
              {tio.city.name}/{tio.city.state.uf}
              {tio.isIntermunicipal && tio.secondaryCity
                ? ` · também ${tio.secondaryCity.name}/${tio.secondaryCity.state.uf}`
                : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {tio.isPremium && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                Premium
              </span>
            )}
          </div>
        </div>

        {(tio.reviewsApprovedCount ?? 0) > 0 && tio.reviewAvgOverall != null && (
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-amber-800">
            <span className="text-base leading-none text-amber-500">★</span>
            <span className="font-bold">{tio.reviewAvgOverall.toFixed(1)}</span>
            <span className="font-normal text-gray-500">
              ({tio.reviewsApprovedCount}{' '}
              {tio.reviewsApprovedCount === 1 ? 'avaliação' : 'avaliações'})
            </span>
          </p>
        )}

        {tio.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{tio.bio}</p>
        )}

        {tio.schools.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Escolas atendidas">
            {tio.schools.slice(0, 4).map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
              >
                {s.name}
              </li>
            ))}
            {tio.schools.length > 4 && (
              <li className="text-xs text-gray-400">
                +{tio.schools.length - 4} escolas
              </li>
            )}
          </ul>
        )}

        {tio.neighborhoods.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Bairros:{' '}
            {tio.neighborhoods
              .slice(0, 4)
              .map((n) => n.name)
              .join(', ')}
            {tio.neighborhoods.length > 4
              ? ` (+${tio.neighborhoods.length - 4})`
              : ''}
          </p>
        )}

        <p className="mt-3 text-sm font-medium text-primary group-hover:underline">
          Ver perfil completo →
        </p>
      </Link>
    </article>
  );
}

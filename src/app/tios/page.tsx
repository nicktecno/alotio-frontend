import TiosSearchClient, {
  type TiosSearchInitialFilters,
} from './TiosSearchClient';
import { TiosGeoPreview } from '@/components/seo/TiosGeoPreview';
import { fetchTiosForGeo } from '@/lib/seo-transporte-api';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/**
 * ISR 24h por URL completa (incl. query GEO). /tios sem params = shell estático, sem fetch extra.
 */
export const revalidate = 86_400;

export default async function TiosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const initialFilters: TiosSearchInitialFilters = {
    stateId: pickParam(sp, 'stateId'),
    cityId: pickParam(sp, 'cityId'),
    neighborhoodId: pickParam(sp, 'neighborhoodId'),
  };

  const hasGeoFilter = Boolean(
    initialFilters.cityId || initialFilters.stateId,
  );

  const geoPreview = hasGeoFilter
    ? await fetchTiosForGeo({
        cityId: initialFilters.cityId,
        stateId: initialFilters.stateId,
        neighborhoodId: initialFilters.neighborhoodId,
        limit: 12,
      })
    : null;

  const regionLabel =
    geoPreview?.data[0]?.city?.name &&
    geoPreview.data[0]?.city?.state?.uf
      ? `${geoPreview.data[0].city.name} (${geoPreview.data[0].city.state.uf})`
      : undefined;

  const previewBlock =
    geoPreview && geoPreview.data.length > 0 ? (
      <TiosGeoPreview preview={geoPreview} regionLabel={regionLabel} />
    ) : null;

  return (
    <TiosSearchClient initialFilters={initialFilters} geoPreview={previewBlock} />
  );
}

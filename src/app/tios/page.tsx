import TiosSearchClient, {
  type TiosSearchInitialFilters,
} from './TiosSearchClient';
import { TiosGeoPreview } from '@/components/seo/TiosGeoPreview';
import {
  fetchTiosForGeo,
  resolveTiosSearchParams,
} from '@/lib/seo-transporte-api';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * ISR 30 dias por URL (literal estático exigido pelo Next.js).
 * /tios sem params = shell estático.
 */
export const revalidate = 2_592_000;

export default async function TiosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const resolved = await resolveTiosSearchParams(sp);

  const initialFilters: TiosSearchInitialFilters = {
    stateId: resolved.stateId,
    cityId: resolved.cityId,
    neighborhoodId: resolved.neighborhoodId,
    schoolId: resolved.schoolId,
    page: resolved.page,
  };

  const hasGeoFilter = Boolean(resolved.cityId || resolved.stateId);

  const geoPreview = hasGeoFilter
    ? await fetchTiosForGeo({
        cityId: resolved.cityId,
        stateId: resolved.stateId,
        neighborhoodId: resolved.neighborhoodId,
        limit: 12,
      })
    : null;

  const regionLabel =
    geoPreview?.data[0]?.city?.name &&
    geoPreview?.data[0]?.city?.state?.uf
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

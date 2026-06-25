import TiosSearchClient, {
  type TiosSearchInitialFilters,
} from './TiosSearchClient';

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

export default async function TiosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const initialFilters: TiosSearchInitialFilters = {
    stateId: pickParam(sp, 'stateId'),
    cityId: pickParam(sp, 'cityId'),
    neighborhoodId: pickParam(sp, 'neighborhoodId'),
  };

  return <TiosSearchClient initialFilters={initialFilters} />;
}

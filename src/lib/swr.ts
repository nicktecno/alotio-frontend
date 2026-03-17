'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import { api, ApiError } from './api';
import type {
  State,
  City,
  School,
  Neighborhood,
  Profile,
  SubscriptionPlan,
  Subscription,
} from '@/types';

const LONG_CACHE = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 600_000, // 10 min – estados, cidades, escolas, bairros, planos mudam pouco
  errorRetryCount: 2,
};

const SHORT_CACHE = {
  revalidateOnFocus: false,
  dedupingInterval: 30_000,
  errorRetryCount: 2,
};

// ─── Public data (long cache, rarely changes) ───

export function useStates() {
  return useSWR('states', () => api.getStates() as Promise<State[]>, LONG_CACHE);
}

export function useCities(stateId?: string, withTios?: boolean) {
  return useSWR(
    stateId ? `cities-${stateId}-${withTios || ''}` : null,
    () => api.getCities(stateId, withTios) as Promise<City[]>,
    LONG_CACHE,
  );
}

export function useSchools(cityId?: string, type?: string, withTios?: boolean) {
  const key = cityId ? `schools-${cityId}-${type || ''}-${withTios || ''}` : null;
  return useSWR(key, () => api.getSchools(cityId, type, withTios) as Promise<School[]>, LONG_CACHE);
}

export function useNeighborhoods(cityId?: string) {
  return useSWR(
    cityId ? `neighborhoods-${cityId}` : null,
    () => api.getNeighborhoods(cityId) as Promise<Neighborhood[]>,
    LONG_CACHE,
  );
}

export function usePlans() {
  return useSWR('plans', () => api.getPlans() as Promise<SubscriptionPlan[]>, LONG_CACHE);
}

// ─── Authenticated data (shorter cache) ───

export function useMyProfile() {
  return useSWR(
    'my-profile',
    async () => {
      try {
        return (await api.getMyProfile()) as Profile;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    { ...SHORT_CACHE, shouldRetryOnError: false },
  );
}

export function useMySubscription() {
  return useSWR(
    'my-subscription',
    async () => {
      try {
        return (await api.getMySubscription()) as {
          isPremium: boolean;
          subscription: Subscription | null;
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return { isPremium: false, subscription: null };
        }
        throw err;
      }
    },
    { ...SHORT_CACHE, shouldRetryOnError: false },
  );
}

// ─── Invalidation helpers ───

export function invalidateProfile() {
  return globalMutate('my-profile');
}

export function invalidateSubscription() {
  return globalMutate('my-subscription');
}

export function clearSwrCache() {
  globalMutate(() => true, undefined, { revalidate: false });
}

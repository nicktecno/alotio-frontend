'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useMyProfile, useNeighborhoods, invalidateProfile } from '@/lib/swr';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

export default function BairrosPage() {
  const { data: profile } = useMyProfile();
  const isIntermunicipal = profile?.isIntermunicipal && !!profile?.secondaryCityId;
  const [activeCityId, setActiveCityId] = useState('');
  const { data: primaryNeighborhoods = [] } = useNeighborhoods(profile?.cityId);
  const { data: secondaryNeighborhoods = [] } = useNeighborhoods(
    isIntermunicipal ? profile?.secondaryCityId ?? undefined : undefined,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (profile && !initializedRef.current) {
      initializedRef.current = true;
      setSelectedIds(profile.neighborhoods.map((n) => n.neighborhood.id));
      setActiveCityId(profile.cityId);
    }
  }, [profile]);

  const displayedNeighborhoods = activeCityId === profile?.secondaryCityId
    ? secondaryNeighborhoods
    : primaryNeighborhoods;

  const toggleNeighborhood = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateMyNeighborhoods(selectedIds);
      invalidateProfile();
      toast.success('Bairros atualizados!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <Loading />;

  const primaryCount = selectedIds.filter((id) => primaryNeighborhoods.some((n) => n.id === id)).length;
  const secondaryCount = isIntermunicipal
    ? selectedIds.filter((id) => secondaryNeighborhoods.some((n) => n.id === id)).length
    : 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Meus Bairros</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500 mb-4">
          Selecione os bairros que você atende.
        </p>

        {isIntermunicipal && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveCityId(profile.cityId)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                activeCityId === profile.cityId
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {profile.city.name}
              {primaryCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{primaryCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveCityId(profile.secondaryCityId!)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                activeCityId === profile.secondaryCityId
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {profile.secondaryCity?.name}
              {secondaryCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{secondaryCount}</span>
              )}
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {displayedNeighborhoods.map((nb) => (
            <label
              key={nb.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                selectedIds.includes(nb.id)
                  ? 'bg-secondary/10 border border-secondary/30'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(nb.id)}
                onChange={() => toggleNeighborhood(nb.id)}
                className="accent-secondary"
              />
              <span className="text-gray-900 text-sm">{nb.name}</span>
            </label>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {selectedIds.length} bairro(s) selecionado(s)
          {isIntermunicipal && ` (${primaryCount} em ${profile.city.name}, ${secondaryCount} em ${profile.secondaryCity?.name})`}
        </p>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
        >
          {loading ? 'Salvando...' : 'Salvar Bairros'}
        </button>
      </div>
    </div>
  );
}

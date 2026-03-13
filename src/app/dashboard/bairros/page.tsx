'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import type { Profile, Neighborhood } from '@/types';

export default function BairrosPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cityNeighborhoods, setCityNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMyProfile().then((data) => {
      const p = data as Profile;
      setProfile(p);
      setSelectedIds(p.neighborhoods.map((n) => n.neighborhood.id));
      api.getNeighborhoods(p.cityId).then((nb) => setCityNeighborhoods(nb as Neighborhood[]));
    });
  }, []);

  const toggleNeighborhood = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateMyNeighborhoods(selectedIds);
      toast.success('Bairros atualizados!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Meus Bairros</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500 mb-4">
          Selecione os bairros que você atende em {profile.city.name}.
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {cityNeighborhoods.map((nb) => (
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

'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useMyProfile, useSchools, invalidateProfile } from '@/lib/swr';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

export default function EscolasPage() {
  const { data: profile } = useMyProfile();
  const { data: citySchools = [] } = useSchools(profile?.cityId);
  const [extraSchoolIds, setExtraSchoolIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (profile && !initializedRef.current) {
      initializedRef.current = true;
      setExtraSchoolIds(profile.schools.map((s) => s.school.id));
    }
  }, [profile]);

  const isPremium = profile?.subscriptions && profile.subscriptions.length > 0;

  const toggleSchool = (schoolId: string) => {
    setExtraSchoolIds((prev) =>
      prev.includes(schoolId) ? prev.filter((id) => id !== schoolId) : [...prev, schoolId],
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateMySchools(extraSchoolIds);
      invalidateProfile();
      toast.success('Escolas extras atualizadas!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <Loading />;

  const baseSchoolIds = [profile.defaultSchoolId, profile.secondarySchoolId].filter(Boolean);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Minhas Escolas</h1>

      {/* Base schools */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Escolas Base (gratuitas)</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Principal</span>
            <span className="text-gray-900 font-medium">{profile.defaultSchool.name}</span>
          </div>
          {profile.secondarySchool && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="bg-blue-400 text-white text-xs px-2 py-0.5 rounded-full">Secundária</span>
              <span className="text-gray-900 font-medium">{profile.secondarySchool.name}</span>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Para alterar as escolas base, edite seu perfil.
          </p>
        </div>
      </div>

      {/* Extra schools (premium) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Escolas Extras</h2>
          {isPremium ? (
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full">
              Premium - até 10
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-full">
              Requer Premium
            </span>
          )}
        </div>

        {!isPremium ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">
              Assine o plano premium para adicionar até 10 escolas extras.
            </p>
            <a
              href="/dashboard/assinatura"
              className="inline-block bg-secondary hover:bg-secondary-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Ver planos
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {citySchools
                .filter((s) => !baseSchoolIds.includes(s.id))
                .map((school) => (
                  <label
                    key={school.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      extraSchoolIds.includes(school.id)
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={extraSchoolIds.includes(school.id)}
                      onChange={() => toggleSchool(school.id)}
                      className="accent-primary"
                    />
                    <span className="text-gray-900 text-sm">{school.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{school.type}</span>
                  </label>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {extraSchoolIds.length}/10 escolas extras selecionadas
            </p>
            <button
              onClick={handleSave}
              disabled={loading || extraSchoolIds.length > 10}
              className="mt-4 w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? 'Salvando...' : 'Salvar Escolas Extras'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

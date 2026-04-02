'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, assetUrl, ApiError } from '@/lib/api';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import ImageLightbox from '@/components/ImageLightbox';
import type { Profile, State, City, School, Neighborhood } from '@/types';

export default function AdminProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cityNeighborhoods, setCityNeighborhoods] = useState<Neighborhood[]>([]);

  const [editingAssociations, setEditingAssociations] = useState(false);
  const [selectedNeighborhoodIds, setSelectedNeighborhoodIds] = useState<string[]>([]);
  const [selectedExtraSchoolIds, setSelectedExtraSchoolIds] = useState<string[]>([]);
  const [assocDefaultSchoolId, setAssocDefaultSchoolId] = useState('');
  const [assocSecondarySchoolId, setAssocSecondarySchoolId] = useState('');
  const [savingAssociations, setSavingAssociations] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [prefixo, setPrefixo] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isIntermunicipal, setIsIntermunicipal] = useState(false);
  const [selectedSecondaryCity, setSelectedSecondaryCity] = useState('');
  const [defaultSchoolCityId, setDefaultSchoolCityId] = useState('');
  const [secondarySchoolCityId, setSecondarySchoolCityId] = useState('');
  const [schoolsDefault, setSchoolsDefault] = useState<School[]>([]);
  const [schoolsSecondary, setSchoolsSecondary] = useState<School[]>([]);
  const [loadingSchoolsDefault, setLoadingSchoolsDefault] = useState(false);
  const [loadingSchoolsSecondary, setLoadingSchoolsSecondary] = useState(false);
  const [defaultSchoolId, setDefaultSchoolId] = useState('');
  const [secondarySchoolId, setSecondarySchoolId] = useState('');
  const [status, setStatus] = useState('');

  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');

  const [showCourtesyModal, setShowCourtesyModal] = useState(false);
  const [courtesyMonths, setCourtesyMonths] = useState(1);

  const [actionLoading, setActionLoading] = useState(false);
  const [neighborhoodsReminderLoading, setNeighborhoodsReminderLoading] = useState(false);

  const showCityPicker = isIntermunicipal && !!selectedSecondaryCity;
  const effectiveDefaultCityId = showCityPicker ? defaultSchoolCityId || selectedCity : selectedCity;
  const effectiveSecondaryCityId = showCityPicker ? secondarySchoolCityId || selectedCity : selectedCity;

  const needSchoolLists = editing || editingAssociations;

  const schoolsUnion = useMemo(() => {
    const m = new Map<string, School>();
    for (const s of schoolsDefault) m.set(s.id, s);
    for (const s of schoolsSecondary) m.set(s.id, s);
    return Array.from(m.values());
  }, [schoolsDefault, schoolsSecondary]);

  useEffect(() => {
    if (!needSchoolLists || !effectiveDefaultCityId) {
      if (needSchoolLists) setSchoolsDefault([]);
      return;
    }
    let cancelled = false;
    setLoadingSchoolsDefault(true);
    api.getSchools(effectiveDefaultCityId).then((d) => {
      if (!cancelled) {
        setSchoolsDefault(d as School[]);
        setLoadingSchoolsDefault(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [needSchoolLists, effectiveDefaultCityId]);

  useEffect(() => {
    if (!needSchoolLists || !effectiveSecondaryCityId) {
      if (needSchoolLists) setSchoolsSecondary([]);
      return;
    }
    let cancelled = false;
    setLoadingSchoolsSecondary(true);
    api.getSchools(effectiveSecondaryCityId).then((d) => {
      if (!cancelled) {
        setSchoolsSecondary(d as School[]);
        setLoadingSchoolsSecondary(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [needSchoolLists, effectiveSecondaryCityId]);

  useEffect(() => {
    if (!id) return;
    api.adminGetProfile(id).then((data) => {
      const p = data as Profile;
      setProfile(p);
      populateForm(p);
      setLoading(false);
    });
    api.getStates().then((data) => setStates(data as State[]));
  }, [id]);

  const populateForm = (p: Profile) => {
    setDisplayName(p.displayName);
    setPrefixo(p.prefixo);
    setPhone(p.phone || '');
    setBio(p.bio || '');
    setStatus(p.status);
    setIsIntermunicipal(p.isIntermunicipal || false);
    setSelectedSecondaryCity(p.secondaryCityId || '');
    const defSchCity = p.defaultSchool?.cityId || p.cityId;
    const secSchCity = p.secondarySchool?.cityId || p.cityId;
    setDefaultSchoolCityId(defSchCity);
    setSecondarySchoolCityId(p.secondarySchool ? secSchCity : p.cityId);
    setDefaultSchoolId(p.defaultSchoolId);
    setSecondarySchoolId(p.secondarySchoolId || '');
    if (p.city?.state) {
      setSelectedState(p.city.state.id);
      api.getCities(p.city.state.id).then((data) => setCities(data as City[]));
    }
    setSelectedCity(p.cityId);
    api.getNeighborhoods(p.cityId).then((data) => setCityNeighborhoods(data as Neighborhood[]));
    setSelectedNeighborhoodIds(p.neighborhoods.map((n) => n.neighborhood.id));
    setSelectedExtraSchoolIds(p.schools.map((s) => s.school.id));
    setAssocDefaultSchoolId(p.defaultSchoolId);
    setAssocSecondarySchoolId(p.secondarySchoolId || '');
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setIsIntermunicipal(false);
    setSelectedSecondaryCity('');
    setDefaultSchoolCityId('');
    setSecondarySchoolCityId('');
    setDefaultSchoolId('');
    setSecondarySchoolId('');
    setCities([]);
    if (stateId) {
      api.getCities(stateId).then((data) => setCities(data as City[]));
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setDefaultSchoolId('');
    setSecondarySchoolId('');
    setDefaultSchoolCityId(cityId);
    setSecondarySchoolCityId(cityId);
    if (selectedSecondaryCity === cityId) {
      setSelectedSecondaryCity('');
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (isIntermunicipal) {
      if (!selectedSecondaryCity || selectedSecondaryCity === selectedCity) {
        toast.error('Selecione uma cidade secundária diferente da cidade principal.');
        return;
      }
    }
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        displayName,
        prefixo,
        phone: phone || null,
        bio: bio || null,
        cityId: selectedCity,
        isIntermunicipal,
        secondaryCityId: isIntermunicipal ? selectedSecondaryCity : null,
        defaultSchoolId,
        secondarySchoolId: secondarySchoolId || null,
        status,
      };
      await api.adminUpdateProfile(profile.id, data);
      toast.success('Perfil atualizado!');
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
      setEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Erro ao salvar');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    if (!confirm('Tem certeza que deseja deletar este perfil? Essa ação é irreversível.')) return;
    setActionLoading(true);
    try {
      await api.adminDeleteProfile(profile.id);
      toast.success('Perfil deletado');
      router.push('/admin/perfis');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      await api.adminApproveProfile(profile.id);
      toast.success('Perfil aprovado!');
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!profile) return;
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.adminRejectProfile(profile.id, reason);
      toast.success('Perfil rejeitado');
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantCourtesy = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      await api.adminGrantCourtesy(profile.id, courtesyMonths);
      toast.success(`Cortesia de ${courtesyMonths} mês(es) concedida!`);
      setShowCourtesyModal(false);
      setCourtesyMonths(1);
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeCourtesy = async () => {
    if (!profile) return;
    if (!confirm('Remover a cortesia premium deste perfil?')) return;
    setActionLoading(true);
    try {
      await api.adminRevokeCourtesy(profile.id);
      toast.success('Cortesia removida');
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!profile || !pauseReason.trim()) return;
    setActionLoading(true);
    try {
      await api.adminPauseProfile(profile.id, pauseReason.trim());
      toast.success('Perfil pausado');
      setShowPauseModal(false);
      setPauseReason('');
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      await api.adminReactivateProfile(profile.id);
      toast.success('Perfil reativado!');
      const updated = (await api.adminGetProfile(profile.id)) as Profile;
      setProfile(updated);
      populateForm(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!profile) return <p className="text-gray-500">Perfil não encontrado.</p>;

  const statusColors: Record<string, string> = {
    PENDING: 'bg-primary-100 text-primary-700',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAUSED: 'bg-amber-100 text-amber-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    PAUSED: 'Pausado',
  };

  const activeSubscription = profile.subscriptions?.find((s) => s.status === 'ACTIVE');
  const isPremium = !!activeSubscription;
  const isCourtesy = activeSubscription?.isCourtesy ?? false;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/perfis" className="text-primary hover:underline text-sm">
            &larr; Voltar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{profile.displayName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[profile.status]}`}>
            {statusLabels[profile.status] || profile.status}
          </span>
          {isPremium && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isCourtesy ? 'bg-amber-50 text-amber-700' : 'bg-primary-50 text-primary'}`}>
              {isCourtesy ? `Cortesia (até ${new Date(activeSubscription!.currentPeriodEnd).toLocaleDateString('pt-BR')})` : 'Premium'}
            </span>
          )}
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap gap-2">
        {profile.status === 'PENDING' && (
          <>
            <button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {actionLoading ? 'Aprovando...' : 'Aprovar'}
            </button>
            <button onClick={handleReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Rejeitar
            </button>
          </>
        )}
        {profile.status === 'APPROVED' && (
          <button onClick={() => setShowPauseModal(true)} disabled={actionLoading} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Pausar perfil
          </button>
        )}
        {profile.status === 'PAUSED' && (
          <button onClick={handleReactivate} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {actionLoading ? 'Reativando...' : 'Reativar perfil'}
          </button>
        )}
        {!editing ? (
          <button onClick={() => setEditing(true)} disabled={actionLoading} className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Editar dados
          </button>
        ) : (
          <>
            <button onClick={handleSave} disabled={saving || actionLoading} className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => { setEditing(false); populateForm(profile); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              Cancelar
            </button>
          </>
        )}
        {!isCourtesy && !isPremium && (
          <button onClick={() => setShowCourtesyModal(true)} disabled={actionLoading} className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Conceder cortesia
          </button>
        )}
        {isCourtesy && (
          <button onClick={handleRevokeCourtesy} disabled={actionLoading} className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {actionLoading ? 'Removendo...' : 'Remover cortesia'}
          </button>
        )}
        <button onClick={handleDelete} disabled={actionLoading} className="ml-auto bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {actionLoading ? 'Deletando...' : 'Deletar perfil'}
        </button>
      </div>

      {/* Profile info / Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b pb-2">Informações do Perfil</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome de exibição</label>
            {editing ? (
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            ) : (
              <p className="text-gray-900">{profile.displayName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Prefixo</label>
            {editing ? (
              <input value={prefixo} onChange={(e) => setPrefixo(e.target.value)} maxLength={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            ) : (
              <p className="text-gray-900">{profile.prefixo}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
            {editing ? (
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            ) : (
              <p className="text-gray-900">{profile.phone || '—'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            {editing ? (
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                <option value="PENDING">Pendente</option>
                <option value="APPROVED">Aprovado</option>
                <option value="REJECTED">Rejeitado</option>
                <option value="PAUSED">Pausado</option>
              </select>
            ) : (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[profile.status]}`}>
                {statusLabels[profile.status] || profile.status}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
          {editing ? (
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{profile.bio || '—'}</p>
          )}
        </div>

        <h2 className="font-semibold text-gray-900 border-b pb-2 pt-2">Localização</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
            {editing ? (
              <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                <option value="">Selecione</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.uf})</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile.city?.state?.name} ({profile.city?.state?.uf})</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cidade principal</label>
            {editing ? (
              <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)} disabled={!selectedState} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50">
                <option value="">Selecione</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile.city?.name}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isIntermunicipal}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsIntermunicipal(checked);
                  if (!checked) {
                    setSelectedSecondaryCity('');
                    setDefaultSchoolCityId(selectedCity);
                    setSecondarySchoolCityId(selectedCity);
                  } else {
                    setDefaultSchoolCityId((prev) => prev || selectedCity);
                    setSecondarySchoolCityId((prev) => prev || selectedCity);
                  }
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Motorista intermunicipal (duas cidades no mesmo estado)</span>
            </label>
            {isIntermunicipal && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Cidade secundária</label>
                <select
                  value={selectedSecondaryCity}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedSecondaryCity(v);
                    if (v && defaultSchoolCityId && v === defaultSchoolCityId) setDefaultSchoolCityId(selectedCity);
                    if (v && secondarySchoolCityId && v === secondarySchoolCityId) setSecondarySchoolCityId(selectedCity);
                  }}
                  disabled={!selectedState}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value="">Selecione a segunda cidade</option>
                  {cities.filter((c) => c.id !== selectedCity).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {!editing && profile.isIntermunicipal && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-1 border border-amber-200">
              Intermunicipal
            </span>
            {profile.secondaryCity && (
              <span className="text-sm text-gray-700">
                Também atende: <strong>{profile.secondaryCity.name}</strong>
                {profile.secondaryCity.state?.uf ? `/${profile.secondaryCity.state.uf}` : ''}
              </span>
            )}
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Escola principal</label>
            {editing && showCityPicker && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => { setDefaultSchoolCityId(selectedCity); setDefaultSchoolId(''); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveDefaultCityId === selectedCity
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === selectedCity)?.name || 'Principal'}
                </button>
                <button
                  type="button"
                  onClick={() => { setDefaultSchoolCityId(selectedSecondaryCity); setDefaultSchoolId(''); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveDefaultCityId === selectedSecondaryCity
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === selectedSecondaryCity)?.name || 'Secundária'}
                </button>
              </div>
            )}
            {editing ? (
              <select
                value={defaultSchoolId}
                onChange={(e) => setDefaultSchoolId(e.target.value)}
                disabled={!effectiveDefaultCityId || loadingSchoolsDefault}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingSchoolsDefault ? 'Carregando...' : 'Selecione'}</option>
                {schoolsDefault.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile.defaultSchool?.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Escola secundária <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            {editing && showCityPicker && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => { setSecondarySchoolCityId(selectedCity); setSecondarySchoolId(''); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveSecondaryCityId === selectedCity
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === selectedCity)?.name || 'Principal'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSecondarySchoolCityId(selectedSecondaryCity); setSecondarySchoolId(''); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveSecondaryCityId === selectedSecondaryCity
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === selectedSecondaryCity)?.name || 'Secundária'}
                </button>
              </div>
            )}
            {editing ? (
              <select
                value={secondarySchoolId}
                onChange={(e) => setSecondarySchoolId(e.target.value)}
                disabled={!effectiveSecondaryCityId || loadingSchoolsSecondary}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingSchoolsSecondary ? 'Carregando...' : 'Nenhuma'}</option>
                {schoolsSecondary.filter((s) => s.id !== defaultSchoolId).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">{profile.secondarySchool?.name || '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document */}
      {profile.documents?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Documento comprobatório</h2>
          <div className="flex flex-wrap gap-3">
            {profile.documents.map((doc) => (
              <a
                key={doc.id}
                href={assetUrl(doc.fileUrl) || doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {doc.fileName || 'Ver documento'}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Avatar & Vehicle Photos */}
      {(profile.avatarUrl || profile.vehiclePhotos.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Fotos</h2>

          {profile.avatarUrl && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Avatar</p>
              <div className="flex items-end gap-3">
                <img
                  src={assetUrl(profile.avatarUrl)!}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                  onClick={() => setLightbox({ images: [assetUrl(profile.avatarUrl)!], index: 0 })}
                />
                <button
                  onClick={async () => {
                    if (!confirm('Remover avatar deste perfil?')) return;
                    try {
                      await api.adminDeleteAvatar(profile.id);
                      toast.success('Avatar removido');
                      const updated = (await api.adminGetProfile(profile.id)) as Profile;
                      setProfile(updated);
                      populateForm(updated);
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : 'Erro');
                    }
                  }}
                  className="text-red-500 hover:text-red-600 text-xs font-medium"
                >
                  Remover avatar
                </button>
              </div>
            </div>
          )}

          {profile.vehiclePhotos.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Fotos do veículo</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.vehiclePhotos.map((photo, idx) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={assetUrl(photo.url)!}
                      alt="Veículo"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() =>
                        setLightbox({
                          images: profile.vehiclePhotos.map((p) => assetUrl(p.url)!),
                          index: idx,
                        })
                      }
                    />
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm('Remover esta foto?')) return;
                        try {
                          await api.adminDeleteVehiclePhoto(profile.id, photo.id);
                          toast.success('Foto removida');
                          const updated = (await api.adminGetProfile(profile.id)) as Profile;
                          setProfile(updated);
                          populateForm(updated);
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : 'Erro');
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schools & Neighborhoods */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Escolas e bairros associados</h2>
          {!editingAssociations ? (
            <button
              onClick={() => setEditingAssociations(true)}
              className="text-primary hover:text-primary-600 text-sm font-medium cursor-pointer"
            >
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setSavingAssociations(true);
                  try {
                    await api.adminUpdateProfile(profile.id, {
                      defaultSchoolId: assocDefaultSchoolId,
                      secondarySchoolId: assocSecondarySchoolId || null,
                      neighborhoodIds: selectedNeighborhoodIds,
                      extraSchoolIds: selectedExtraSchoolIds.filter(
                        (id) => id !== assocDefaultSchoolId && id !== assocSecondarySchoolId
                      ),
                    });
                    toast.success('Associações atualizadas!');
                    const updated = (await api.adminGetProfile(profile.id)) as Profile;
                    setProfile(updated);
                    populateForm(updated);
                    setEditingAssociations(false);
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'Erro');
                  } finally {
                    setSavingAssociations(false);
                  }
                }}
                disabled={savingAssociations}
                className="bg-secondary hover:bg-secondary-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAssociations ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setEditingAssociations(false);
                  setSelectedNeighborhoodIds(profile.neighborhoods.map((n) => n.neighborhood.id));
                  setSelectedExtraSchoolIds(profile.schools.map((s) => s.school.id));
                  setAssocDefaultSchoolId(profile.defaultSchoolId);
                  setAssocSecondarySchoolId(profile.secondarySchoolId || '');
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Base schools */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Escolas base</p>
          {editingAssociations ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Principal</label>
                <select
                  value={assocDefaultSchoolId}
                  onChange={(e) => setAssocDefaultSchoolId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Selecione</option>
                  {schoolsUnion
                    .filter((s) => s.id !== assocSecondarySchoolId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Secundária (opcional)</label>
                <select
                  value={assocSecondarySchoolId}
                  onChange={(e) => setAssocSecondarySchoolId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Nenhuma</option>
                  {schoolsUnion
                    .filter((s) => s.id !== assocDefaultSchoolId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                {profile.defaultSchool?.name} (principal)
              </span>
              {profile.secondarySchool && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {profile.secondarySchool.name} (secundária)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Extra schools */}
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Escolas extras ({editingAssociations ? selectedExtraSchoolIds.length : profile.schools.length})
          </p>
          {editingAssociations ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {schoolsUnion
                .filter((s) => s.id !== assocDefaultSchoolId && s.id !== assocSecondarySchoolId)
                .map((school) => (
                  <label key={school.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition ${
                    selectedExtraSchoolIds.includes(school.id) ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedExtraSchoolIds.includes(school.id)}
                      onChange={() => setSelectedExtraSchoolIds((prev) =>
                        prev.includes(school.id) ? prev.filter((x) => x !== school.id) : [...prev, school.id]
                      )}
                      className="accent-primary"
                    />
                    <span className="text-gray-900">{school.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{school.type}</span>
                  </label>
                ))}
            </div>
          ) : profile.schools.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.schools.map((ts) => (
                <span key={ts.school.id} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {ts.school.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Nenhuma escola extra</p>
          )}
        </div>

        {/* Neighborhoods */}
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Bairros ({editingAssociations ? selectedNeighborhoodIds.length : profile.neighborhoods.length})
          </p>
          {editingAssociations ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {cityNeighborhoods.map((nb) => (
                <label key={nb.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition ${
                  selectedNeighborhoodIds.includes(nb.id) ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedNeighborhoodIds.includes(nb.id)}
                    onChange={() => setSelectedNeighborhoodIds((prev) =>
                      prev.includes(nb.id) ? prev.filter((x) => x !== nb.id) : [...prev, nb.id]
                    )}
                    className="accent-secondary"
                  />
                  <span className="text-gray-900">{nb.name}</span>
                </label>
              ))}
            </div>
          ) : profile.neighborhoods.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.neighborhoods.map((tn) => (
                <span key={tn.neighborhood.id} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {tn.neighborhood.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Nenhum bairro</p>
          )}
          {profile.neighborhoods.length === 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={async () => {
                  if (!profile?.id) return;
                  setNeighborhoodsReminderLoading(true);
                  try {
                    await api.adminSendNeighborhoodsReminder(profile.id);
                    toast.success('E-mail de lembrete sobre bairros enviado.');
                  } catch (err) {
                    const msg = err instanceof ApiError ? err.message : 'Falha ao enviar e-mail.';
                    toast.error(msg);
                  } finally {
                    setNeighborhoodsReminderLoading(false);
                  }
                }}
                disabled={neighborhoodsReminderLoading}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {neighborhoodsReminderLoading ? 'Enviando…' : 'Enviar lembrete por e-mail (cadastrar bairros)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Pausar perfil</h3>
            <p className="text-sm text-gray-600">
              Informe o motivo da pausa. O transportador receberá um email com esta mensagem para saber o que precisa fazer.
            </p>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Descreva o motivo da pausa..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowPauseModal(false); setPauseReason(''); }}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handlePause}
                disabled={!pauseReason.trim() || actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Pausando...' : 'Confirmar pausa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCourtesyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Conceder cortesia Premium</h3>
            <p className="text-sm text-gray-600">
              O transportador terá acesso premium gratuito pelo período selecionado, sem passar pelo Stripe.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (meses)</label>
              <select
                value={courtesyMonths}
                onChange={(e) => setCourtesyMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              >
                {[1, 2, 3, 6, 12].map((m) => (
                  <option key={m} value={m}>{m} {m === 1 ? 'mês' : 'meses'}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowCourtesyModal(false); setCourtesyMonths(1); }}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleGrantCourtesy}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Concedendo...' : 'Conceder cortesia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

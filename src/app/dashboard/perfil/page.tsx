'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api, assetUrl } from '@/lib/api';
import { useMyProfile, useStates, useCities, useSchools, useNeighborhoods, invalidateProfile } from '@/lib/swr';
import { compressImage } from '@/lib/compressImage';
import Loading from '@/components/Loading';
import FileOrCameraInput from '@/components/FileOrCameraInput';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { data: profile, error: profileError, isLoading: profileLoading, mutate: mutateProfile } = useMyProfile();
  const hasProfile = !profileLoading && !profileError && !!profile;
  const noProfile = !profileLoading && (!!profileError || profile === null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    prefixo: '',
    phone: '',
    bio: '',
    hasTV: false,
    hasAC: false,
    hasMonitor: false,
    isIntermunicipal: false,
    stateId: '',
    cityId: '',
    secondaryCityId: '',
    defaultSchoolId: '',
    secondarySchoolId: '',
  });
  const [defaultSchoolCityId, setDefaultSchoolCityId] = useState('');
  const [secondarySchoolCityId, setSecondarySchoolCityId] = useState('');
  const [selectedNeighborhoodIds, setSelectedNeighborhoodIds] = useState<string[]>([]);
  const [activeCityIdBairros, setActiveCityIdBairros] = useState('');
  const [savingNeighborhoods, setSavingNeighborhoods] = useState(false);
  const [document, setDocument] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const initializedRef = useRef(false);

  const { data: states = [] } = useStates();
  const { data: cities = [], isLoading: loadingCities } = useCities(form.stateId || undefined);
  const showCityPicker = form.isIntermunicipal && !!form.secondaryCityId;
  const effectiveDefaultCityId = showCityPicker ? (defaultSchoolCityId || form.cityId) : form.cityId;
  const effectiveSecondaryCityId = showCityPicker ? (secondarySchoolCityId || form.cityId) : form.cityId;
  const { data: defaultSchools = [], isLoading: loadingDefaultSchools } = useSchools(effectiveDefaultCityId || undefined);
  const { data: secondarySchools = [], isLoading: loadingSecondarySchools } = useSchools(effectiveSecondaryCityId || undefined);
  const cityIdForNeighborhoods = profile?.cityId ?? form.cityId;
  const secondaryCityIdForNeighborhoods = profile?.secondaryCityId ?? (form.isIntermunicipal && form.secondaryCityId ? form.secondaryCityId : undefined);
  const { data: primaryNeighborhoods = [] } = useNeighborhoods(cityIdForNeighborhoods || undefined);
  const { data: secondaryNeighborhoods = [] } = useNeighborhoods(secondaryCityIdForNeighborhoods || undefined);

  useEffect(() => {
    if (profile && !initializedRef.current) {
      initializedRef.current = true;
      setForm({
        displayName: profile.displayName,
        prefixo: profile.prefixo,
        phone: profile.phone || '',
        bio: profile.bio || '',
        hasTV: profile.hasTV || false,
        hasAC: profile.hasAC || false,
        hasMonitor: profile.hasMonitor || false,
        isIntermunicipal: profile.isIntermunicipal || false,
        stateId: profile.city.state?.id || '',
        cityId: profile.cityId,
        secondaryCityId: profile.secondaryCityId || '',
        defaultSchoolId: profile.defaultSchoolId,
        secondarySchoolId: profile.secondarySchoolId || '',
      });
      if (profile.defaultSchool) {
        setDefaultSchoolCityId(profile.defaultSchool.cityId);
      }
      if (profile.secondarySchool) {
        setSecondarySchoolCityId(profile.secondarySchool.cityId);
      }
      setSelectedNeighborhoodIds(profile.neighborhoods.map((n) => n.neighborhood.id));
      setActiveCityIdBairros(profile.cityId);
    }
  }, [profile]);

  const isPremium = profile?.subscriptions && profile.subscriptions.length > 0;

  const handleSaveNeighborhoods = async () => {
    setSavingNeighborhoods(true);
    try {
      await api.updateMyNeighborhoods(selectedNeighborhoodIds);
      invalidateProfile();
      toast.success('Bairros atualizados!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSavingNeighborhoods(false);
    }
  };

  const handleResubmitDocument = async () => {
    if (!newDocument) {
      toast.error('Selecione um arquivo');
      return;
    }
    setUploadingDoc(true);
    try {
      const compressed = await compressImage(newDocument);
      const fd = new FormData();
      fd.append('document', compressed);
      await api.updateDocument(fd);
      mutateProfile();
      setNewDocument(null);
      toast.success('Documento reenviado! Aguarde nova análise do administrador.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar documento');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) {
      toast.error('Envie o documento comprobatório');
      return;
    }
    setLoading(true);
    try {
      const compressedDoc = await compressImage(document);
      const fd = new FormData();
      fd.append('displayName', form.displayName);
      fd.append('prefixo', form.prefixo);
      fd.append('phone', form.phone);
      fd.append('bio', form.bio);
      fd.append('cityId', form.cityId);
      if (form.isIntermunicipal) {
        fd.append('isIntermunicipal', 'true');
        if (form.secondaryCityId) fd.append('secondaryCityId', form.secondaryCityId);
      }
      fd.append('defaultSchoolId', form.defaultSchoolId);
      if (form.secondarySchoolId) fd.append('secondarySchoolId', form.secondarySchoolId);
      if (selectedNeighborhoodIds.length > 0) fd.append('neighborhoodIds', JSON.stringify(selectedNeighborhoodIds));
      fd.append('document', compressedDoc);

      await api.createProfile(fd);
      invalidateProfile();
      toast.success('Perfil criado! Aguarde aprovação do administrador.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data: Record<string, unknown> = {};
    if (form.displayName !== profile!.displayName) data.displayName = form.displayName;
    if (form.phone !== (profile!.phone || '')) data.phone = form.phone;
    if (form.bio !== (profile!.bio || '')) data.bio = form.bio;
    if (form.hasTV !== profile!.hasTV) data.hasTV = form.hasTV;
    if (form.hasAC !== profile!.hasAC) data.hasAC = form.hasAC;
    if (form.hasMonitor !== profile!.hasMonitor) data.hasMonitor = form.hasMonitor;
    if (form.isIntermunicipal !== profile!.isIntermunicipal) data.isIntermunicipal = form.isIntermunicipal;
    if (form.isIntermunicipal) {
      data.secondaryCityId = form.secondaryCityId || null;
    } else if (profile!.isIntermunicipal) {
      data.secondaryCityId = null;
    }
    if (form.cityId !== profile!.cityId) data.cityId = form.cityId;
    if (form.defaultSchoolId !== profile!.defaultSchoolId) data.defaultSchoolId = form.defaultSchoolId;
    data.secondarySchoolId = form.secondarySchoolId || null;

    try {
      await api.updateMyProfile(data);
      invalidateProfile();
      toast.success('Perfil atualizado!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        {hasProfile ? 'Editar Perfil' : 'Criar Perfil'}
      </h1>

      <form
        onSubmit={hasProfile ? handleUpdate : handleCreate}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome de exibição</label>
            <p className="text-xs text-gray-600 mb-1.5 min-h-[2.5rem]">
              Esse nome aparecerá no card de busca. Não é necessário incluir &quot;transporte escolar&quot; no nome.
            </p>
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefixo (4 dígitos)</label>
            <p className="text-xs text-gray-600 mb-1.5 min-h-[2.5rem]">
              Número de identificação do transporte escolar exibido na van (ex.: placa ou adesivo).
            </p>
            <input
              name="prefixo"
              value={form.prefixo}
              onChange={handleChange}
              required
              maxLength={4}
              pattern="\d{4}"
              disabled={hasProfile === true}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
            />
            {hasProfile && (
              <p className="text-xs text-gray-400 mt-1">O prefixo não pode ser alterado após o cadastro.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {isPremium ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Fale sobre você, sua experiência e seu serviço..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
            />
          </div>
        ) : (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-700">
              <strong>Descrição</strong> — disponível no{' '}
              <Link href="/dashboard/assinatura" className="underline font-semibold hover:text-primary-900">Plano Premium</Link>.
              Conte sua história e destaque-se para os pais.
            </p>
          </div>
        )}

        {isPremium ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comodidades do veículo</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasTV}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasTV: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">📺 TV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasAC}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasAC: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">❄️ Ar-condicionado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasMonitor}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasMonitor: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">👀 Monitor de crianças</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-700">
              <strong>Comodidades do veículo</strong> (TV, Ar-condicionado, Monitor) — disponíveis no{' '}
              <Link href="/dashboard/assinatura" className="underline font-semibold hover:text-primary-900">Plano Premium</Link>.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="stateId"
              value={form.stateId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Selecione</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <div className="relative">
              <select
                name="cityId"
                value={form.cityId}
                onChange={handleChange}
                required
                disabled={!form.stateId || loadingCities}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingCities ? 'Carregando cidades...' : 'Selecione'}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {loadingCities && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isIntermunicipal}
              onChange={(e) => {
                const checked = e.target.checked;
                setForm((prev) => ({
                  ...prev,
                  isIntermunicipal: checked,
                  secondaryCityId: checked ? prev.secondaryCityId : '',
                }));
                if (!checked) {
                  setDefaultSchoolCityId(form.cityId);
                  setSecondarySchoolCityId(form.cityId);
                }
              }}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Sou motorista intermunicipal</span>
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-7">
            Marque se você atende em mais de uma cidade do mesmo estado.
          </p>
        </div>

        {form.isIntermunicipal && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade secundária</label>
            <div className="relative">
              <select
                value={form.secondaryCityId}
                onChange={(e) => setForm((prev) => ({ ...prev, secondaryCityId: e.target.value }))}
                required={form.isIntermunicipal}
                disabled={!form.stateId || loadingCities}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingCities ? 'Carregando cidades...' : 'Selecione'}</option>
                {cities
                  .filter((c) => c.id !== form.cityId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              {loadingCities && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escola Principal</label>
            {showCityPicker && (
              <div className="flex gap-1.5 mb-1.5">
                <button
                  type="button"
                  onClick={() => { setDefaultSchoolCityId(form.cityId); setForm((prev) => ({ ...prev, defaultSchoolId: '' })); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveDefaultCityId === form.cityId
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === form.cityId)?.name || 'Principal'}
                </button>
                <button
                  type="button"
                  onClick={() => { setDefaultSchoolCityId(form.secondaryCityId); setForm((prev) => ({ ...prev, defaultSchoolId: '' })); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveDefaultCityId === form.secondaryCityId
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === form.secondaryCityId)?.name || 'Secundária'}
                </button>
              </div>
            )}
            <div className="relative">
              <select
                name="defaultSchoolId"
                value={form.defaultSchoolId}
                onChange={handleChange}
                required
                disabled={!effectiveDefaultCityId || loadingDefaultSchools}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingDefaultSchools ? 'Carregando escolas...' : 'Selecione'}</option>
                {defaultSchools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {loadingDefaultSchools && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escola Secundária <span className="text-gray-400">(opcional)</span>
            </label>
            {showCityPicker && (
              <div className="flex gap-1.5 mb-1.5">
                <button
                  type="button"
                  onClick={() => { setSecondarySchoolCityId(form.cityId); setForm((prev) => ({ ...prev, secondarySchoolId: '' })); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveSecondaryCityId === form.cityId
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === form.cityId)?.name || 'Principal'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSecondarySchoolCityId(form.secondaryCityId); setForm((prev) => ({ ...prev, secondarySchoolId: '' })); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    effectiveSecondaryCityId === form.secondaryCityId
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cities.find((c) => c.id === form.secondaryCityId)?.name || 'Secundária'}
                </button>
              </div>
            )}
            <div className="relative">
              <select
                name="secondarySchoolId"
                value={form.secondarySchoolId}
                onChange={handleChange}
                disabled={!effectiveSecondaryCityId || loadingSecondarySchools}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingSecondarySchools ? 'Carregando escolas...' : 'Nenhuma'}</option>
                {secondarySchools
                  .filter((s) => s.id !== form.defaultSchoolId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
              {loadingSecondarySchools && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {noProfile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bairros que você atende</label>
            <p className="text-xs text-gray-500 mb-3">
              Selecione os bairros em que você faz transporte. Assim as famílias encontram você na busca. Você pode alterar depois em Meus Bairros.
            </p>
            {form.cityId ? (
              <>
                {form.isIntermunicipal && form.secondaryCityId ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="text-xs font-medium text-gray-500 py-1.5">Cidade principal:</span>
                      <span className="text-sm text-gray-700">{cities.find((c) => c.id === form.cityId)?.name}</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {primaryNeighborhoods.map((nb) => (
                        <label key={nb.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm hover:bg-gray-50">
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
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs font-medium text-gray-500 py-1.5">Cidade secundária:</span>
                      <span className="text-sm text-gray-700">{cities.find((c) => c.id === form.secondaryCityId)?.name}</span>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {secondaryNeighborhoods.map((nb) => (
                        <label key={nb.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm hover:bg-gray-50">
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
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {primaryNeighborhoods.map((nb) => (
                      <label key={nb.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm hover:bg-gray-50">
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
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Selecione estado e cidade acima para carregar os bairros.</p>
            )}
          </div>
        )}

        {noProfile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento comprobatório
            </label>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Obrigatório para aprovação.</strong> Envie um documento que comprove que você é transportador escolar (ex.: licença, autorização para transporte escolar, registro no órgão competente). Esse passo é necessário para validar seu cadastro e evitar fraudes. Aceito em foto ou PDF. O arquivo é visível apenas para a administração do AloTio.
            </p>
            <div className="space-y-2">
              <FileOrCameraInput
                accept="image/*,.pdf"
                onChange={(e) => setDocument(e.target.files?.[0] || null)}
                onFileCapture={(file) => setDocument(file)}
                uploadLabel="Escolher arquivo"
                cameraLabel="Tirar foto"
                uploadClassName="bg-primary-50 hover:bg-primary-100 text-primary-700"
                cameraClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
              />
              {document && (
                <p className="text-sm text-green-600 font-medium">
                  Selecionado: {document.name}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition cursor-pointer"
        >
          {loading ? 'Salvando...' : hasProfile ? 'Salvar Alterações' : 'Criar Perfil'}
        </button>
      </form>

      {hasProfile && profile && (
        <>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 font-heading">Bairros que você atende</h2>
          <p className="text-sm text-gray-600">
            Os bairros que você seleciona aparecem no seu perfil e nas buscas. Quem procura por transporte na sua região usa essa informação para entrar em contato.
          </p>
          {profile.cityId && (
            <>
              {profile.isIntermunicipal && profile.secondaryCityId && (
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveCityIdBairros(profile.cityId)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      activeCityIdBairros === profile.cityId
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {profile.city.name}
                    {selectedNeighborhoodIds.filter((id) => primaryNeighborhoods.some((n) => n.id === id)).length > 0 && (
                      <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                        {selectedNeighborhoodIds.filter((id) => primaryNeighborhoods.some((n) => n.id === id)).length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCityIdBairros(profile.secondaryCityId!)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      activeCityIdBairros === profile.secondaryCityId
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {profile.secondaryCity?.name}
                    {selectedNeighborhoodIds.filter((id) => secondaryNeighborhoods.some((n) => n.id === id)).length > 0 && (
                      <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                        {selectedNeighborhoodIds.filter((id) => secondaryNeighborhoods.some((n) => n.id === id)).length}
                      </span>
                    )}
                  </button>
                </div>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(activeCityIdBairros === profile.secondaryCityId ? secondaryNeighborhoods : primaryNeighborhoods).map((nb) => (
                  <label
                    key={nb.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      selectedNeighborhoodIds.includes(nb.id)
                        ? 'bg-secondary/10 border border-secondary/30'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNeighborhoodIds.includes(nb.id)}
                      onChange={() => setSelectedNeighborhoodIds((prev) =>
                        prev.includes(nb.id) ? prev.filter((x) => x !== nb.id) : [...prev, nb.id]
                      )}
                      className="accent-secondary"
                    />
                    <span className="text-gray-900 text-sm">{nb.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {selectedNeighborhoodIds.length} bairro(s) selecionado(s)
                {profile.isIntermunicipal && profile.secondaryCity && ` (${selectedNeighborhoodIds.filter((id) => primaryNeighborhoods.some((n) => n.id === id)).length} em ${profile.city.name}, ${selectedNeighborhoodIds.filter((id) => secondaryNeighborhoods.some((n) => n.id === id)).length} em ${profile.secondaryCity.name})`}
              </p>
              <button
                type="button"
                onClick={handleSaveNeighborhoods}
                disabled={savingNeighborhoods}
                className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
              >
                {savingNeighborhoods ? 'Salvando...' : 'Salvar Bairros'}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 font-heading">Documento comprobatório</h2>
          <p className="text-sm text-gray-600">
            Documento obrigatório para aprovação do perfil, que comprova que você atua como transportador escolar (ex.: licença, autorização municipal, registro). Necessário para validar o cadastro e evitar fraudes. Visível apenas para administradores.
          </p>

          {profile.documents?.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {profile.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={assetUrl(doc.fileUrl) || doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition border border-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {doc.fileName || 'Ver documento'}
                </a>
              ))}
            </div>
          )}

          {profile.status === 'REJECTED' && (
            <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium">
                Seu documento foi rejeitado. Envie um novo documento para reavaliação.
              </p>
              <FileOrCameraInput
                accept="image/*,.pdf"
                onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                onFileCapture={(file) => setNewDocument(file)}
                uploadLabel="Escolher arquivo"
                cameraLabel="Tirar foto"
                uploadClassName="bg-red-100 hover:bg-red-200 text-red-700"
                cameraClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
              />
              {newDocument && (
                <p className="text-sm text-green-600 font-medium">
                  Selecionado: {newDocument.name}
                </p>
              )}
              <button
                onClick={handleResubmitDocument}
                disabled={!newDocument || uploadingDoc}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                {uploadingDoc ? 'Enviando...' : 'Reenviar documento'}
              </button>
            </div>
          )}

          {profile.status === 'PENDING' && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-amber-700 font-medium">
                Seu documento está em análise. Caso queira, envie um novo documento atualizado.
              </p>
              <FileOrCameraInput
                accept="image/*,.pdf"
                onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                onFileCapture={(file) => setNewDocument(file)}
                uploadLabel="Escolher arquivo"
                cameraLabel="Tirar foto"
                uploadClassName="bg-amber-100 hover:bg-amber-200 text-amber-700"
                cameraClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
              />
              {newDocument && (
                <p className="text-sm text-green-600 font-medium">
                  Selecionado: {newDocument.name}
                </p>
              )}
              <button
                onClick={handleResubmitDocument}
                disabled={!newDocument || uploadingDoc}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                {uploadingDoc ? 'Enviando...' : 'Enviar novo documento'}
              </button>
            </div>
          )}

          {profile.status === 'APPROVED' && (
            <p className="text-sm text-green-600 font-medium">
              Seu documento foi aprovado.
            </p>
          )}
        </div>
        </>
      )}
    </div>
  );
}

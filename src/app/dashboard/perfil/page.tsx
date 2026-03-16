'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api, assetUrl } from '@/lib/api';
import { useMyProfile, useStates, useCities, useSchools, invalidateProfile } from '@/lib/swr';
import { compressImage } from '@/lib/compressImage';
import Loading from '@/components/Loading';
import FileOrCameraInput from '@/components/FileOrCameraInput';
import toast from 'react-hot-toast';
import type { Profile } from '@/types';

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
    secondaryStateId: '',
    secondaryCityId: '',
    defaultSchoolId: '',
    secondarySchoolId: '',
  });
  const [document, setDocument] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const initializedRef = useRef(false);

  const { data: states = [] } = useStates();
  const { data: cities = [], isLoading: loadingCities } = useCities(form.stateId || undefined);
  const { data: secondaryCities = [], isLoading: loadingSecondaryCities } = useCities(form.secondaryStateId || undefined);
  const { data: schools = [], isLoading: loadingSchools } = useSchools(form.cityId || undefined);

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
        secondaryStateId: profile.secondaryCity?.state?.id || '',
        secondaryCityId: profile.secondaryCityId || '',
        defaultSchoolId: profile.defaultSchoolId,
        secondarySchoolId: profile.secondarySchoolId || '',
      });
    }
  }, [profile]);

  const isPremium = profile?.subscriptions && profile.subscriptions.length > 0;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome de exibição</label>
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefixo (3 dígitos)</label>
            <input
              name="prefixo"
              value={form.prefixo}
              onChange={handleChange}
              required
              maxLength={3}
              pattern="\d{3}"
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
                  secondaryStateId: checked ? prev.secondaryStateId : '',
                  secondaryCityId: checked ? prev.secondaryCityId : '',
                }));
              }}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Sou motorista intermunicipal</span>
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-7">
            Marque se você atende em mais de uma cidade. Você poderá escolher escolas da cidade secundária.
          </p>
        </div>

        {form.isIntermunicipal && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado secundário</label>
              <select
                value={form.secondaryStateId}
                onChange={(e) => setForm((prev) => ({ ...prev, secondaryStateId: e.target.value, secondaryCityId: '' }))}
                required={form.isIntermunicipal}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Selecione</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade secundária</label>
              <div className="relative">
                <select
                  value={form.secondaryCityId}
                  onChange={(e) => setForm((prev) => ({ ...prev, secondaryCityId: e.target.value }))}
                  required={form.isIntermunicipal}
                  disabled={!form.secondaryStateId || loadingSecondaryCities}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
                >
                  <option value="">{loadingSecondaryCities ? 'Carregando cidades...' : 'Selecione'}</option>
                  {secondaryCities
                    .filter((c) => c.id !== form.cityId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {loadingSecondaryCities && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escola Principal</label>
            <div className="relative">
              <select
                name="defaultSchoolId"
                value={form.defaultSchoolId}
                onChange={handleChange}
                required
                disabled={!form.cityId || loadingSchools}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingSchools ? 'Carregando escolas...' : 'Selecione'}</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {loadingSchools && (
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
            <div className="relative">
              <select
                name="secondarySchoolId"
                value={form.secondarySchoolId}
                onChange={handleChange}
                disabled={!form.cityId || loadingSchools}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50"
              >
                <option value="">{loadingSchools ? 'Carregando escolas...' : 'Nenhuma'}</option>
                {schools
                  .filter((s) => s.id !== form.defaultSchoolId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
              {loadingSchools && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {noProfile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento comprobatório
            </label>
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
            <p className="text-xs text-gray-400 mt-1">
              Foto ou PDF comprovando que é tio profissional. Visível apenas para administradores.
            </p>
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
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 font-heading">Documento comprobatório</h2>

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
      )}
    </div>
  );
}

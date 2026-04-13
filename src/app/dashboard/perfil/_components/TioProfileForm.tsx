'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useStates, useCities, useSchools, useNeighborhoods, invalidateProfile } from '@/lib/swr';
import { compressImage } from '@/lib/compressImage';
import FileOrCameraInput from '@/components/FileOrCameraInput';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import type { Profile } from '@/types';
import { SchoolRegistrationModal } from './school-registration-modal';

export type TioProfileFormVariant = 'cadastro' | 'dashboard';

type TioProfileFormProps = {
  variant: TioProfileFormVariant;
  /** Só usado em `variant="dashboard"` */
  profile?: Profile | null;
  /** Ex.: tela cheia de loading no cadastro público */
  onSubmittingChange?: (loading: boolean) => void;
};

export function TioProfileForm({ variant, profile, onSubmittingChange }: TioProfileFormProps) {
  const router = useRouter();
  const { register, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const setLoadingTracked = useCallback(
    (value: boolean) => {
      setLoading(value);
      onSubmittingChange?.(value);
    },
    [onSubmittingChange],
  );

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
  const [document, setDocument] = useState<File | null>(null);
  const [schoolRegOpen, setSchoolRegOpen] = useState(false);

  const initializedRef = useRef(false);

  const hasProfile = variant === 'dashboard' && !!profile;
  const noProfile =
    variant === 'cadastro' || (variant === 'dashboard' && !profile);

  const { data: states = [] } = useStates();
  const { data: cities = [], isLoading: loadingCities } = useCities(form.stateId || undefined);
  const showCityPicker = form.isIntermunicipal && !!form.secondaryCityId;
  const effectiveDefaultCityId = showCityPicker ? (defaultSchoolCityId || form.cityId) : form.cityId;
  const effectiveSecondaryCityId = showCityPicker ? (secondarySchoolCityId || form.cityId) : form.cityId;
  const { data: defaultSchools = [], isLoading: loadingDefaultSchools } = useSchools(effectiveDefaultCityId || undefined);
  const { data: secondarySchools = [], isLoading: loadingSecondarySchools } = useSchools(effectiveSecondaryCityId || undefined);
  const cityIdForNeighborhoods = profile?.cityId ?? form.cityId;
  const secondaryCityIdForNeighborhoods =
    profile?.secondaryCityId ?? (form.isIntermunicipal && form.secondaryCityId ? form.secondaryCityId : undefined);
  const { data: primaryNeighborhoods = [] } = useNeighborhoods(cityIdForNeighborhoods || undefined);
  const { data: secondaryNeighborhoods = [] } = useNeighborhoods(secondaryCityIdForNeighborhoods || undefined);

  useEffect(() => {
    if (variant === 'dashboard' && profile && !initializedRef.current) {
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
    }
  }, [variant, profile]);

  const isPremium =
    variant === 'dashboard' && Boolean(profile?.subscriptions?.length);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildCreateFormData = async (compressedDoc: Blob) => {
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
    if (selectedNeighborhoodIds.length > 0) {
      fd.append('neighborhoodIds', JSON.stringify(selectedNeighborhoodIds));
    }
    fd.append('document', compressedDoc);
    return fd;
  };

  const handleUpdate = async () => {
    if (!profile) return;
    setLoadingTracked(true);
    const data: Record<string, unknown> = {};
    if (form.displayName !== profile.displayName) data.displayName = form.displayName;
    if (form.phone !== (profile.phone || '')) data.phone = form.phone;
    if (form.bio !== (profile.bio || '')) data.bio = form.bio;
    if (form.hasTV !== profile.hasTV) data.hasTV = form.hasTV;
    if (form.hasAC !== profile.hasAC) data.hasAC = form.hasAC;
    if (form.hasMonitor !== profile.hasMonitor) data.hasMonitor = form.hasMonitor;
    if (form.isIntermunicipal !== profile.isIntermunicipal) data.isIntermunicipal = form.isIntermunicipal;
    if (form.isIntermunicipal) {
      data.secondaryCityId = form.secondaryCityId || null;
    } else if (profile.isIntermunicipal) {
      data.secondaryCityId = null;
    }
    if (form.cityId !== profile.cityId) data.cityId = form.cityId;
    if (form.defaultSchoolId !== profile.defaultSchoolId) data.defaultSchoolId = form.defaultSchoolId;
    data.secondarySchoolId = form.secondarySchoolId || null;

    try {
      await api.updateMyProfile(data);
      invalidateProfile();
      toast.success('Perfil atualizado!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setLoadingTracked(false);
    }
  };

  const handleSchoolRegistrationSubmit = async (cityInput: string, schoolInput: string) => {
    let contactEmail: string;
    if (variant === 'cadastro') {
      contactEmail = email.trim();
      if (!contactEmail) {
        toast.error('Preencha seu email na seção "Sua conta" acima.');
        throw new Error('no-email');
      }
    } else {
      const me = await api.me();
      contactEmail = me.email;
    }
    const state = states.find((s) => s.id === form.stateId);
    if (!state?.uf) {
      toast.error('Selecione o estado no formulário acima para identificar a região (UF).');
      throw new Error('no-uf');
    }
    const cityLabel = form.cityId ? cities.find((c) => c.id === form.cityId)?.name : undefined;
    const details = [
      `Conta (login): ${contactEmail}`,
      profile ? `ID do perfil: ${profile.id}` : 'Perfil ainda não criado',
      `Nome no formulário: ${form.displayName}`,
      `Telefone: ${form.phone?.trim() || '—'}`,
      `Estado selecionado: ${state.name} (${state.uf})`,
      `Cidade já escolhida na lista: ${cityLabel ?? '—'}`,
    ].join('\n');
    try {
      await api.sendSchoolRegistrationRequest({
        name: (profile?.displayName?.trim() || form.displayName?.trim() || contactEmail.split('@')[0]).slice(0, 100),
        email: contactEmail,
        uf: state.uf,
        ...(cityInput && { cityName: cityInput }),
        ...(schoolInput && { schoolName: schoolInput }),
        details,
      });
      toast.success('Pedido enviado! A equipe cadastra e avisa quando estiver disponível.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível enviar o pedido.');
      throw e;
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasProfile) {
      await handleUpdate();
      return;
    }
    if (!document) {
      toast.error('Envie o documento comprobatório');
      return;
    }
    setLoadingTracked(true);
    try {
      if (variant === 'cadastro') {
        if (password !== confirmPassword) {
          toast.error('As senhas não coincidem');
          setLoadingTracked(false);
          return;
        }
        await register(email, password);
        await login(email, password);
      }
      const compressedDoc = await compressImage(document);
      const fd = await buildCreateFormData(compressedDoc);
      await api.createProfile(fd);
      invalidateProfile();
      if (variant === 'cadastro') {
        toast.success('Conta e perfil criados! Aguarde aprovação do administrador.');
        router.push('/dashboard');
      } else {
        toast.success('Perfil criado! Aguarde aprovação do administrador.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar perfil';
      toast.error(message);
    } finally {
      setLoadingTracked(false);
    }
  };

  const formShellClass =
    variant === 'cadastro'
      ? 'bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-lg'
      : 'bg-white rounded-xl border border-gray-200 p-6 space-y-5';

  const title =
    variant === 'cadastro'
      ? 'Crie sua conta e seu perfil'
      : hasProfile
        ? 'Editar Perfil'
        : 'Criar Perfil';

  const submitLabel = loading
    ? 'Salvando...'
    : hasProfile
      ? 'Salvar Alterações'
      : variant === 'cadastro'
        ? 'Criar conta e enviar perfil'
        : 'Criar Perfil';

  const accountFields =
    variant === 'cadastro' ? (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Sua conta</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
            placeholder="••••••••"
          />
        </div>
      </div>
    ) : null;

  return (
    <>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">{title}</h1>
      {variant === 'cadastro' && (
        <p className="text-gray-600 text-sm mb-6">
          Preencha os dados de acesso e as informações do transporte em um único passo. Após o envio, aguarde a análise da equipe.
        </p>
      )}

      <form onSubmit={onFormSubmit} className={formShellClass}>
        {accountFields}

        {variant === 'cadastro' && (
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide pt-1 border-t border-gray-100">
            Perfil de transportador
          </h2>
        )}

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
              <Link href="/dashboard/assinatura" className="underline font-semibold hover:text-primary-900">
                Plano Premium
              </Link>
              . Conte sua história e destaque-se para os pais.
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
              <Link href="/dashboard/assinatura" className="underline font-semibold hover:text-primary-900">
                Plano Premium
              </Link>
              .
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
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
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
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
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
          <p className="text-xs text-gray-400 mt-1 ml-7">Marque se você atende em mais de uma cidade do mesmo estado.</p>
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
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
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

        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Não encontrou cidade ou escola na lista?</span> A gente cadastra para você.
          </p>
          <button
            type="button"
            onClick={() => setSchoolRegOpen(true)}
            className="shrink-0 text-sm font-semibold text-primary hover:text-primary-800 underline decoration-2 underline-offset-2 text-left sm:text-right"
          >
            Avise aqui
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escola Principal</label>
            {showCityPicker && (
              <div className="flex gap-1.5 mb-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDefaultSchoolCityId(form.cityId);
                    setForm((prev) => ({ ...prev, defaultSchoolId: '' }));
                  }}
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
                  onClick={() => {
                    setDefaultSchoolCityId(form.secondaryCityId);
                    setForm((prev) => ({ ...prev, defaultSchoolId: '' }));
                  }}
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
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
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
                  onClick={() => {
                    setSecondarySchoolCityId(form.cityId);
                    setForm((prev) => ({ ...prev, secondarySchoolId: '' }));
                  }}
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
                  onClick={() => {
                    setSecondarySchoolCityId(form.secondaryCityId);
                    setForm((prev) => ({ ...prev, secondarySchoolId: '' }));
                  }}
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
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
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
                            onChange={() =>
                              setSelectedNeighborhoodIds((prev) =>
                                prev.includes(nb.id) ? prev.filter((x) => x !== nb.id) : [...prev, nb.id],
                              )
                            }
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
                            onChange={() =>
                              setSelectedNeighborhoodIds((prev) =>
                                prev.includes(nb.id) ? prev.filter((x) => x !== nb.id) : [...prev, nb.id],
                              )
                            }
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
                          onChange={() =>
                            setSelectedNeighborhoodIds((prev) =>
                              prev.includes(nb.id) ? prev.filter((x) => x !== nb.id) : [...prev, nb.id],
                            )
                          }
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Documento comprobatório</label>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Obrigatório para aprovação.</strong> Envie um documento que comprove que você é transportador escolar (ex.: licença, autorização para transporte escolar, registro no órgão competente). Esse passo é necessário para validar seu cadastro e evitar fraudes. Aceito em foto ou PDF. O arquivo é visível apenas para a administração do Alô Tio.
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
                <p className="text-sm text-green-600 font-medium">Selecionado: {document.name}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition cursor-pointer"
        >
          {submitLabel}
        </button>
      </form>

      <SchoolRegistrationModal open={schoolRegOpen} onClose={() => setSchoolRegOpen(false)} onSubmit={handleSchoolRegistrationSubmit} />
    </>
  );
}

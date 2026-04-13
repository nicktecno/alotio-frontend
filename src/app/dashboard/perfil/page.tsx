'use client';

import { useEffect, useState } from 'react';
import { api, assetUrl } from '@/lib/api';
import { useMyProfile, useNeighborhoods, invalidateProfile } from '@/lib/swr';
import { compressImage } from '@/lib/compressImage';
import Loading from '@/components/Loading';
import FileOrCameraInput from '@/components/FileOrCameraInput';
import toast from 'react-hot-toast';
import { TioProfileForm } from './_components/TioProfileForm';

export default function PerfilPage() {
  const { data: profile, error: profileError, isLoading: profileLoading, mutate: mutateProfile } = useMyProfile();

  const [activeCityIdBairros, setActiveCityIdBairros] = useState('');
  const [selectedNeighborhoodIds, setSelectedNeighborhoodIds] = useState<string[]>([]);
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [savingNeighborhoods, setSavingNeighborhoods] = useState(false);

  useEffect(() => {
    if (profile) {
      setSelectedNeighborhoodIds(profile.neighborhoods.map((n) => n.neighborhood.id));
      setActiveCityIdBairros(profile.cityId);
    }
  }, [profile]);

  const { data: primaryNeighborhoods = [] } = useNeighborhoods(profile?.cityId || undefined);
  const { data: secondaryNeighborhoods = [] } = useNeighborhoods(profile?.secondaryCityId || undefined);

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

  if (profileLoading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <TioProfileForm variant="dashboard" profile={profileError ? null : profile ?? null} />

      {profile && (
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
                        onChange={() =>
                          setSelectedNeighborhoodIds((prev) =>
                            prev.includes(nb.id) ? prev.filter((x) => x !== nb.id) : [...prev, nb.id],
                          )
                        }
                        className="accent-secondary"
                      />
                      <span className="text-gray-900 text-sm">{nb.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {selectedNeighborhoodIds.length} bairro(s) selecionado(s)
                  {profile.isIntermunicipal &&
                    profile.secondaryCity &&
                    ` (${selectedNeighborhoodIds.filter((id) => primaryNeighborhoods.some((n) => n.id === id)).length} em ${profile.city.name}, ${selectedNeighborhoodIds.filter((id) => secondaryNeighborhoods.some((n) => n.id === id)).length} em ${profile.secondaryCity.name})`}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {doc.fileName || 'Ver documento'}
                  </a>
                ))}
              </div>
            )}

            {profile.status === 'REJECTED' && (
              <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-red-700 font-medium">Seu documento foi rejeitado. Envie um novo documento para reavaliação.</p>
                <FileOrCameraInput
                  accept="image/*,.pdf"
                  onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                  onFileCapture={(file) => setNewDocument(file)}
                  uploadLabel="Escolher arquivo"
                  cameraLabel="Tirar foto"
                  uploadClassName="bg-red-100 hover:bg-red-200 text-red-700"
                  cameraClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
                />
                {newDocument && <p className="text-sm text-green-600 font-medium">Selecionado: {newDocument.name}</p>}
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
                {newDocument && <p className="text-sm text-green-600 font-medium">Selecionado: {newDocument.name}</p>}
                <button
                  onClick={handleResubmitDocument}
                  disabled={!newDocument || uploadingDoc}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  {uploadingDoc ? 'Enviando...' : 'Enviar novo documento'}
                </button>
              </div>
            )}

            {profile.status === 'APPROVED' && <p className="text-sm text-green-600 font-medium">Seu documento foi aprovado.</p>}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api, assetUrl } from '@/lib/api';
import { useMyProfile, invalidateProfile } from '@/lib/swr';
import { compressImage } from '@/lib/compressImage';
import Loading from '@/components/Loading';
import ImageLightbox from '@/components/ImageLightbox';
import FileOrCameraInput from '@/components/FileOrCameraInput';
import toast from 'react-hot-toast';
import type { VehiclePhoto } from '@/types';

export default function FotosPage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => {
    if (profile?.vehiclePhotos) setPhotos(profile.vehiclePhotos);
  }, [profile]);

  const isPremium = profile?.subscriptions && profile.subscriptions.length > 0;

  const processAvatarFile = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('avatar', compressed);
      await api.uploadAvatar(fd);
      toast.success('Avatar atualizado!');
      invalidateProfile();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
  };

  const handleDeleteAvatar = async () => {
    try {
      await api.deleteAvatar();
      toast.success('Avatar removido');
      invalidateProfile();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  const processPhotoFile = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('photo', compressed);
      await api.uploadVehiclePhoto(fd);
      toast.success('Foto adicionada!');
      invalidateProfile();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processPhotoFile(file);
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await api.deleteVehiclePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success('Foto removida');
      invalidateProfile();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  };

  if (profileLoading || profile === undefined) return <Loading />;

  if (!profile) return <Loading />;

  if (!isPremium) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Fotos</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Recurso Premium</h2>
          <p className="text-gray-500 mb-6">
            Avatar e fotos do veículo são exibidos apenas para assinantes premium.
          </p>
          <a
            href="/dashboard/assinatura"
            className="inline-block bg-secondary hover:bg-secondary-600 text-white px-6 py-2.5 rounded-lg font-semibold transition"
          >
            Ver planos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold font-heading text-gray-900">Fotos</h1>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Avatar</h2>
          <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center shrink-0 overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={assetUrl(profile.avatarUrl)!}
                alt="Avatar"
                className="w-20 h-20 object-cover cursor-pointer hover:opacity-80 transition"
                onClick={() => setLightbox({ images: [assetUrl(profile.avatarUrl)!], index: 0 })}
              />
            ) : (
              <span className="text-3xl text-primary font-bold">
                {profile.displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {uploading ? (
              <span className="inline-block text-sm text-gray-500 font-medium">Enviando...</span>
            ) : (
              <FileOrCameraInput
                accept="image/*"
                onChange={handleAvatarUpload}
                onFileCapture={processAvatarFile}
                disabled={uploading}
                uploadLabel="Escolher foto"
                cameraLabel="Tirar foto"
                uploadClassName="bg-secondary hover:bg-secondary-600 text-white"
                cameraClassName="bg-primary-50 hover:bg-primary-100 text-primary-700"
              />
            )}
            {profile.avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                className="block text-red-500 hover:text-red-600 text-sm font-medium"
              >
                Remover avatar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Photos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Fotos do Veículo</h2>
          <span className="text-xs text-gray-500">{photos.length}/5</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {photos.map((photo, idx) => (
            <div key={photo.id} className="relative group">
              <img
                src={assetUrl(photo.url)!}
                alt="Veículo"
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                onClick={() =>
                  setLightbox({
                    images: photos.map((p) => assetUrl(p.url)!),
                    index: idx,
                  })
                }
              />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              >
                X
              </button>
            </div>
          ))}
        </div>
        {photos.length >= 5 ? (
          <p className="text-sm text-gray-500">Limite de 5 fotos atingido. Remova uma para adicionar outra.</p>
        ) : uploading ? (
          <span className="inline-block text-sm text-gray-500 font-medium">Enviando...</span>
        ) : (
          <FileOrCameraInput
            accept="image/*"
            onChange={handlePhotoUpload}
            onFileCapture={processPhotoFile}
            disabled={uploading}
            uploadLabel="Escolher foto"
            cameraLabel="Tirar foto"
          />
        )}
      </div>

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

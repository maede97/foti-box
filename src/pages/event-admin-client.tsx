'use client';
import { AdminHeader } from '@/components/admin/admin-header';
import { EventAdminImagesSection } from '@/components/admin/event-admin-images-section';
import { EventAdminLogoAside } from '@/components/admin/event-admin-logo-aside';
import { EventAdminPasswordDownloadCard } from '@/components/admin/event-admin-password-download-card';
import { EventAdminUploadsCard } from '@/components/admin/event-admin-uploads-card';
import { LogoUploadModal } from '@/components/admin/logo-upload-modal';
import GalleryLogin from '@/components/gallery/login';
import { environmentVariables } from '@/config/environment';
import { useEventAdminAuth } from '@/hooks/admin/use-event-admin-auth';
import { useEventAdminSettings } from '@/hooks/admin/use-event-admin-settings';
import { useImageFileSelection } from '@/hooks/admin/use-image-file-selection';
import { usePaginatedImages } from '@/hooks/admin/use-paginated-images';
import { IImage } from '@/models/image';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

const EventAdminPageClient: React.FC<{
  eventId: string;
  initialImageCount: number;
  eventName: string;
  eventSlug: string;
}> = ({ eventId, initialImageCount, eventName, eventSlug }) => {
  const [error, setError] = useState('');

  const { loggedIn, currentPassword, adminData, setAdminData, login, logout } = useEventAdminAuth({
    eventSlug,
    onError: setError,
  });

  const [galleryPassword, setGalleryPassword] = useState('');
  const [imageCount, setImageCount] = useState(initialImageCount);
  const [uploadQrCodeUrl, setUploadQrCodeUrl] = useState('');
  const [showAddLogo, setShowAddLogo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isSavingUploads, setIsSavingUploads] = useState(false);
  const [isSavingDownloads, setIsSavingDownloads] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);

  const {
    saveGalleryPassword,
    toggleUploads,
    toggleDownloads,
    uploadLogo,
    deleteLogo,
    deleteImage,
  } = useEventAdminSettings({
    eventId,
    currentPassword,
    adminData,
    setAdminData,
    onError: setError,
  });

  const {
    selectedFile: selectedLogo,
    previewUrl: logoPreviewUrl,
    clearSelection: clearLogoSelection,
    handleFileInputChange,
  } = useImageFileSelection();

  const {
    images,
    loading: loadingImages,
    isLoadingMore,
    hasMore,
    loadInitial: loadImages,
    loadMore,
    removeImageByUuid,
    resetImages,
  } = usePaginatedImages<IImage>({
    loadPage: async (page, limit) => {
      if (!currentPassword) {
        return [];
      }

      const res = await fetch('/api/event-admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, adminPassword: currentPassword, page, limit }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bilder konnten nicht geladen werden.');
      }

      return res.json();
    },
    onError: (message) => setError(message),
  });

  const uploadUrl = `${environmentVariables.NEXT_PUBLIC_APP_HOST_URL}/event/${eventSlug}/upload`;

  useEffect(() => {
    if (!adminData) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGalleryPassword(adminData.password || '');
    setPasswordSaved(false);
  }, [adminData]);

  useEffect(() => {
    if (!adminData?.allow_user_uploads) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUploadQrCodeUrl('');
    }

    let cancelled = false;

    void QRCode.toDataURL(uploadUrl, {
      width: 320,
      margin: 2,
    }).then((dataUrl) => {
      if (!cancelled) {
        setUploadQrCodeUrl(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [adminData?.allow_user_uploads, uploadUrl]);

  const handleGalleryPasswordSave = async () => {
    setIsSavingPassword(true);
    setError('');
    setPasswordSaved(false);

    try {
      await saveGalleryPassword(galleryPassword);
      setPasswordSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Passwort konnte nicht aktualisiert werden.',
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggleUploads = async () => {
    if (!adminData) return;

    setIsSavingUploads(true);
    setError('');

    try {
      await toggleUploads();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Upload-Freigabe konnte nicht geändert werden.',
      );
    } finally {
      setIsSavingUploads(false);
    }
  };

  const handleDownloadUploadQr = async () => {
    setIsDownloadingQr(true);
    setError('');

    try {
      const highResQr = await QRCode.toDataURL(uploadUrl, {
        width: 1600,
        margin: 2,
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = highResQr;
      downloadLink.download = `${eventSlug}-upload-qr.png`;
      downloadLink.click();
    } catch {
      setError('QR-Code konnte nicht heruntergeladen werden.');
    } finally {
      setIsDownloadingQr(false);
    }
  };

  const handleToggleDownloads = async () => {
    if (!adminData) return;

    setIsSavingDownloads(true);
    setError('');

    try {
      await toggleDownloads();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Download-Freigabe konnte nicht geändert werden.',
      );
    } finally {
      setIsSavingDownloads(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    handleFileInputChange(file, () => setError('Bitte eine gültige Bilddatei auswählen.'));
    if (file.type.startsWith('image/')) {
      setError('');
    }
  };

  const handleAddLogo = async () => {
    if (!selectedLogo) {
      setError('Bitte zuerst eine Datei auswählen.');
      return;
    }

    setIsSavingLogo(true);
    setError('');

    try {
      await uploadLogo(selectedLogo);
      clearLogoSelection();
      setShowAddLogo(false);
    } catch (logoError) {
      setError(
        logoError instanceof Error ? logoError.message : 'Logo konnte nicht gesetzt werden.',
      );
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Bist du sicher, dass du dieses Logo löschen willst?')) return;

    setIsDeletingLogo(true);
    setError('');

    try {
      await deleteLogo();
    } catch (logoError) {
      setError(
        logoError instanceof Error ? logoError.message : 'Logo konnte nicht gelöscht werden.',
      );
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const handleDeleteImage = async (uuid: string) => {
    if (!confirm('Bist du sicher, dass du dieses Bild löschen willst?')) return;

    setIsDeletingImage(uuid);
    setError('');

    try {
      await deleteImage(uuid);
      removeImageByUuid(uuid);
      setImageCount((prev) => Math.max(0, prev - 1));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Bild konnte nicht gelöscht werden.',
      );
    } finally {
      setIsDeletingImage(null);
    }
  };

  const handleLogout = () => {
    logout();
    setGalleryPassword('');
    resetImages();
    clearLogoSelection();
    setError('');
  };

  return (
    <div className="p-6">
      {!loggedIn && (
        <GalleryLogin
          fetchGallery={(selectedEvents, passwords) => {
            login(selectedEvents, passwords);
          }}
          error={error}
          selectedEvent={eventSlug}
          showAdminTitle={true}
        />
      )}
      {loggedIn && adminData && (
        <div>
          <AdminHeader title={`Event ${eventName} - Administration`} onLogout={handleLogout} />

          {error && <p className="text-error mb-6 rounded p-2 text-sm">{error}</p>}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <EventAdminPasswordDownloadCard
                  eventSlug={eventSlug}
                  galleryPassword={galleryPassword}
                  onGalleryPasswordChange={(value) => {
                    setGalleryPassword(value);
                    setPasswordSaved(false);
                  }}
                  onSavePassword={() => void handleGalleryPasswordSave()}
                  isSavingPassword={isSavingPassword}
                  passwordSaved={passwordSaved}
                  allowDownload={adminData.allow_download}
                  onToggleDownloads={() => void handleToggleDownloads()}
                  isSavingDownloads={isSavingDownloads}
                />

                <EventAdminUploadsCard
                  eventSlug={eventSlug}
                  eventName={eventName}
                  allowUserUploads={adminData.allow_user_uploads}
                  onToggleUploads={() => void handleToggleUploads()}
                  isSavingUploads={isSavingUploads}
                  uploadQrCodeUrl={uploadQrCodeUrl}
                  onDownloadQr={() => void handleDownloadUploadQr()}
                  isDownloadingQr={isDownloadingQr}
                />
              </div>

              <EventAdminImagesSection
                imageCount={imageCount}
                loadingImages={loadingImages}
                onLoadImages={() => loadImages()}
                images={images}
                onDeleteImage={(uuid) => void handleDeleteImage(uuid)}
                deleteInProgressUuid={isDeletingImage}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
              />
            </div>

            <aside className="space-y-6">
              <EventAdminLogoAside
                eventName={eventName}
                eventId={eventId}
                logo={adminData.logo}
                onOpenUploadModal={() => setShowAddLogo(true)}
                onDeleteLogo={() => void handleDeleteLogo()}
                isDeletingLogo={isDeletingLogo}
              />
            </aside>
          </div>

          <LogoUploadModal
            open={showAddLogo}
            title="Logo setzen"
            onClose={() => {
              setShowAddLogo(false);
              clearLogoSelection();
            }}
            onFileChange={handleLogoChange}
            previewUrl={logoPreviewUrl}
            error={error}
            hasSelectedFile={Boolean(selectedLogo)}
            onSubmit={() => {
              void handleAddLogo();
            }}
            submitLabel="Logo setzen"
            isSubmitting={isSavingLogo}
            submittingLabel="Speichern..."
          />
        </div>
      )}
    </div>
  );
};

export default EventAdminPageClient;

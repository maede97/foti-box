'use client';
import { fetchGalleryAdmin } from '@/components/gallery/fetch';
import GalleryLogin from '@/components/gallery/login';
import { environmentVariables } from '@/config/environment';
import { IImage } from '@/models/image';
import { motion } from 'framer-motion';
import { ExternalLink, Upload, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

type EventAdminData = {
  _id: string;
  name: string;
  slug: string;
  password: string;
  allow_user_uploads: boolean;
  logo?: string;
};

function Modal({
  title,
  onClose,
  children,
}: React.PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <div className="bg-primary/80 fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary text-primary relative w-full max-w-xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-primary mb-6 text-lg font-semibold tracking-wide uppercase">{title}</h2>
        {children}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}

const EventAdminPageClient: React.FC<{
  eventId: string;
  initialImageCount: number;
  eventName: string;
  eventSlug: string;
}> = ({ eventId, initialImageCount, eventName, eventSlug }) => {
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [adminData, setAdminData] = useState<EventAdminData | null>(null);
  const [galleryPassword, setGalleryPassword] = useState('');
  const [imageCount, setImageCount] = useState(initialImageCount);
  const [images, setImages] = useState<IImage[]>([]);
  const [uploadQrCodeUrl, setUploadQrCodeUrl] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAddLogo, setShowAddLogo] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | undefined>(undefined);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isSavingUploads, setIsSavingUploads] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);

  const uploadUrl = `${environmentVariables.NEXT_PUBLIC_APP_HOST_URL}/event/${eventSlug}/upload`;

  useEffect(() => {
    const savedPassword = localStorage.getItem(`event-admin-${eventSlug}`);
    if (savedPassword) {
      setCurrentPassword(savedPassword);
      void fetchGalleryAdmin(eventSlug, savedPassword, setError, setAdminData, setLoggedIn);
    }
  }, [eventSlug]);

  useEffect(() => {
    if (!adminData) return;

    const timeoutId = window.setTimeout(() => {
      setGalleryPassword(adminData.password || '');
      setPasswordSaved(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [adminData]);

  useEffect(() => {
    if (!adminData?.allow_user_uploads) {
      const timeoutId = window.setTimeout(() => {
        setUploadQrCodeUrl('');
      }, 0);

      return () => window.clearTimeout(timeoutId);
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

  const loadImages = async (page: number = 1) => {
    if (!currentPassword) return;

    if (page === 1) {
      setLoadingImages(true);
      setImages([]);
      setCurrentPage(1);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const limit = 25;
      const res = await fetch('/api/event-admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, adminPassword: currentPassword, page, limit }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bilder konnten nicht geladen werden.');
      }

      const data = await res.json();
      if (page === 1) {
        setImages(data);
      } else {
        setImages((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === limit);
      setCurrentPage(page);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Bilder konnten nicht geladen werden.',
      );
    } finally {
      setLoadingImages(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;
    void loadImages(currentPage + 1);
  };

  const handleGalleryPasswordSave = async () => {
    setIsSavingPassword(true);
    setError('');
    setPasswordSaved(false);

    try {
      const res = await fetch('/api/event-admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          adminPassword: currentPassword,
          password: galleryPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Passwort konnte nicht aktualisiert werden.');
      }

      const data = await res.json();
      setAdminData(data.event);
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
      const res = await fetch('/api/event-admin/allow-user-uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          adminPassword: currentPassword,
          allow_user_uploads: !adminData.allow_user_uploads,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload-Freigabe konnte nicht geändert werden.');
      }

      const data = await res.json();
      setAdminData(data.event);
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

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Bitte eine gültige Bilddatei auswählen.');
      setSelectedLogo(undefined);
      setLogoPreviewUrl(undefined);
      return;
    }

    setSelectedLogo(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleAddLogo = async () => {
    if (!selectedLogo) {
      setError('Bitte zuerst eine Datei auswählen.');
      return;
    }

    setIsSavingLogo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedLogo);
      formData.append('eventId', eventId);
      formData.append('adminPassword', currentPassword);

      const res = await fetch('/api/event-admin/logo', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Logo konnte nicht gesetzt werden.');
      }

      const data = await res.json();
      setAdminData(data.event);
      setSelectedLogo(undefined);
      setLogoPreviewUrl(undefined);
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
      const res = await fetch('/api/event-admin/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, adminPassword: currentPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Logo konnte nicht gelöscht werden.');
      }

      const data = await res.json();
      setAdminData(data.event);
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
      const res = await fetch('/api/event-admin/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, adminPassword: currentPassword, uuid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bild konnte nicht gelöscht werden.');
      }

      setImages((prev) => prev.filter((image) => image.uuid !== uuid));
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
    localStorage.removeItem(`event-admin-${eventSlug}`);
    setLoggedIn(false);
    setCurrentPassword('');
    setAdminData(null);
    setGalleryPassword('');
    setImages([]);
    setError('');
  };

  return (
    <div className="p-6">
      {!loggedIn && (
        <GalleryLogin
          fetchGallery={(selectedEvents, passwords) => {
            setCurrentPassword(passwords);
            fetchGalleryAdmin(selectedEvents, passwords, setError, setAdminData, setLoggedIn);
          }}
          error={error}
          selectedEvent={eventSlug}
        />
      )}
      {loggedIn && adminData && (
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-heading mt-6 mb-2 max-w-4xl pt-8 text-3xl font-extrabold text-balance hyphens-auto">
                Event {eventName} - Administration
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
            >
              Abmelden
            </button>
          </div>

          {error && <p className="text-error mb-6 rounded p-2 text-sm">{error}</p>}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-primary text-xl font-semibold">Galerie Passwort</h2>
                      <p className="text-primary/60 text-sm">
                        Dieses Passwort wird für Besucherinnen und Besucher der Galerie verwendet.
                      </p>
                    </div>
                    <Link
                      href={`/event/${eventSlug}`}
                      target="_blank"
                      className="text-primary hover:text-accent-dark border-primary inline-flex items-center gap-2 rounded border px-4 py-2 text-sm transition"
                    >
                      Galerie öffnen
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      value={galleryPassword}
                      onChange={(event) => {
                        setGalleryPassword(event.target.value);
                        setPasswordSaved(false);
                      }}
                      placeholder="Galerie Passwort"
                      className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => void handleGalleryPasswordSave()}
                      disabled={isSavingPassword}
                      className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                    >
                      {isSavingPassword ? 'Speichern...' : 'Speichern'}
                    </button>
                  </div>

                  <div className="mt-3 min-h-6">
                    {passwordSaved && !isSavingPassword ? (
                      <p className="bg-success/15 text-success rounded px-3 py-2 text-sm font-medium">
                        Passwort gespeichert.
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-primary text-xl font-semibold">Uploads</h2>
                      <p className="text-primary/60 text-sm">
                        Steuern Sie, ob Bilder für diesen Event hochgeladen werden dürfen.
                      </p>
                    </div>
                    <button
                      onClick={() => void handleToggleUploads()}
                      disabled={isSavingUploads}
                      className={`cursor-pointer rounded border px-6 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50 ${
                        adminData.allow_user_uploads
                          ? 'bg-success hover:bg-success-dark text-secondary'
                          : 'bg-error hover:bg-error-dark text-secondary'
                      }`}
                    >
                      {isSavingUploads
                        ? 'Speichern...'
                        : adminData.allow_user_uploads
                          ? 'Uploads Ein'
                          : 'Uploads Aus'}
                    </button>
                  </div>
                  <p className="text-primary/70 text-sm">
                    Status:{' '}
                    {adminData.allow_user_uploads
                      ? 'Benutzer-Uploads sind aktiviert.'
                      : 'Benutzer-Uploads sind deaktiviert.'}
                  </p>

                  {adminData.allow_user_uploads ? (
                    <div className="bg-primary/5 mt-4 rounded-xl p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-primary text-sm font-semibold tracking-wide uppercase">
                            Upload QR-Code
                          </h3>
                          <p className="text-primary/60 mt-1 text-sm">
                            Verlinkt direkt auf den Upload für diesen Event.
                          </p>
                          <Link
                            href={`/event/${eventSlug}/upload`}
                            target="_blank"
                            className="border-primary text-primary hover:text-accent-dark mt-2 inline-flex items-center gap-2 rounded border px-4 py-2 text-sm transition"
                          >
                            Upload-Seite öffnen
                            <ExternalLink className="size-4" />
                          </Link>
                        </div>

                        {uploadQrCodeUrl ? (
                          <img
                            src={uploadQrCodeUrl}
                            alt={`QR-Code für Upload von ${eventName}`}
                            width={160}
                            height={160}
                            className="rounded-lg bg-white p-2 shadow-md"
                          />
                        ) : (
                          <div className="bg-primary/10 text-primary/60 flex h-40 w-40 items-center justify-center rounded-lg text-sm">
                            QR wird erstellt...
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => void handleDownloadUploadQr()}
                        disabled={isDownloadingQr}
                        className="bg-primary text-secondary hover:bg-accent-dark mt-4 w-full cursor-pointer rounded border px-4 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                      >
                        {isDownloadingQr
                          ? 'Wird erstellt...'
                          : 'QR-Code hochauflösend herunterladen'}
                      </button>
                    </div>
                  ) : null}
                </section>
              </div>

              <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-primary text-xl font-semibold">Bilder verwalten</h2>
                    <p className="text-primary/60 text-sm">
                      Hier kannst du Bilder löschen. Insgesamt {imageCount}{' '}
                      {imageCount === 1 ? 'Bild' : 'Bilder'} vorhanden.
                    </p>
                  </div>
                  <button
                    onClick={() => void loadImages(1)}
                    disabled={loadingImages}
                    className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                  >
                    {loadingImages ? 'Laden...' : 'Bilder laden'}
                  </button>
                </div>

                {loadingImages ? (
                  <p className="text-primary/70 text-sm">Bilder werden geladen...</p>
                ) : images.length === 0 ? (
                  <p className="text-primary/70 text-sm">
                    Drücke auf &quot;Bilder laden&quot;, um die Bilder anzuzeigen.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                      {images.map((img) => (
                        <motion.div
                          key={img.uuid}
                          whileHover={{ scale: 1.03 }}
                          className="relative overflow-hidden rounded-xl shadow-lg"
                        >
                          <Link href={`/gallery/${img.uuid}`} target="_blank">
                            <Image
                              src={`/api/gallery?uuid=${img.uuid}`}
                              alt="foti-box.com"
                              width={300}
                              height={200}
                              className="h-40 w-full object-cover"
                            />
                          </Link>
                          <button
                            onClick={() => void handleDeleteImage(img.uuid)}
                            disabled={isDeletingImage === img.uuid}
                            className="bg-error hover:bg-error-dark text-secondary absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition focus:outline-none disabled:opacity-50"
                          >
                            <X />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {(hasMore || isLoadingMore) && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={loadMore}
                          disabled={isLoadingMore}
                          className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                        >
                          {isLoadingMore ? 'Laden...' : 'Mehr laden'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-primary text-xl font-semibold">Logo</h2>
                    <p className="text-primary/60 text-sm">
                      Das Logo wird auf jedem Foto unten rechts eingefügt.
                    </p>
                  </div>
                  {!adminData.logo && (
                    <button
                      onClick={() => setShowAddLogo(true)}
                      className="bg-primary text-secondary hover:bg-accent-dark inline-flex cursor-pointer items-center gap-2 rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                    >
                      <Upload className="size-4" /> Logo setzen
                    </button>
                  )}
                </div>

                {adminData.logo ? (
                  <div className="space-y-4">
                    <div className="bg-primary/5 relative h-44 overflow-hidden rounded-lg shadow-md">
                      <Image
                        alt={adminData.logo}
                        fill
                        src={`/api/admin/logo?logo=${adminData.logo}&eventId=${eventId}`}
                        className="object-contain p-4"
                      />
                    </div>
                    <button
                      onClick={() => void handleDeleteLogo()}
                      disabled={isDeletingLogo}
                      className="bg-error hover:bg-error-dark text-secondary w-full cursor-pointer rounded border px-4 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                    >
                      {isDeletingLogo ? 'Löschen...' : 'Logo entfernen'}
                    </button>
                  </div>
                ) : (
                  <p className="text-primary/70 text-sm">Derzeit ist kein Logo gesetzt.</p>
                )}
              </section>
            </aside>
          </div>

          {showAddLogo && (
            <Modal
              title="Logo setzen"
              onClose={() => {
                setShowAddLogo(false);
                setSelectedLogo(undefined);
                setLogoPreviewUrl(undefined);
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-primary text-xs tracking-wide uppercase">
                    Bild auswählen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
                  />

                  {logoPreviewUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoPreviewUrl}
                        alt="Vorschau"
                        width={100}
                        className="border-accent max-h-60 w-full rounded border object-contain"
                      />
                    </div>
                  )}
                </div>

                {selectedLogo && (
                  <button
                    onClick={() => void handleAddLogo()}
                    disabled={isSavingLogo}
                    className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                  >
                    {isSavingLogo ? 'Speichern...' : 'Logo setzen'}
                  </button>
                )}
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

export default EventAdminPageClient;

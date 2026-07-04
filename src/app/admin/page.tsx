'use client';

import { AdminBoxFormModal } from '@/components/admin/admin-box-form-modal';
import { AdminBoxesSection } from '@/components/admin/admin-boxes-section';
import { AdminEventFormModal } from '@/components/admin/admin-event-form-modal';
import { AdminEventsSection } from '@/components/admin/admin-events-section';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLoginPanel } from '@/components/admin/admin-login-panel';
import { AdminImageGrid } from '@/components/admin/image-grid';
import { LogoUploadModal } from '@/components/admin/logo-upload-modal';
import { useAdminAssets } from '@/hooks/admin/use-admin-assets';
import { useAdminAuth } from '@/hooks/admin/use-admin-auth';
import { useAdminBoxes } from '@/hooks/admin/use-admin-boxes';
import { useAdminEvents } from '@/hooks/admin/use-admin-events';
import { usePaginatedImages } from '@/hooks/admin/use-paginated-images';
import { IEvent } from '@/models/event';
import { IImage } from '@/models/image';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [error, setError] = useState('');

  const {
    adminUsername,
    setAdminUsername,
    adminPassword,
    setAdminPassword,
    token,
    loggedIn,
    login,
    logout,
  } = useAdminAuth({ onError: setError });

  const {
    events,
    fetchEvents,
    switchActiveEvent,
    addEvent,
    deleteEvent,
    openEditEventModal,
    closeEditEventModal,
    editEvent,
    setAllowUserUpload,
    setAllowImageDownload,
    addLogo,
    deleteLogo,
    showAddLogo,
    openAddLogoModal,
    closeAddLogoModal,
    showAddEvent,
    setShowAddEvent,
    showEditEvent,
    eventName,
    setEventName,
    eventSlug,
    setEventSlug,
    eventPassword,
    setEventPassword,
    eventAdminPassword,
    setEventAdminPassword,
    editEventName,
    setEditEventName,
    editEventSlug,
    setEditEventSlug,
    editEventPassword,
    setEditEventPassword,
    editEventAdminPassword,
    setEditEventAdminPassword,
    selectedEvent,
    selectedEventRef,
    selectEventForImages,
    clearSelectedEvent,
  } = useAdminEvents({ token, onUnauthorized: handleLogout, setError });

  const {
    boxes,
    fetchBoxes,
    addBox,
    deleteBox,
    setBoxActive,
    boxLabel,
    setBoxLabel,
    boxAccessToken,
    setBoxAccessToken,
    showAddBox,
    setShowAddBox,
  } = useAdminBoxes({ token, onUnauthorized: handleLogout, setError });

  const {
    images,
    loading,
    hasMore,
    isLoadingMore,
    fetchPage,
    loadMore,
    removeImageByUuid,
    resetImages,
  } = usePaginatedImages<IImage>({
    loadPage: async (page, limit) => {
      const selectedEvent = selectedEventRef.current;
      if (!selectedEvent || !token) {
        return [];
      }

      const res = await fetch('/api/gallery', {
        headers: { Authorization: `Bearer ${token}` },
        method: 'POST',
        body: JSON.stringify({
          slug: selectedEvent.slug,
          password: selectedEvent.password,
          full: true,
          page,
          limit,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          return [];
        }

        const data = await res.json();
        throw new Error(data.error || 'Bilder konnten nicht geladen werden.');
      }

      return res.json();
    },
    onError: (message) => setError(message),
  });

  function handleLogout() {
    logout();
    resetImages();
    clearSelectedEvent();
    setError('');
  }

  const {
    selectedLogo,
    logoPreviewUrl,
    handleLogoChange,
    handleAddLogo,
    handleCloseLogoModal,
    handleDeleteImage,
  } = useAdminAssets({
    token,
    setError,
    addLogo,
    closeAddLogoModal,
    fetchEvents,
    removeImageByUuid,
  });

  function handleLogin() {
    void login();
  }

  function fetchImages(event: IEvent) {
    setError('');
    selectEventForImages(event);
    void fetchPage(1);
  }

  useEffect(() => {
    if (loggedIn && token) {
      fetchEvents();
      fetchBoxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, token]);

  if (!loggedIn) {
    return (
      <AdminLoginPanel
        error={error}
        adminUsername={adminUsername}
        adminPassword={adminPassword}
        onUsernameChange={setAdminUsername}
        onPasswordChange={setAdminPassword}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="p-6">
      <AdminHeader title="Admin Dashboard" onLogout={handleLogout} />

      <AdminEventsSection
        events={events}
        onOpenAddEvent={() => {
          setError('');
          setShowAddEvent(true);
        }}
        onOpenAddLogo={openAddLogoModal}
        onDeleteLogo={deleteLogo}
        onToggleUploads={setAllowUserUpload}
        onToggleDownloads={setAllowImageDownload}
        onSetActive={switchActiveEvent}
        onLoadImages={fetchImages}
        onEditEvent={openEditEventModal}
        onDeleteEvent={(eventId) => {
          void deleteEvent(eventId).then((deleted) => {
            if (
              deleted &&
              selectedEvent &&
              String(selectedEvent._id) === String(eventId as unknown as string)
            ) {
              clearSelectedEvent();
              resetImages();
            }
          });
        }}
      />

      <AdminBoxesSection
        boxes={boxes}
        onOpenAddBox={() => {
          setError('');
          setShowAddBox(true);
        }}
        onToggleBoxActive={setBoxActive}
        onDeleteBox={deleteBox}
      />

      {selectedEvent && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Bilder für den Event {selectedEvent.name}</h2>
          <AdminImageGrid
            images={images}
            loading={loading}
            emptyMessage="Keine Bilder vorhanden."
            onDeleteImage={(uuid) => {
              void handleDeleteImage(uuid);
            }}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        </section>
      )}

      <AdminEventFormModal
        open={showAddEvent}
        title="Event hinzufügen"
        name={eventName}
        slug={eventSlug}
        password={eventPassword}
        adminPassword={eventAdminPassword}
        submitLabel="Event hinzufügen"
        error={error}
        onClose={() => setShowAddEvent(false)}
        onNameChange={setEventName}
        onSlugChange={setEventSlug}
        onPasswordChange={setEventPassword}
        onAdminPasswordChange={setEventAdminPassword}
        onSubmit={addEvent}
      />

      <AdminEventFormModal
        open={showEditEvent}
        title="Event bearbeiten"
        name={editEventName}
        slug={editEventSlug}
        password={editEventPassword}
        adminPassword={editEventAdminPassword}
        submitLabel="Event speichern"
        error={error}
        onClose={closeEditEventModal}
        onNameChange={setEditEventName}
        onSlugChange={setEditEventSlug}
        onPasswordChange={setEditEventPassword}
        onAdminPasswordChange={setEditEventAdminPassword}
        onSubmit={editEvent}
      />

      <AdminBoxFormModal
        open={showAddBox}
        label={boxLabel}
        accessToken={boxAccessToken}
        error={error}
        onClose={() => setShowAddBox(false)}
        onLabelChange={setBoxLabel}
        onAccessTokenChange={setBoxAccessToken}
        onSubmit={addBox}
      />

      <LogoUploadModal
        open={Boolean(showAddLogo)}
        title="Logo setzen"
        onClose={handleCloseLogoModal}
        onFileChange={handleLogoChange}
        previewUrl={logoPreviewUrl}
        error={error}
        hasSelectedFile={Boolean(selectedLogo)}
        onSubmit={handleAddLogo}
        submitLabel="Logo setzen"
      />
    </div>
  );
}

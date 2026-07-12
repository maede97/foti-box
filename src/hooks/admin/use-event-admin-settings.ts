import { EventAdminData } from './use-event-admin-auth';

type UseEventAdminSettingsOptions = {
  eventId: string;
  currentPassword: string;
  adminData: EventAdminData | null;
  setAdminData: (
    value: EventAdminData | null | ((prev: EventAdminData | null) => EventAdminData | null),
  ) => void;
  onError: (message: string) => void;
};

export function useEventAdminSettings({
  eventId,
  currentPassword,
  adminData,
  setAdminData,
  onError,
}: UseEventAdminSettingsOptions) {
  async function saveGalleryPassword(password: string) {
    const res = await fetch('/api/event-admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        adminPassword: currentPassword,
        password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Passwort konnte nicht aktualisiert werden.');
    }

    const data = await res.json();
    setAdminData(data.event);
    return data.event as EventAdminData;
  }

  async function toggleUploads() {
    if (!adminData) {
      return;
    }

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
  }

  async function toggleDownloads() {
    if (!adminData) {
      return;
    }

    const res = await fetch('/api/event-admin/allow-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        adminPassword: currentPassword,
        allow_download: !adminData.allow_download,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Download-Freigabe konnte nicht geändert werden.');
    }

    const data = await res.json();
    setAdminData(data.event);
  }

  async function uploadLogo(selectedLogo: File) {
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
  }

  async function deleteLogo() {
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
  }

  async function deleteImage(uuid: string) {
    const res = await fetch('/api/event-admin/delete-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, adminPassword: currentPassword, uuid }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Bild konnte nicht gelöscht werden.');
    }
  }

  function clearError() {
    onError('');
  }

  return {
    clearError,
    saveGalleryPassword,
    toggleUploads,
    toggleDownloads,
    uploadLogo,
    deleteLogo,
    deleteImage,
  };
}

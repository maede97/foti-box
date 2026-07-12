import { useImageFileSelection } from '@/hooks/admin/use-image-file-selection';

type UseAdminAssetsOptions = {
  token?: string;
  setError: (message: string) => void;
  addLogo: (selectedLogo: File) => Promise<boolean>;
  closeAddLogoModal: () => void;
  fetchEvents: () => Promise<void>;
  removeImageByUuid: (uuid: string) => void;
};

export function useAdminAssets({
  token,
  setError,
  addLogo,
  closeAddLogoModal,
  fetchEvents,
  removeImageByUuid,
}: UseAdminAssetsOptions) {
  const {
    selectedFile: selectedLogo,
    previewUrl: logoPreviewUrl,
    clearSelection: clearLogoSelection,
    handleFileInputChange,
  } = useImageFileSelection();

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

  async function handleAddLogo() {
    if (!selectedLogo) {
      setError('Bitte zuerst eine Datei auswählen.');
      return;
    }

    const success = await addLogo(selectedLogo);
    if (success) {
      setError('');
      clearLogoSelection();
    }
  }

  const handleCloseLogoModal = () => {
    closeAddLogoModal();
    clearLogoSelection();
    setError('');
  };

  async function handleDeleteImage(uuid: string) {
    if (!confirm('Bist du sicher, dass du dieses Bild löschen willst?')) return;

    const res = await fetch('/api/admin/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ uuid }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Bild konnte nicht gelöscht werden.');
      return;
    }

    removeImageByUuid(uuid);
    await fetchEvents();
  }

  return {
    selectedLogo,
    logoPreviewUrl,
    handleLogoChange,
    handleAddLogo,
    handleCloseLogoModal,
    handleDeleteImage,
  };
}

import { useCallback, useEffect, useState } from 'react';

export function useImageFileSelection() {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const clearSelection = useCallback(() => {
    setSelectedFile(undefined);
    setPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return undefined;
    });
  }, []);

  const handleFileInputChange = useCallback(
    (file: File | undefined, onInvalidType?: () => void) => {
      if (!file) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        clearSelection();
        if (onInvalidType) {
          onInvalidType();
        }
        return;
      }

      setSelectedFile(file);
      setPreviewUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
        return URL.createObjectURL(file);
      });
    },
    [clearSelection],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    selectedFile,
    previewUrl,
    clearSelection,
    handleFileInputChange,
  };
}

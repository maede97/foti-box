import React from 'react';
import { AdminModal } from './modal';

type LogoUploadModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl?: string;
  error?: string;
  hasSelectedFile: boolean;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  submittingLabel?: string;
};

export function LogoUploadModal({
  open,
  title = 'Logo setzen',
  onClose,
  onFileChange,
  previewUrl,
  error,
  hasSelectedFile,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  submittingLabel = 'Speichern...',
}: LogoUploadModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AdminModal title={title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Bild auswählen</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />

          {previewUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Vorschau"
                width={100}
                className="border-accent max-h-60 w-full rounded border object-contain"
              />
            </div>
          )}
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        {hasSelectedFile && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        )}
      </div>
    </AdminModal>
  );
}

import { StatusToggleButton } from '@/components/admin/status-toggle-button';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

type EventAdminPasswordDownloadCardProps = {
  eventSlug: string;
  galleryPassword: string;
  onGalleryPasswordChange: (value: string) => void;
  onSavePassword: () => void;
  isSavingPassword: boolean;
  passwordSaved: boolean;
  allowDownload: boolean;
  onToggleDownloads: () => void;
  isSavingDownloads: boolean;
};

export function EventAdminPasswordDownloadCard({
  eventSlug,
  galleryPassword,
  onGalleryPasswordChange,
  onSavePassword,
  isSavingPassword,
  passwordSaved,
  allowDownload,
  onToggleDownloads,
  isSavingDownloads,
}: EventAdminPasswordDownloadCardProps) {
  return (
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
          onChange={(event) => onGalleryPasswordChange(event.target.value)}
          placeholder="Galerie Passwort"
          className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
        />
        <button
          onClick={onSavePassword}
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

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-primary text-xl font-semibold">Downloads</h2>
          <p className="text-primary/60 text-sm">
            {allowDownload
              ? 'Besucher können Bilder herunterladen.'
              : 'Besucher können keine Bilder herunterladen.'}
          </p>
        </div>
        <StatusToggleButton
          active={allowDownload}
          onToggle={onToggleDownloads}
          activeLabel="Download Ein"
          inactiveLabel="Download Aus"
          isSaving={isSavingDownloads}
        />
      </div>
    </section>
  );
}

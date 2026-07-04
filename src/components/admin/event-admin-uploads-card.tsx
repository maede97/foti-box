import { StatusToggleButton } from '@/components/admin/status-toggle-button';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type EventAdminUploadsCardProps = {
  eventSlug: string;
  eventName: string;
  allowUserUploads: boolean;
  onToggleUploads: () => void;
  isSavingUploads: boolean;
  uploadQrCodeUrl: string;
  onDownloadQr: () => void;
  isDownloadingQr: boolean;
};

export function EventAdminUploadsCard({
  eventSlug,
  eventName,
  allowUserUploads,
  onToggleUploads,
  isSavingUploads,
  uploadQrCodeUrl,
  onDownloadQr,
  isDownloadingQr,
}: EventAdminUploadsCardProps) {
  return (
    <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-primary text-xl font-semibold">Uploads</h2>
          <p className="text-primary/60 text-sm">
            Steuern Sie, ob Bilder für diesen Event hochgeladen werden dürfen.
          </p>
        </div>
        <StatusToggleButton
          active={allowUserUploads}
          onToggle={onToggleUploads}
          activeLabel="Uploads Ein"
          inactiveLabel="Uploads Aus"
          isSaving={isSavingUploads}
          className="px-6 py-2 text-sm"
        />
      </div>
      <p className="text-primary/70 text-sm">
        Status:{' '}
        {allowUserUploads
          ? 'Benutzer-Uploads sind aktiviert.'
          : 'Benutzer-Uploads sind deaktiviert.'}
      </p>

      {allowUserUploads ? (
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
              <Image
                src={uploadQrCodeUrl}
                alt={`QR-Code für Upload von ${eventName}`}
                width={160}
                height={160}
                unoptimized
                className="rounded-lg bg-white p-2 shadow-md"
              />
            ) : (
              <div className="bg-primary/10 text-primary/60 flex h-40 w-40 items-center justify-center rounded-lg text-sm">
                QR wird erstellt...
              </div>
            )}
          </div>

          <button
            onClick={onDownloadQr}
            disabled={isDownloadingQr}
            className="bg-primary text-secondary hover:bg-accent-dark mt-4 w-full cursor-pointer rounded border px-4 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
          >
            {isDownloadingQr ? 'Wird erstellt...' : 'QR-Code hochauflösend herunterladen'}
          </button>
        </div>
      ) : null}
    </section>
  );
}

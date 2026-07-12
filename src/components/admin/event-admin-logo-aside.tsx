import { Upload } from 'lucide-react';
import Image from 'next/image';

type EventAdminLogoAsideProps = {
  eventName: string;
  eventId: string;
  logo?: string;
  onOpenUploadModal: () => void;
  onDeleteLogo: () => void;
  isDeletingLogo: boolean;
};

export function EventAdminLogoAside({
  eventName,
  eventId,
  logo,
  onOpenUploadModal,
  onDeleteLogo,
  isDeletingLogo,
}: EventAdminLogoAsideProps) {
  return (
    <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-primary text-xl font-semibold">Logo</h2>
          <p className="text-primary/60 text-sm">
            Das Logo wird auf jedem neuen Upload unten rechts eingefügt.
          </p>
        </div>
        {!logo && (
          <button
            onClick={onOpenUploadModal}
            className="bg-primary text-secondary hover:bg-accent-dark inline-flex cursor-pointer items-center gap-2 rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            <Upload className="size-4" /> Logo setzen
          </button>
        )}
      </div>

      {logo ? (
        <div className="space-y-4">
          <div className="bg-primary/5 relative h-44 overflow-hidden rounded-lg shadow-md">
            <Image
              alt={`${eventName} Logo`}
              fill
              src={`/api/admin/logo?logo=${logo}&eventId=${eventId}`}
              className="object-contain p-4"
            />
          </div>
          <button
            onClick={onDeleteLogo}
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
  );
}

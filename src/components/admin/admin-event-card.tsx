import { StatusToggleButton } from '@/components/admin/status-toggle-button';
import { environmentVariables } from '@/config/environment';
import { IEvent } from '@/models/event';
import { ExternalLink, Pencil, Plus, X } from 'lucide-react';
import { Types } from 'mongoose';
import Image from 'next/image';
import Link from 'next/link';

type ObjectId = Types.ObjectId;

type EventWithCount = IEvent & { imageCount: number };

type AdminEventCardProps = {
  event: EventWithCount;
  onOpenAddLogo: (eventId: string) => void;
  onDeleteLogo: (eventId: ObjectId) => void;
  onToggleUploads: (eventId: ObjectId, nextValue: boolean) => void;
  onToggleDownloads: (eventId: ObjectId, nextValue: boolean) => void;
  onSetActive: (eventId: ObjectId) => void;
  onLoadImages: (event: IEvent) => void;
  onEdit: (event: EventWithCount) => void;
  onDelete: (eventId: ObjectId) => void;
};

export function AdminEventCard({
  event,
  onOpenAddLogo,
  onDeleteLogo,
  onToggleUploads,
  onToggleDownloads,
  onSetActive,
  onLoadImages,
  onEdit,
  onDelete,
}: AdminEventCardProps) {
  return (
    <div className="bg-secondary border-primary/20 rounded border p-6 shadow-lg transition hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-primary text-lg font-bold">
              <Link
                href={`/event/${event.slug}`}
                target="_blank"
                className="hover:text-accent-dark inline-flex items-center gap-2 transition"
              >
                {event.name}
                <ExternalLink className="size-4" />
              </Link>
            </h3>
            {event.active && (
              <span className="bg-success text-secondary rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                Aktiv
              </span>
            )}
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-semibold">
              {event.imageCount || 0} {event.imageCount === 1 ? 'Bild' : 'Bilder'}
            </span>
          </div>
          <p className="text-primary/60 text-sm">
            Slug: <span className="text-primary/80 font-mono">{event.slug}</span>
          </p>
          <p className="text-primary/60 mt-1 text-sm">
            Passwort:{' '}
            {event.password ? (
              typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                <span
                  className="text-primary/80 cursor-pointer font-mono hover:underline"
                  onClick={() => {
                    navigator.share({
                      title: 'foti-box.com',
                      url: `${environmentVariables.NEXT_PUBLIC_APP_HOST_URL}/event/${event.slug}`,
                      text: `Sieh dir die Galerie ${event.name} an und benutze dazu das Passwort ${event.password}`,
                    });
                  }}
                >
                  {event.password} <ExternalLink className="ml-1 inline size-3" />
                </span>
              ) : (
                <span className="text-primary/80 font-mono">{event.password}</span>
              )
            ) : (
              <span className="text-primary/40 italic">Kein Passwort</span>
            )}
          </p>
          <p className="text-primary/60 mt-1 text-sm">
            Admin Passwort:{' '}
            <span className="text-primary/80 font-mono">{event.admin_password}</span>
          </p>
        </div>

        <div className="ml-4 flex-shrink-0">
          {event.logo ? (
            <div className="bg-primary/5 relative h-16 w-24 overflow-hidden rounded-lg shadow-md">
              <Image
                alt={event.logo}
                width={96}
                height={64}
                src={`/api/admin/logo?logo=${event.logo}&eventId=${event._id}`}
                className="h-full w-full object-contain"
                priority={false}
              />
              <button
                onClick={() => onDeleteLogo(event._id as unknown as ObjectId)}
                className="bg-error hover:bg-error-dark text-secondary absolute top-1 right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition focus:outline-none"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAddLogo(event._id as unknown as string)}
              className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition focus:outline-none"
            >
              <Plus className="mr-1 inline size-3" /> Logo
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="bg-primary/5 rounded p-3">
          <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Upload</p>
          <StatusToggleButton
            active={event.allow_user_uploads}
            onToggle={() =>
              onToggleUploads(event._id as unknown as ObjectId, !event.allow_user_uploads)
            }
            activeLabel="Ein"
            inactiveLabel="Aus"
            className="w-full px-3 py-2 text-xs"
          />
        </div>

        <div className="bg-primary/5 rounded p-3">
          <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Download</p>
          <StatusToggleButton
            active={event.allow_download}
            onToggle={() =>
              onToggleDownloads(event._id as unknown as ObjectId, !event.allow_download)
            }
            activeLabel="Ein"
            inactiveLabel="Aus"
            className="w-full px-3 py-2 text-xs"
          />
        </div>

        {!event.active && (
          <div className="bg-primary/5 rounded p-3 md:col-span-2">
            <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Status</p>
            <button
              onClick={() => onSetActive(event._id as unknown as ObjectId)}
              className="bg-primary text-secondary hover:bg-accent-dark w-full cursor-pointer rounded border px-3 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
            >
              Als aktiv setzen
            </button>
          </div>
        )}
      </div>

      <div className="border-primary/10 flex flex-wrap gap-2 border-t pt-4">
        <button
          className="bg-primary text-secondary hover:bg-accent-dark flex-1 cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
          onClick={() => onLoadImages(event)}
        >
          Bilder laden
        </button>
        <button
          onClick={() => onEdit(event)}
          className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
        >
          <Pencil className="mr-1 inline size-3" /> Bearbeiten
        </button>
        <button
          onClick={() => onDelete(event._id as unknown as ObjectId)}
          className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}

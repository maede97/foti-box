import { AdminEventCard } from '@/components/admin/admin-event-card';
import { IEvent } from '@/models/event';
import { Plus } from 'lucide-react';
import { Types } from 'mongoose';

type ObjectId = Types.ObjectId;
type EventWithCount = IEvent & { imageCount: number };

type AdminEventsSectionProps = {
  events: EventWithCount[];
  onOpenAddEvent: () => void;
  onOpenAddLogo: (eventId: string) => void;
  onDeleteLogo: (eventId: ObjectId) => void;
  onToggleUploads: (eventId: ObjectId, nextValue: boolean) => void;
  onToggleDownloads: (eventId: ObjectId, nextValue: boolean) => void;
  onSetActive: (eventId: ObjectId) => void;
  onLoadImages: (event: IEvent) => void;
  onEditEvent: (event: EventWithCount) => void;
  onDeleteEvent: (eventId: ObjectId) => void;
};

export function AdminEventsSection({
  events,
  onOpenAddEvent,
  onOpenAddLogo,
  onDeleteLogo,
  onToggleUploads,
  onToggleDownloads,
  onSetActive,
  onLoadImages,
  onEditEvent,
  onDeleteEvent,
}: AdminEventsSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Events</h2>
        <button
          onClick={onOpenAddEvent}
          className="bg-primary text-secondary hover:bg-accent-dark inline-flex cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
        >
          <Plus className="mr-2" /> Event hinzufügen
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-secondary text-primary/60 border-primary/20 rounded border p-8 text-center">
          Keine Events vorhanden. Erstelle einen neuen Event, um zu beginnen.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {events.map((event) => (
            <AdminEventCard
              key={event._id as unknown as string}
              event={event}
              onOpenAddLogo={onOpenAddLogo}
              onDeleteLogo={onDeleteLogo}
              onToggleUploads={onToggleUploads}
              onToggleDownloads={onToggleDownloads}
              onSetActive={onSetActive}
              onLoadImages={onLoadImages}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
            />
          ))}
        </div>
      )}
    </section>
  );
}

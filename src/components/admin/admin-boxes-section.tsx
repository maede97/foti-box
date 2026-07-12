import { AdminBoxCard } from '@/components/admin/admin-box-card';
import { IBox } from '@/models/box';
import { Plus } from 'lucide-react';
import { Types } from 'mongoose';

type ObjectId = Types.ObjectId;

type AdminBoxesSectionProps = {
  boxes: IBox[];
  onOpenAddBox: () => void;
  onToggleBoxActive: (boxId: ObjectId, active: boolean) => void;
  onDeleteBox: (boxId: ObjectId) => void;
};

export function AdminBoxesSection({
  boxes,
  onOpenAddBox,
  onToggleBoxActive,
  onDeleteBox,
}: AdminBoxesSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Boxen</h2>
        <button
          onClick={onOpenAddBox}
          className="bg-primary text-secondary hover:bg-accent-dark inline-flex cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
        >
          <Plus className="mr-2" /> Box hinzufügen
        </button>
      </div>

      {boxes.length === 0 ? (
        <div className="bg-secondary text-primary/60 border-primary/20 rounded border p-8 text-center">
          Keine Boxen vorhanden. Erstelle eine neue Box, um zu beginnen.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {boxes.map((box) => (
            <AdminBoxCard
              key={box._id as unknown as string}
              box={box}
              onToggleActive={onToggleBoxActive}
              onDelete={onDeleteBox}
            />
          ))}
        </div>
      )}
    </section>
  );
}

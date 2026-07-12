import { IBox } from '@/models/box';
import { Types } from 'mongoose';

type ObjectId = Types.ObjectId;

type AdminBoxCardProps = {
  box: IBox;
  onToggleActive: (boxId: ObjectId, active: boolean) => void;
  onDelete: (boxId: ObjectId) => void;
};

export function AdminBoxCard({ box, onToggleActive, onDelete }: AdminBoxCardProps) {
  return (
    <div className="bg-secondary border-primary/20 rounded border p-6 shadow-lg transition hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-primary mb-3 text-lg font-bold">{box.label}</h3>

          <div className="space-y-2">
            <div className="bg-primary/5 rounded p-3">
              <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Zugangstoken</p>
              <p className="text-primary/80 font-mono text-sm break-all">{box.accessToken}</p>
            </div>

            <div className="bg-primary/5 rounded p-3">
              <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Letzter Upload</p>
              <p className="text-primary/80 text-sm">
                {box.lastUpload
                  ? new Date(box.lastUpload).toLocaleString('de-CH')
                  : 'Noch kein Upload'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {box.active ? (
            <span className="bg-success text-secondary inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Aktiv
            </span>
          ) : (
            <span className="bg-error text-secondary inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Inaktiv
            </span>
          )}
        </div>
      </div>

      <div className="border-primary/10 flex flex-wrap gap-2 border-t pt-4">
        {box.active ? (
          <button
            onClick={() => onToggleActive(box._id as unknown as ObjectId, false)}
            className="bg-primary text-secondary hover:bg-accent-dark flex-1 cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            Deaktivieren
          </button>
        ) : (
          <button
            onClick={() => onToggleActive(box._id as unknown as ObjectId, true)}
            className="bg-primary text-secondary hover:bg-accent-dark flex-1 cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            Aktivieren
          </button>
        )}
        <button
          onClick={() => onDelete(box._id as unknown as ObjectId)}
          className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}

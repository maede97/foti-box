import { AdminModal } from '@/components/admin/modal';

type AdminBoxFormModalProps = {
  open: boolean;
  label: string;
  accessToken: string;
  error?: string;
  onClose: () => void;
  onLabelChange: (value: string) => void;
  onAccessTokenChange: (value: string) => void;
  onSubmit: () => void;
};

export function AdminBoxFormModal({
  open,
  label,
  accessToken,
  error,
  onClose,
  onLabelChange,
  onAccessTokenChange,
  onSubmit,
}: AdminBoxFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AdminModal title="Box hinzufügen" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Box Label</label>
          <input
            type="text"
            placeholder="Box Label"
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Zugangstoken</label>
          <input
            type="text"
            placeholder="Zugangstoken"
            value={accessToken}
            onChange={(event) => onAccessTokenChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit();
            }}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>
        {error && <p className="text-error p-2 text-center text-sm">{error}</p>}
        <button
          onClick={onSubmit}
          className="bg-primary text-secondary mt-4 w-full cursor-pointer p-3 text-sm font-semibold tracking-wide uppercase focus:outline-none"
        >
          Box hinzufügen
        </button>
      </div>
    </AdminModal>
  );
}

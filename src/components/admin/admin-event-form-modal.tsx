import { AdminModal } from '@/components/admin/modal';

type AdminEventFormModalProps = {
  open: boolean;
  title: string;
  name: string;
  slug: string;
  password: string;
  adminPassword: string;
  submitLabel: string;
  error?: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onAdminPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function AdminEventFormModal({
  open,
  title,
  name,
  slug,
  password,
  adminPassword,
  submitLabel,
  error,
  onClose,
  onNameChange,
  onSlugChange,
  onPasswordChange,
  onAdminPasswordChange,
  onSubmit,
}: AdminEventFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AdminModal title={title} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Event Name</label>
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Event Slug</label>
          <input
            type="text"
            placeholder="Event Slug"
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Passwort</label>
          <input
            type="text"
            placeholder="Passwort"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Admin Passwort</label>
          <input
            type="text"
            placeholder="Admin Passwort"
            value={adminPassword}
            onChange={(event) => onAdminPasswordChange(event.target.value)}
            required
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>
        {error && <p className="text-error p-2 text-center text-sm">{error}</p>}
        <button
          onClick={onSubmit}
          className="bg-primary text-secondary mt-4 w-full cursor-pointer p-3 text-sm font-semibold tracking-wide uppercase focus:outline-none"
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}

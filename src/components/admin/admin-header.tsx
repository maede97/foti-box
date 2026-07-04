type AdminHeaderProps = {
  title: string;
  onLogout: () => void;
};

export function AdminHeader({ title, onLogout }: AdminHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-heading mt-6 mb-4 max-w-4xl pt-8 text-3xl font-extrabold text-balance hyphens-auto">
        {title}
      </h1>
      <button
        onClick={onLogout}
        className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
      >
        Abmelden
      </button>
    </div>
  );
}

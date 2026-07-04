type StatusToggleButtonProps = {
  active: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
  isSaving?: boolean;
  savingLabel?: string;
  className?: string;
};

export function StatusToggleButton({
  active,
  onToggle,
  activeLabel,
  inactiveLabel,
  isSaving = false,
  savingLabel = 'Speichern...',
  className = 'px-4 py-2 text-xs',
}: StatusToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isSaving}
      className={`cursor-pointer rounded border font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50 ${className} ${
        active
          ? 'bg-success hover:bg-success-dark text-secondary'
          : 'bg-error hover:bg-error-dark text-secondary'
      }`}
    >
      {isSaving ? savingLabel : active ? activeLabel : inactiveLabel}
    </button>
  );
}

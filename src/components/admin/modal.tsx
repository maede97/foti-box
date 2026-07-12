import React from 'react';

type AdminModalProps = React.PropsWithChildren<{
  title: string;
  onClose: () => void;
}>;

export function AdminModal({ title, onClose, children }: AdminModalProps) {
  return (
    <div className="bg-primary/80 fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary text-primary relative w-full max-w-xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-primary mb-6 text-lg font-semibold tracking-wide uppercase">{title}</h2>
        {children}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}

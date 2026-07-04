import { motion } from 'framer-motion';

type AdminLoginPanelProps = {
  error: string;
  adminUsername: string;
  adminPassword: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
};

export function AdminLoginPanel({
  error,
  adminUsername,
  adminPassword,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: AdminLoginPanelProps) {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary mx-auto max-w-xl p-6"
      >
        <h2 className="text-primary mb-6 text-lg font-semibold tracking-wide uppercase">
          Admin Login
        </h2>
        {error && <p className="text-error p-2 text-center text-sm">{error}</p>}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Benutzername"
            autoFocus
            value={adminUsername}
            onChange={(event) => onUsernameChange(event.target.value)}
            className="bg-primary text-secondary w-full p-2 text-sm focus:outline-none"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={adminPassword}
            onChange={(event) => onPasswordChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onLogin();
              }
            }}
            className="bg-primary text-secondary w-full p-2 text-sm focus:outline-none"
          />
          <button
            onClick={onLogin}
            className="bg-primary text-secondary hover:bg-accent-dark border-secondary mt-4 w-full cursor-pointer border p-3 text-sm font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}

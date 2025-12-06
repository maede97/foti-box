import { motion } from 'framer-motion';
import { useState } from 'react';

const GalleryLogin: React.FC<{
  fetchGallery;
  error: string;
  selectedEvent: string;
}> = ({ fetchGallery, error, selectedEvent }) => {
  const [password, setPassword] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary mx-auto max-w-xl p-6"
    >
      <h2 className="text-primary mb-6 text-lg font-semibold tracking-wide uppercase">
        Anmelden, um die Galerie anzusehen
      </h2>

      {error && <p className="text-error p-2 text-center text-sm">{error}</p>}
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-primary text-xs tracking-wide uppercase">Passwort</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchGallery(selectedEvent, password);
              }
            }}
            className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
          />
        </div>

        <button
          onClick={() => fetchGallery(selectedEvent, password)}
          className="bg-primary text-secondary mt-4 w-full cursor-pointer p-3 text-sm font-semibold tracking-wide uppercase focus:outline-none"
        >
          Galerie ansehen
        </button>
      </div>
    </motion.div>
  );
};

export default GalleryLogin;

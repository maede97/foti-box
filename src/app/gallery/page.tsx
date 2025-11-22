'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Event {
  _id: string;
  name: string;
  active: boolean;
}

export default function Gallery() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/admin/events')
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setError('Failed to fetch events'));
  }, []);

  async function fetchGallery() {
    setError('');
    if (!selectedEvent || !password)
      return setError('Wähle einen Event aus und gib das Passwort ein.');

    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName: selectedEvent, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Galerie kann nicht geladen werden.');
      return;
    }

    const data = await res.json();
    setImages(data.map((img: { uuid: string }) => img.uuid));
    setLoggedIn(true);
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 p-6 text-white">
      <h1 className="mb-8 text-center text-4xl font-bold">Event Galerie</h1>

      {!loggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-xl rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl"
        >
          <h2 className="mb-4 text-xl font-semibold">Anmelden, um die Galerie anzusehen</h2>

          <div className="space-y-4">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Event auswählen</option>
              {events.map((evt) => (
                <option key={evt._id} value={evt.name}>
                  {evt.name}
                </option>
              ))}
            </select>

            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchGallery();
                }
              }}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={fetchGallery}
              className="mt-2 w-full cursor-pointer rounded-xl bg-blue-600 p-3 font-semibold shadow-lg transition hover:bg-blue-700"
            >
              Galerie ansehen
            </button>
          </div>
        </motion.div>
      )}

      {loggedIn && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          {images.length == 0 && (
            <h2 className="mb-4 text-center text-2xl font-semibold">
              Keine Fotos in dieser Galerie
            </h2>
          )}

          {error && <p className="mb-4 text-center text-red-400">{error}</p>}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((uuid, idx) => (
              <Link href={`/gallery/${uuid}`} key={uuid} target="_blank">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="overflow-hidden rounded-xl shadow-lg"
                >
                  <Image
                    key={idx}
                    src={`/api/gallery?uuid=${uuid}`}
                    alt="Photo"
                    width={300}
                    height={200}
                    className="h-40 w-full object-cover"
                  />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

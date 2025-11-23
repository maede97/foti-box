'use client';

import GalleryDisplay from '@/components/gallery/display';
import GalleryLogin from '@/components/gallery/login';
import { useState } from 'react';

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  async function fetchGallery(selectedEvent, password) {
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
    <div>
      {!loggedIn && <GalleryLogin fetchGallery={fetchGallery} error={error} />}
      {loggedIn && <GalleryDisplay images={images} />}
    </div>
  );
}

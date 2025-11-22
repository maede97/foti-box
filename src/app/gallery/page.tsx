'use client';

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

  // Fetch all events on mount
  useEffect(() => {
    fetch('/api/admin/events') // public events endpoint could be created if desired
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setError('Failed to fetch events'));
  }, []);

  async function fetchGallery() {
    setError('');
    if (!selectedEvent || !password) return setError('Select an event and enter password');

    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName: selectedEvent, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Error fetching gallery');
      return;
    }

    const data = await res.json();

    setImages(data.map((img: { uuid: string }) => img.uuid));
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gallery</h1>

      <div style={{ marginBottom: '1rem' }}>
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
          <option value="">Select Event</option>
          {events.map((evt) => (
            <option key={evt._id} value={evt.name}>
              {evt.name} {evt.active ? '(Active)' : ''}
            </option>
          ))}
        </select>
        <input
          type="password"
          placeholder="Event password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginLeft: '1rem' }}
        />
        <button onClick={fetchGallery} style={{ marginLeft: '1rem' }}>
          View Gallery
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {images.map((uuid, idx) => (
          <Link href={`/gallery/${uuid}`} key={uuid} target="_blank">
            <Image
              key={idx}
              src={`/api/gallery?uuid=${uuid}`}
              alt="Photo"
              width={200}
              style={{ borderRadius: '8px' }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

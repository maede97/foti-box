'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Image {
  uuid: string;
  url: string;
  event: string;
  createdAt: string;
}

export default function AdminPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventPassword, setEventPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<{ _id: string; name: string; active: boolean }[]>([]);

  async function fetchEvents() {
    if (!token) return;
    const res = await fetch('/api/admin/events', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }
  async function switchActiveEvent(eventId: string) {
    if (!token) return;
    const res = await fetch('/api/admin/switch-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId }),
    });
    if (res.ok) fetchEvents();
  }

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setLoggedIn(true);
    }
  }, []);

  // Fetch images whenever logged in or token changes
  useEffect(() => {
    if (loggedIn && token) {
      fetchEvents();
      fetchImages();
    }
  }, [loggedIn, token]);

  async function handleLogin() {
    setError('');
    if (!adminUsername || !adminPassword) return setError('Enter username and password');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: adminUsername,
        password: adminPassword,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login failed');
      return;
    }

    const data = await res.json();
    localStorage.setItem('adminToken', data.token); // Persist token
    setToken(data.token);
    setLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    setToken(null);
    setLoggedIn(false);
  }

  async function fetchImages() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/images', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch images');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setImages(data);
    } catch (err) {
      setError(err || 'Error fetching images');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEvent() {
    if (!eventName || !eventPassword) return setError('Provide name and password');

    const res = await fetch('/api/admin/add-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: eventName, password: eventPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to add event');
      return;
    }

    alert('Event created successfully!');
    setEventName('');
    setEventPassword('');
    fetchImages();
  }

  async function handleDelete(uuid: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const res = await fetch('/api/admin/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ uuid }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to delete image');
      return;
    }

    setImages(images.filter((img) => img.uuid !== uuid));
  }

  if (!loggedIn) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Admin Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={adminUsername}
          onChange={(e) => setAdminUsername(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Logout
      </button>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Manage Events</h2>
        {events.map((evt) => (
          <div key={evt._id} style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: evt.active ? 'bold' : 'normal' }}>{evt.name}</span>
            {!evt.active && (
              <button
                onClick={() => switchActiveEvent(evt._id)}
                style={{ marginLeft: '1rem', cursor: 'pointer' }}
              >
                Set Active
              </button>
            )}
            {evt.active && <span style={{ marginLeft: '1rem', color: 'green' }}>Active</span>}
          </div>
        ))}
      </section>

      {/* Add Event */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Create New Event</h2>
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={eventPassword}
          onChange={(e) => setEventPassword(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button onClick={handleAddEvent}>Add Event</button>
      </section>

      {/* Images */}
      <section>
        <h2>All Images</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading ? (
          <p>Loading images...</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {images.map((img) => (
              <div key={img.uuid} style={{ position: 'relative' }}>
                <Link href={`/gallery/${img.uuid}`} target="_blank">
                  <Image
                    src={`/api/gallery?uuid=${img.uuid}`}
                    alt="Photo"
                    width={200}
                    style={{ borderRadius: '8px' }}
                  />
                </Link>
                <button
                  onClick={() => handleDelete(img.uuid)}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

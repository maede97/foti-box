'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ImageType {
  uuid: string;
  url: string;
  event: string;
  createdAt: string;
}

export default function AdminPage() {
  const [images, setImages] = useState<ImageType[]>([]);
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

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setLoggedIn(true);
    }
  }, []);

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
      body: JSON.stringify({ username: adminUsername, password: adminPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login failed');
      return;
    }

    const data = await res.json();
    localStorage.setItem('adminToken', data.token);
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
    fetchEvents();
  }

  async function handleDeleteEvent(eventID: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const res = await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventID }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to delete event');
      return;
    }
    setImages(images.filter((img) => img.event !== eventID));
    setEvents(events.filter((event) => event._id !== eventID));
  }

  async function handleDeleteImage(uuid: string) {
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
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-950 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl"
        >
          <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full cursor-pointer rounded-xl bg-blue-600 p-3 font-semibold shadow-lg transition hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 font-semibold shadow-lg transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Manage Events */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Manage Events</h2>
        <div className="space-y-2">
          {events.map((evt) => (
            <div
              key={evt._id}
              className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-3"
            >
              <span className={evt.active ? 'font-bold' : ''}>{evt.name}</span>
              <div className="flex items-center gap-2">
                {!evt.active && (
                  <button
                    onClick={() => handleDeleteEvent(evt._id)}
                    className="cursor-pointer rounded-xl bg-red-600 px-3 py-1 font-semibold transition hover:bg-red-800"
                  >
                    Delete
                  </button>
                )}
                {!evt.active ? (
                  <button
                    onClick={() => switchActiveEvent(evt._id)}
                    className="cursor-pointer rounded-xl bg-blue-600 px-3 py-1 font-semibold transition hover:bg-blue-700"
                  >
                    Set Active
                  </button>
                ) : (
                  <span className="font-semibold text-green-400">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Event */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Create New Event</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="rounded-xl border border-gray-700 bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={eventPassword}
            onChange={(e) => setEventPassword(e.target.value)}
            className="rounded-xl border border-gray-700 bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddEvent}
            className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 font-semibold shadow-lg transition hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>
        {error && <p className="mt-2 text-red-400">{error}</p>}
      </section>

      {/* Images */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">All Images</h2>
        {loading ? (
          <p>Loading images...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((img) => (
              <motion.div
                key={img.uuid}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-xl border border-gray-800 shadow-lg"
              >
                <Link href={`/gallery/${img.uuid}`} target="_blank">
                  <Image
                    src={`/api/gallery?uuid=${img.uuid}`}
                    alt="Photo"
                    width={300}
                    height={200}
                    className="h-40 w-full object-cover"
                  />
                </Link>
                <button
                  onClick={() => handleDeleteImage(img.uuid)}
                  className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-600 px-2 py-1 text-sm font-bold text-white shadow-lg transition hover:bg-red-700"
                >
                  X
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

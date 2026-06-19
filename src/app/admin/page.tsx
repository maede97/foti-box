'use client';

import { environmentVariables } from '@/config/environment';
import { IBox } from '@/models/box';
import { IEvent } from '@/models/event';
import { IImage } from '@/models/image';
import { motion } from 'framer-motion';
import { ExternalLink, Pencil, Plus, X } from 'lucide-react';
import { Types } from 'mongoose';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ObjectId = Types.ObjectId;

function Modal({ title, onClose, children }) {
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

type EventWithCount = IEvent & { imageCount: number };

export default function AdminPage() {
  const [images, setImages] = useState<IImage[]>([]);
  const [imagesForEvent, setImagesForEvent] = useState<IEvent | undefined>();

  const [eventName, setEventName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventPassword, setEventPassword] = useState('');
  const [eventAdminPassword, setEventAdminPassword] = useState('');
  const [editEventId, setEditEventId] = useState('');
  const [editEventName, setEditEventName] = useState('');
  const [editEventSlug, setEditEventSlug] = useState('');
  const [editEventPassword, setEditEventPassword] = useState('');
  const [editEventAdminPassword, setEditEventAdminPassword] = useState('');

  const [boxLabel, setBoxLabel] = useState('');
  const [boxAccessToken, setBoxAccessToken] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [boxes, setBoxes] = useState<IBox[]>([]);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showAddBox, setShowAddBox] = useState(false);
  const [showAddLogo, setShowAddLogo] = useState('');

  const [selectedLogo, setSelectedLogo] = useState<File | undefined>(undefined);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);

  async function fetchEvents() {
    if (!token) return;
    const res = await fetch('/api/admin/events', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      return handleLogout();
    }

    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }

  async function switchActiveEvent(eventId: ObjectId) {
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

  async function handleAddEvent() {
    if (!eventName || !eventSlug) return setError('Name und Slug angeben.');

    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: eventName,
        slug: eventSlug,
        password: eventPassword,
        admin_password: eventAdminPassword,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Event kann nicht hinzugefügt werden.');
      return;
    }

    setEventName('');
    setEventSlug('');
    setEventPassword('');
    setEventAdminPassword('');
    fetchEvents();
    setShowAddEvent(false);
  }

  async function handleDeleteEvent(eventID: ObjectId) {
    if (!confirm('Bist du sicher, dass du diesen Event löschen willst?')) return;

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
      setError(data.error || 'Der Event konnte nicht gelöscht werden.');
      return;
    }
    setImages(images.filter((img) => (img.event as unknown as ObjectId) !== eventID));
    setEvents(events.filter((event) => (event._id as unknown as ObjectId) !== eventID));
  }

  function openEditEventModal(event: EventWithCount) {
    setError('');
    setEditEventId(event._id as unknown as string);
    setEditEventName(event.name);
    setEditEventSlug(event.slug);
    setEditEventPassword(event.password || '');
    setEditEventAdminPassword(event.admin_password);
    setShowEditEvent(true);
  }

  function closeEditEventModal() {
    setShowEditEvent(false);
    setEditEventId('');
    setEditEventName('');
    setEditEventSlug('');
    setEditEventPassword('');
    setEditEventAdminPassword('');
  }

  async function handleEditEvent() {
    if (!editEventId || !editEventName || !editEventSlug || !editEventAdminPassword)
      return setError('Name, Slug und Admin Passwort angeben.');

    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        eventID: editEventId,
        name: editEventName,
        slug: editEventSlug,
        password: editEventPassword,
        admin_password: editEventAdminPassword,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Event kann nicht aktualisiert werden.');
      return;
    }

    if (imagesForEvent && (imagesForEvent._id as unknown as string) === editEventId) {
      setImagesForEvent({
        ...imagesForEvent,
        name: editEventName,
        slug: editEventSlug,
        password: editEventPassword,
        admin_password: editEventAdminPassword,
      } as IEvent);
    }

    fetchEvents();
    closeEditEventModal();
  }
  async function handleLogin() {
    setError('');
    if (!adminUsername || !adminPassword) return setError('Gib Benutzername und Passwort ein.');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUsername, password: adminPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login fehlgeschlagen');
      return;
    }

    const data = await res.json();
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    setLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    setToken(undefined);
    setLoggedIn(false);
  }

  async function fetchImages(event: IEvent, page: number = 1) {
    setLoading(page === 1);
    setError('');
    if (page === 1) {
      setImages([]);
      setCurrentPage(1);
      setHasMore(true);
    }
    try {
      const limit = 25;
      const res = await fetch('/api/gallery', {
        headers: { Authorization: `Bearer ${token}` },
        method: 'POST',
        body: JSON.stringify({
          slug: event.slug,
          password: event.password,
          full: true,
          page,
          limit,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          return handleLogout();
        }

        const data = await res.json();
        setError(data.error || 'Bilder konnten nicht geladen werden.');
        setLoading(false);
        setIsLoadingMore(false);
        return;
      }
      const data = await res.json();
      if (page === 1) {
        setImages(data);
      } else {
        setImages((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === limit);
      setCurrentPage(page);
      setLoading(false);
      setIsLoadingMore(false);
    } catch (err) {
      setError(err.message || 'Bilder konnten nicht geladen werden.');
      setLoading(false);
      setIsLoadingMore(false);
    }
  }

  const loadMore = () => {
    if (isLoadingMore || !hasMore || !imagesForEvent) return;
    setIsLoadingMore(true);
    fetchImages(imagesForEvent, currentPage + 1);
  };

  async function fetchBoxes() {
    if (!token) return;
    const res = await fetch('/api/admin/box', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      return handleLogout();
    }
    if (res.ok) {
      const data = await res.json();
      setBoxes(data);
    }
  }

  async function handleAddBox() {
    if (!boxLabel || !boxAccessToken) return setError('Gib Label und Token ein');

    const res = await fetch('/api/admin/box', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ label: boxLabel, accessToken: boxAccessToken }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Box konnte nicht hinzugefügt werden');
      return;
    }

    setBoxLabel('');
    setBoxAccessToken('');
    fetchBoxes();
    setShowAddBox(false);
  }

  async function handleDeleteBox(boxID: ObjectId) {
    if (!confirm('Bist du sicher, dass du diese Box löschen willst?')) return;

    const res = await fetch('/api/admin/box', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boxID }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Box konnte nicht gelöscht werden.');
      return;
    }
    setBoxes(boxes.filter((box) => (box._id as unknown as ObjectId) !== boxID));
  }

  async function handleBoxActive(boxID: ObjectId, active: boolean) {
    const res = await fetch('/api/admin/box', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boxID, active }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Box konnte nicht (in)aktiv gesetzt werden.');
      return;
    }
    fetchBoxes();
  }

  async function handleSetAllowUserUpload(eventId: ObjectId, allow_user_uploads: boolean) {
    const res = await fetch('/api/admin/allow-user-uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, allow_user_uploads }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Event konnte nicht verändert werden.');
      return;
    }
    fetchEvents();
  }

  async function handleSetAllowImageDownload(eventId: ObjectId, allow_download: boolean) {
    const res = await fetch('/api/admin/allow-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, allow_download }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Event konnte nicht verändert werden.');
      return;
    }
    fetchEvents();
  }

  async function handleAddLogo() {
    const eventId = showAddLogo; // grab eventid from setState, as string

    if (!selectedLogo) {
      setError('Bitte zuerst eine Datei auswählen.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedLogo);
      formData.append('eventId', eventId);
      const res = await fetch('/api/admin/logo', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw Error(data.error || 'Upload fehlgeschlagen.');
      }

      setError('');
      setSelectedLogo(undefined);
      setLogoPreviewUrl(undefined);

      setShowAddLogo('');
      await fetchEvents();
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten.');
    }
  }

  async function handleDeleteLogo(eventId: ObjectId) {
    if (!confirm('Bist du sicher, dass du dieses Logo löschen willst?')) return;

    const res = await fetch(`/api/admin/logo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Logo konnte nicht gelöscht werden.');
      return;
    }

    await fetchEvents();
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Bitte eine gültige Bilddatei auswählen.');
      setSelectedLogo(undefined);
      setLogoPreviewUrl(undefined);
      return;
    }
    setSelectedLogo(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  async function handleDeleteImage(uuid: string) {
    if (!confirm('Bist du sicher, dass du dieses Bild löschen willst?')) return;

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
      setError(data.error || 'Bild konnte nicht gelöscht werden.');
      return;
    }

    setImages(images.filter((img) => img.uuid !== uuid));
    await fetchEvents();
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchEvents();
      fetchBoxes();
    }
  }, [loggedIn, token]);

  if (!loggedIn) {
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
              onChange={(e) => setAdminUsername(e.target.value)}
              className="bg-primary text-secondary w-full p-2 text-sm focus:outline-none"
            />
            <input
              type="password"
              placeholder="Passwort"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
              className="bg-primary text-secondary w-full p-2 text-sm focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="bg-primary text-secondary hover:bg-accent-dark border-secondary mt-4 w-full cursor-pointer border p-3 text-sm font-semibold tracking-wide uppercase transition focus:outline-none"
            >
              Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading mt-6 mb-4 max-w-4xl pt-8 text-3xl font-extrabold text-balance hyphens-auto">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
        >
          Abmelden
        </button>
      </div>

      {/* Events Section */}
      <section className="mb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Events</h2>
          <button
            onClick={() => {
              setError('');
              setShowAddEvent(true);
            }}
            className="bg-primary text-secondary hover:bg-accent-dark inline-flex cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            <Plus className="mr-2" /> Event hinzufügen
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-secondary text-primary/60 border-primary/20 rounded border p-8 text-center">
            Keine Events vorhanden. Erstelle einen neuen Event, um zu beginnen.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {events.map((evt) => (
              <div
                key={evt._id as unknown as string}
                className="bg-secondary border-primary/20 rounded border p-6 shadow-lg transition hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-primary text-lg font-bold">
                        <Link
                          href={`/event/${evt.slug}`}
                          target="_blank"
                          className="hover:text-accent-dark inline-flex items-center gap-2 transition"
                        >
                          {evt.name}
                          <ExternalLink className="size-4" />
                        </Link>
                      </h3>
                      {evt.active && (
                        <span className="bg-success text-secondary rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-semibold">
                        {evt.imageCount || 0} {evt.imageCount === 1 ? 'Bild' : 'Bilder'}
                      </span>
                    </div>
                    <p className="text-primary/60 text-sm">
                      Slug: <span className="text-primary/80 font-mono">{evt.slug}</span>
                    </p>
                    <p className="text-primary/60 mt-1 text-sm">
                      Passwort:{' '}
                      {evt.password ? (
                        typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                          <span
                            className="text-primary/80 cursor-pointer font-mono hover:underline"
                            onClick={() => {
                              navigator.share({
                                title: 'foti-box.com',
                                url: `${environmentVariables.NEXT_PUBLIC_APP_HOST_URL}/event/${evt.slug}`,
                                text: `Sieh dir die Galerie ${evt.name} an und benutze dazu das Passwort ${evt.password}`,
                              });
                            }}
                          >
                            {evt.password} <ExternalLink className="ml-1 inline size-3" />
                          </span>
                        ) : (
                          <span className="text-primary/80 font-mono">{evt.password}</span>
                        )
                      ) : (
                        <span className="text-primary/40 italic">Kein Passwort</span>
                      )}
                    </p>
                    <p className="text-primary/60 mt-1 text-sm">
                      Admin Passwort:{' '}
                      <span className="text-primary/80 font-mono">{evt.admin_password}</span>
                    </p>
                  </div>

                  {/* Logo Display */}
                  <div className="ml-4 flex-shrink-0">
                    {evt.logo ? (
                      <div className="bg-primary/5 relative h-16 w-24 overflow-hidden rounded-lg shadow-md">
                        <Image
                          alt={evt.logo}
                          width={96}
                          height={64}
                          src={`/api/admin/logo?logo=${evt.logo}&eventId=${evt._id}`}
                          className="h-full w-full object-contain"
                          priority={false}
                        />
                        <button
                          onClick={() => handleDeleteLogo(evt._id)}
                          className="bg-error hover:bg-error-dark text-secondary absolute top-1 right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition focus:outline-none"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setError('');
                          setShowAddLogo(evt._id as unknown as string);
                        }}
                        className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition focus:outline-none"
                      >
                        <Plus className="mr-1 inline size-3" /> Logo
                      </button>
                    )}
                  </div>
                </div>

                {/* Features Row */}
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="bg-primary/5 rounded p-3">
                    <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Upload</p>
                    <button
                      onClick={() => handleSetAllowUserUpload(evt._id, !evt.allow_user_uploads)}
                      className={`w-full cursor-pointer rounded border px-3 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none ${
                        evt.allow_user_uploads
                          ? 'bg-success hover:bg-success-dark text-secondary'
                          : 'bg-error hover:bg-error-dark text-secondary'
                      }`}
                    >
                      {evt.allow_user_uploads ? 'Ein' : 'Aus'}
                    </button>
                  </div>

                  <div className="bg-primary/5 rounded p-3">
                    <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Download</p>
                    <button
                      onClick={() => handleSetAllowImageDownload(evt._id, !evt.allow_download)}
                      className={`w-full cursor-pointer rounded border px-3 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none ${
                        evt.allow_download
                          ? 'bg-success hover:bg-success-dark text-secondary'
                          : 'bg-error hover:bg-error-dark text-secondary'
                      }`}
                    >
                      {evt.allow_download ? 'Ein' : 'Aus'}
                    </button>
                  </div>

                  {!evt.active && (
                    <div className="bg-primary/5 rounded p-3 md:col-span-2">
                      <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">Status</p>
                      <button
                        onClick={() => switchActiveEvent(evt._id)}
                        className="bg-primary text-secondary hover:bg-accent-dark w-full cursor-pointer rounded border px-3 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                      >
                        Als aktiv setzen
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-primary/10 flex flex-wrap gap-2 border-t pt-4">
                  <button
                    className="bg-primary text-secondary hover:bg-accent-dark flex-1 cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                    onClick={() => {
                      setImagesForEvent(evt);
                      void fetchImages(evt);
                    }}
                  >
                    Bilder laden
                  </button>
                  <button
                    onClick={() => openEditEventModal(evt)}
                    className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                  >
                    <Pencil className="mr-1 inline size-3" /> Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(evt._id)}
                    className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Boxes Section */}
      <section className="mb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Boxen</h2>
          <button
            onClick={() => {
              setError('');
              setShowAddBox(true);
            }}
            className="bg-primary text-secondary hover:bg-accent-dark inline-flex cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
          >
            <Plus className="mr-2" /> Box hinzufügen
          </button>
        </div>

        {boxes.length === 0 ? (
          <div className="bg-secondary text-primary/60 border-primary/20 rounded border p-8 text-center">
            Keine Boxen vorhanden. Erstelle eine neue Box, um zu beginnen.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {boxes.map((box) => (
              <div
                key={box._id as unknown as string}
                className="bg-secondary border-primary/20 rounded border p-6 shadow-lg transition hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-primary mb-3 text-lg font-bold">{box.label}</h3>

                    <div className="space-y-2">
                      <div className="bg-primary/5 rounded p-3">
                        <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">
                          Zugangstoken
                        </p>
                        <p className="text-primary/80 font-mono text-sm break-all">
                          {box.accessToken}
                        </p>
                      </div>

                      <div className="bg-primary/5 rounded p-3">
                        <p className="text-primary/60 mb-1 text-xs tracking-wide uppercase">
                          Letzter Upload
                        </p>
                        <p className="text-primary/80 text-sm">
                          {box.lastUpload
                            ? new Date(box.lastUpload).toLocaleString('de-CH')
                            : 'Noch kein Upload'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {box.active ? (
                      <span className="bg-success text-secondary inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                        Aktiv
                      </span>
                    ) : (
                      <span className="bg-error text-secondary inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                        Inaktiv
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-primary/10 flex flex-wrap gap-2 border-t pt-4">
                  {box.active ? (
                    <button
                      onClick={() => handleBoxActive(box._id, false)}
                      className="bg-primary text-secondary hover:bg-accent-dark flex-1 cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                    >
                      Deaktivieren
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBoxActive(box._id, true)}
                      className="bg-primary text-secondary hover:bg-accent-dark flex-1 cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                    >
                      Aktivieren
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBox(box._id)}
                    className="bg-error hover:bg-error-dark text-secondary cursor-pointer rounded border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition focus:outline-none"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Images Grid */}
      {imagesForEvent && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Bilder für den Event {imagesForEvent.name}
          </h2>
          {loading ? (
            <p>Lade Bilder...</p>
          ) : images.length === 0 ? (
            <p>Keine Bilder vorhanden.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((img) => (
                  <motion.div
                    key={img.uuid}
                    whileHover={{ scale: 1.05 }}
                    className="relative overflow-hidden rounded-xl shadow-lg"
                  >
                    <Link href={`/gallery/${img.uuid}`} target="_blank">
                      <Image
                        src={`/api/gallery?uuid=${img.uuid}`}
                        alt="foti-box.com"
                        width={300}
                        height={200}
                        className="h-40 w-full object-cover"
                      />
                    </Link>
                    <button
                      onClick={() => handleDeleteImage(img.uuid)}
                      className="bg-error hover:bg-error-dark text-secondary absolute top-4 right-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition focus:outline-none"
                    >
                      <X />
                    </button>
                  </motion.div>
                ))}
              </div>
              {hasMore || isLoadingMore ? (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="bg-primary text-secondary hover:bg-accent-dark border-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
                  >
                    {isLoadingMore ? 'Laden...' : 'Mehr laden'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      )}

      {showAddEvent && (
        <Modal title="Event hinzufügen" onClose={() => setShowAddEvent(false)}>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Event Name</label>
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Event Slug</label>
              <input
                type="text"
                placeholder="Event Slug"
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Passwort</label>
              <input
                type="text"
                placeholder="Passwort"
                value={eventPassword}
                onChange={(e) => setEventPassword(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Passwort</label>
              <input
                type="text"
                placeholder="Admin Passwort"
                value={eventAdminPassword}
                onChange={(e) => setEventAdminPassword(e.target.value)}
                required
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            {error && <p className="text-error p-2 text-center text-sm">{error}</p>}
            <button
              onClick={handleAddEvent}
              className="bg-primary text-secondary mt-4 w-full cursor-pointer p-3 text-sm font-semibold tracking-wide uppercase focus:outline-none"
            >
              Event hinzufügen
            </button>
          </div>
        </Modal>
      )}

      {showEditEvent && (
        <Modal title="Event bearbeiten" onClose={closeEditEventModal}>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Event Name</label>
              <input
                type="text"
                placeholder="Event Name"
                value={editEventName}
                onChange={(e) => setEditEventName(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Event Slug</label>
              <input
                type="text"
                placeholder="Event Slug"
                value={editEventSlug}
                onChange={(e) => setEditEventSlug(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Passwort</label>
              <input
                type="text"
                placeholder="Passwort"
                value={editEventPassword}
                onChange={(e) => setEditEventPassword(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Admin Passwort</label>
              <input
                type="text"
                placeholder="Admin Passwort"
                value={editEventAdminPassword}
                onChange={(e) => setEditEventAdminPassword(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            {error && <p className="text-error p-2 text-center text-sm">{error}</p>}
            <button
              onClick={handleEditEvent}
              className="bg-primary text-secondary mt-4 w-full cursor-pointer p-3 text-sm font-semibold tracking-wide uppercase focus:outline-none"
            >
              Event speichern
            </button>
          </div>
        </Modal>
      )}

      {showAddBox && (
        <Modal title="Box hinzufügen" onClose={() => setShowAddBox(false)}>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Box Label</label>
              <input
                type="text"
                placeholder="Box Label"
                value={boxLabel}
                onChange={(e) => setBoxLabel(e.target.value)}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Zugangstoken</label>
              <input
                type="text"
                placeholder="Zugangstoken"
                value={boxAccessToken}
                onChange={(e) => setBoxAccessToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddBox();
                }}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />
            </div>
            {error && <p className="text-error p-2 text-center text-sm">{error}</p>}
            <button
              onClick={handleAddBox}
              className="bg-primary text-secondary mt-4 w-full cursor-pointer p-3 text-sm font-semibold tracking-wide uppercase focus:outline-none"
            >
              Box hinzufügen
            </button>
          </div>
        </Modal>
      )}

      {showAddLogo && (
        <Modal title="Logo setzen" onClose={() => setShowAddLogo('')}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-primary text-xs tracking-wide uppercase">Bild auswählen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="bg-primary text-secondary w-full border p-2 text-sm focus:outline-none"
              />

              {logoPreviewUrl && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt="Vorschau"
                    width={100}
                    className="border-accent max-h-60 w-full rounded border object-contain"
                  />
                </div>
              )}
            </div>
            {error && <p className="text-error">{error}</p>}
            {selectedLogo && (
              <button
                onClick={handleAddLogo}
                className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none"
              >
                Logo setzen
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

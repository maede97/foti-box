import { IEvent } from '@/models/event';
import { useCallback, useRef, useState } from 'react';

type EventWithCount = IEvent & { imageCount: number };

type UseAdminEventsOptions = {
  token?: string;
  onUnauthorized: () => void;
  setError: (message: string) => void;
};

export function useAdminEvents({ token, onUnauthorized, setError }: UseAdminEventsOptions) {
  const [events, setEvents] = useState<EventWithCount[]>([]);

  const [eventName, setEventName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventPassword, setEventPassword] = useState('');
  const [eventAdminPassword, setEventAdminPassword] = useState('');

  const [editEventId, setEditEventId] = useState('');
  const [editEventName, setEditEventName] = useState('');
  const [editEventSlug, setEditEventSlug] = useState('');
  const [editEventPassword, setEditEventPassword] = useState('');
  const [editEventAdminPassword, setEditEventAdminPassword] = useState('');

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showAddLogo, setShowAddLogo] = useState('');

  const selectedEventRef = useRef<IEvent | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | undefined>(undefined);

  const fetchEvents = useCallback(async () => {
    if (!token) return;

    const res = await fetch('/api/admin/events', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }, [onUnauthorized, token]);

  async function switchActiveEvent(eventId: unknown) {
    if (!token) return;

    const res = await fetch('/api/admin/switch-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId }),
    });

    if (res.ok) {
      await fetchEvents();
    }
  }

  async function addEvent() {
    if (!eventName || !eventSlug) {
      setError('Name und Slug angeben.');
      return;
    }

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
    setShowAddEvent(false);
    await fetchEvents();
  }

  async function deleteEvent(eventID: unknown) {
    if (!confirm('Bist du sicher, dass du diesen Event löschen willst?')) return false;

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
      return false;
    }

    setEvents((prev) => prev.filter((event) => event._id !== eventID));

    if (selectedEventRef.current && selectedEventRef.current._id === eventID) {
      setSelectedEvent(undefined);
      selectedEventRef.current = undefined;
    }

    return true;
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

  async function editEvent() {
    if (!editEventId || !editEventName || !editEventSlug || !editEventAdminPassword) {
      setError('Name, Slug und Admin Passwort angeben.');
      return;
    }

    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

    if (selectedEventRef.current && String(selectedEventRef.current._id) === editEventId) {
      const updatedEvent = {
        ...selectedEventRef.current,
        name: editEventName,
        slug: editEventSlug,
        password: editEventPassword,
        admin_password: editEventAdminPassword,
      } as IEvent;
      selectedEventRef.current = updatedEvent;
      setSelectedEvent(updatedEvent);
    }

    closeEditEventModal();
    await fetchEvents();
  }

  async function setAllowUserUpload(eventId: unknown, allow_user_uploads: boolean) {
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

    await fetchEvents();
  }

  async function setAllowImageDownload(eventId: unknown, allow_download: boolean) {
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

    await fetchEvents();
  }

  async function addLogo(selectedLogo: File) {
    if (!showAddLogo) {
      return false;
    }

    const formData = new FormData();
    formData.append('file', selectedLogo);
    formData.append('eventId', showAddLogo);

    const res = await fetch('/api/admin/logo', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Upload fehlgeschlagen.');
      return false;
    }

    setShowAddLogo('');
    await fetchEvents();
    return true;
  }

  async function deleteLogo(eventId: unknown) {
    if (!confirm('Bist du sicher, dass du dieses Logo löschen willst?')) return;

    const res = await fetch('/api/admin/logo', {
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

  function selectEventForImages(event: IEvent) {
    setSelectedEvent(event);
    selectedEventRef.current = event;
  }

  function clearSelectedEvent() {
    setSelectedEvent(undefined);
    selectedEventRef.current = undefined;
  }

  function openAddLogoModal(eventId: string) {
    setError('');
    setShowAddLogo(eventId);
  }

  function closeAddLogoModal() {
    setShowAddLogo('');
  }

  return {
    events,
    fetchEvents,
    switchActiveEvent,
    addEvent,
    deleteEvent,
    openEditEventModal,
    closeEditEventModal,
    editEvent,
    setAllowUserUpload,
    setAllowImageDownload,
    addLogo,
    deleteLogo,
    showAddLogo,
    openAddLogoModal,
    closeAddLogoModal,
    showAddEvent,
    setShowAddEvent,
    showEditEvent,
    eventName,
    setEventName,
    eventSlug,
    setEventSlug,
    eventPassword,
    setEventPassword,
    eventAdminPassword,
    setEventAdminPassword,
    editEventName,
    setEditEventName,
    editEventSlug,
    setEditEventSlug,
    editEventPassword,
    setEditEventPassword,
    editEventAdminPassword,
    setEditEventAdminPassword,
    selectedEvent,
    selectedEventRef,
    selectEventForImages,
    clearSelectedEvent,
  };
}

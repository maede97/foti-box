'use client';
import GalleryDisplay from '@/components/gallery/display';
import { fetchGallery } from '@/components/gallery/fetch';
import GalleryLogin from '@/components/gallery/login';
import React, { useEffect, useState } from 'react';

const EventPageClient: React.FC<{
  eventName: string;
  eventSlug: string;
  doesNotRequirePassword: boolean;
}> = ({ eventName, eventSlug, doesNotRequirePassword }) => {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(doesNotRequirePassword);

  useEffect(() => {
    if (doesNotRequirePassword) {
      void fetchGallery(eventSlug, '', setError, setImages, setLoggedIn);
    }
  }, [doesNotRequirePassword, eventSlug]);

  useEffect(() => {
    const savedPassword = localStorage.getItem(`event-${eventSlug}`);
    if (savedPassword) {
      void fetchGallery(eventSlug, savedPassword, setError, setImages, setLoggedIn);
    }
  }, [eventSlug]);

  return (
    <div className="m-6">
      {!loggedIn && (
        <GalleryLogin
          fetchGallery={(selectedEvents, passwords) =>
            fetchGallery(selectedEvents, passwords, setError, setImages, setLoggedIn)
          }
          error={error}
          selectedEvent={eventSlug}
        />
      )}
      {loggedIn && <GalleryDisplay images={images} title={eventName} />}{' '}
    </div>
  );
};

export default EventPageClient;

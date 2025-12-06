'use client';
import GalleryDisplay from '@/components/gallery/display';
import { fetchGallery } from '@/components/gallery/fetch';
import GalleryLogin from '@/components/gallery/login';
import { LoadingSpinner } from '@/components/ui/loading';
import React, { useEffect, useState } from 'react';

export const EventPageClient: React.FC<{ eventName: string; eventSlug: string }> = ({
  eventName,
  eventSlug,
}) => {
  const [hydrated, setHydrated] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="absolute flex size-full items-center justify-center">
        <LoadingSpinner color={'secondary'} />
      </div>
    );
  }

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

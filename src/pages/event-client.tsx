'use client';
import GalleryDisplay from '@/components/gallery/display';
import { fetchGallery, fetchGalleryPage } from '@/components/gallery/fetch';
import GalleryLogin from '@/components/gallery/login';
import React, { useCallback, useEffect, useState } from 'react';

const EventPageClient: React.FC<{
  eventName: string;
  eventSlug: string;
  doesNotRequirePassword: boolean;
}> = ({ eventName, eventSlug, doesNotRequirePassword }) => {
  const [images, setImages] = useState<{ uuid: string; aspectRatio?: number }[]>([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(doesNotRequirePassword);
  const [currentPassword, setCurrentPassword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(15);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = Math.floor(images.length / 15) + 1;
      const newImages = await fetchGalleryPage(eventSlug, currentPassword, nextPage, 15);
      setImages((prev) => [...prev, ...newImages]);
      setDisplayedCount((prev) => prev + newImages.length);
      if (newImages.length < 15) setHasMore(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, images.length, eventSlug, currentPassword, setImages, setError]);

  useEffect(() => {
    if (loggedIn && images.length > 0) {
      if (images.length < 15) {
        setHasMore(false);
      }
      setDisplayedCount((prev) => Math.min(prev, images.length));
    }
  }, [images, loggedIn]);

  useEffect(() => {
    if (doesNotRequirePassword) {
      setCurrentPassword('');
      void fetchGallery(eventSlug, '', setError, setImages, setLoggedIn);
    }
  }, [doesNotRequirePassword, eventSlug]);

  useEffect(() => {
    const savedPassword = localStorage.getItem(`event-${eventSlug}`);
    if (savedPassword) {
      setCurrentPassword(savedPassword);
      void fetchGallery(eventSlug, savedPassword, setError, setImages, setLoggedIn);
    }
  }, [eventSlug]);

  return (
    <div className="m-6">
      {!loggedIn && (
        <GalleryLogin
          fetchGallery={(selectedEvents, passwords) => {
            setCurrentPassword(passwords);
            fetchGallery(selectedEvents, passwords, setError, setImages, setLoggedIn);
          }}
          error={error}
          selectedEvent={eventSlug}
        />
      )}
      {loggedIn && (
        <GalleryDisplay
          images={images}
          title={eventName}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          displayedCount={displayedCount}
          setDisplayedCount={setDisplayedCount}
        />
      )}{' '}
    </div>
  );
};

export default EventPageClient;

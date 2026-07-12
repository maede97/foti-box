import { fetchGalleryAdmin } from '@/components/gallery/fetch';
import { useCallback, useEffect, useState } from 'react';

export type EventAdminData = {
  _id: string;
  name: string;
  slug: string;
  password: string;
  allow_user_uploads: boolean;
  allow_download: boolean;
  logo?: string;
};

type UseEventAdminAuthOptions = {
  eventSlug: string;
  onError: (message: string) => void;
};

export function useEventAdminAuth({ eventSlug, onError }: UseEventAdminAuthOptions) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [adminData, setAdminData] = useState<EventAdminData | null>(null);

  useEffect(() => {
    const savedPassword = sessionStorage.getItem(`event-admin-${eventSlug}`);
    if (savedPassword) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPassword(savedPassword);
      void fetchGalleryAdmin(eventSlug, savedPassword, onError, setAdminData, setLoggedIn);
    }
  }, [eventSlug, onError]);

  const login = useCallback(
    (selectedEvent: string, password: string) => {
      setCurrentPassword(password);
      void fetchGalleryAdmin(selectedEvent, password, onError, setAdminData, setLoggedIn);
    },
    [onError],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(`event-admin-${eventSlug}`);
    setLoggedIn(false);
    setCurrentPassword('');
    setAdminData(null);
  }, [eventSlug]);

  return {
    loggedIn,
    currentPassword,
    adminData,
    setAdminData,
    login,
    logout,
  };
}

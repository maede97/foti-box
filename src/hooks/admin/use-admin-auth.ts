import { useCallback, useEffect, useState } from 'react';

type UseAdminAuthOptions = {
  onError: (message: string) => void;
};

export function useAdminAuth({ onError }: UseAdminAuthOptions) {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loggedIn, setLoggedIn] = useState(false);

  const login = useCallback(async () => {
    onError('');

    if (!adminUsername || !adminPassword) {
      onError('Gib Benutzername und Passwort ein.');
      return false;
    }

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUsername, password: adminPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      onError(data.error || 'Login fehlgeschlagen');
      return false;
    }

    const data = await res.json();
    sessionStorage.setItem('adminToken', data.token);
    setToken(data.token);
    setLoggedIn(true);
    return true;
  }, [adminPassword, adminUsername, onError]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setToken(undefined);
    setLoggedIn(false);
  }, []);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    if (savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken);
      setLoggedIn(true);
    }
  }, []);

  return {
    adminUsername,
    setAdminUsername,
    adminPassword,
    setAdminPassword,
    token,
    loggedIn,
    login,
    logout,
  };
}

import { IBox } from '@/models/box';
import { useCallback, useState } from 'react';

type UseAdminBoxesOptions = {
  token?: string;
  onUnauthorized: () => void;
  setError: (message: string) => void;
};

export function useAdminBoxes({ token, onUnauthorized, setError }: UseAdminBoxesOptions) {
  const [boxes, setBoxes] = useState<IBox[]>([]);
  const [boxLabel, setBoxLabel] = useState('');
  const [boxAccessToken, setBoxAccessToken] = useState('');
  const [showAddBox, setShowAddBox] = useState(false);

  const fetchBoxes = useCallback(async () => {
    if (!token) return;

    const res = await fetch('/api/admin/box', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      onUnauthorized();
      return;
    }

    if (res.ok) {
      const data = await res.json();
      setBoxes(data);
    }
  }, [onUnauthorized, token]);

  async function addBox() {
    if (!boxLabel || !boxAccessToken) {
      setError('Gib Label und Token ein');
      return;
    }

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
    setShowAddBox(false);
    await fetchBoxes();
  }

  async function deleteBox(boxID: unknown) {
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

    setBoxes((prev) => prev.filter((box) => box._id !== boxID));
  }

  async function setBoxActive(boxID: unknown, active: boolean) {
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

    await fetchBoxes();
  }

  return {
    boxes,
    fetchBoxes,
    addBox,
    deleteBox,
    setBoxActive,
    boxLabel,
    setBoxLabel,
    boxAccessToken,
    setBoxAccessToken,
    showAddBox,
    setShowAddBox,
  };
}

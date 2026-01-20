export async function fetchGallery(eventSlug, password, setError, setImages, setLoggedIn) {
  setError('');
  if (!eventSlug) return setError('Kein Event ausgewählt.');

  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: eventSlug, password: password }),
  });

  if (!res.ok) {
    const data = await res.json();
    setError(data.error || 'Galerie kann nicht geladen werden.');
    return;
  }

  localStorage.setItem(`event-${eventSlug}`, password);

  const data = await res.json();
  setImages(data);
  setLoggedIn(true);
}

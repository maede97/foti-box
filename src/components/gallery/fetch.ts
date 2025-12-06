export async function fetchGallery(eventSlug, password, setError, setImages, setLoggedIn) {
  setError('');
  if (!eventSlug || !password) return setError('Wähle einen Event aus und gib das Passwort ein.');

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

  const data = await res.json();
  setImages(data.map((img: { uuid: string }) => img.uuid));
  setLoggedIn(true);
}

export async function fetchGalleryPage(
  eventSlug: string,
  password: string,
  page: number = 1,
  limit: number = 15,
): Promise<{ uuid: string; aspectRatio?: number }[]> {
  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: eventSlug, password: password, page: page, limit: limit }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Galerie kann nicht geladen werden.');
  }

  const data = await res.json();
  return data;
}

export async function fetchGallery(eventSlug, password, setError, setImages, setLoggedIn) {
  setError('');
  if (!eventSlug) return setError('Kein Event ausgewählt.');

  try {
    const images = await fetchGalleryPage(eventSlug, password, 1, 15);
    localStorage.setItem(`event-${eventSlug}`, password);
    setImages(images);
    setLoggedIn(true);
  } catch (error) {
    setError(error.message);
  }
}

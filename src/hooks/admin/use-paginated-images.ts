import { useCallback, useState } from 'react';

type UsePaginatedImagesOptions<TImage> = {
  limit?: number;
  loadPage: (page: number, limit: number) => Promise<TImage[]>;
  onError?: (message: string) => void;
};

export function usePaginatedImages<TImage extends { uuid: string }>({
  limit = 25,
  loadPage,
  onError,
}: UsePaginatedImagesOptions<TImage>) {
  const [images, setImages] = useState<TImage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (page: number) => {
      if (page === 1) {
        setLoading(true);
        setImages([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const data = await loadPage(page, limit);
        setImages((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
        setCurrentPage(page);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Bilder konnten nicht geladen werden.';
        if (onError) {
          onError(message);
        }
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [limit, loadPage, onError],
  );

  const loadInitial = useCallback(() => {
    void fetchPage(1);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) {
      return;
    }
    void fetchPage(currentPage + 1);
  }, [currentPage, fetchPage, hasMore, isLoadingMore]);

  const removeImageByUuid = useCallback((uuid: string) => {
    setImages((prev) => prev.filter((image) => image.uuid !== uuid));
  }, []);

  const resetImages = useCallback(() => {
    setImages([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoading(false);
    setIsLoadingMore(false);
  }, []);

  return {
    images,
    loading,
    isLoadingMore,
    hasMore,
    loadInitial,
    loadMore,
    fetchPage,
    removeImageByUuid,
    resetImages,
    setImages,
  };
}

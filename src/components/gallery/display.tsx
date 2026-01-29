import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import Footer from '../ui/footer';

const GalleryDisplay: React.FC<{
  images: { uuid: string; aspectRatio?: number }[];
  title: string;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  displayedCount: number;
  setDisplayedCount: React.Dispatch<React.SetStateAction<number>>;
}> = ({ images, title, onLoadMore, hasMore, isLoadingMore, displayedCount, setDisplayedCount }) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const openGallery = useCallback((index: number) => setCurrentIndex(index), []);
  const closeGallery = useCallback(() => setCurrentIndex(null), []);

  const handleImageLoadComplete = useCallback((uuid: string) => {
    setLoadedImages((prev) => new Set(prev).add(uuid));
  }, []);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev! - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev! + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') prevImage();
      if (event.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeGallery, prevImage, nextImage]);

  return (
    <div className="flex min-h-screen flex-col p-6">
      <main className="flex-1">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
          <h1 className="text-secondary mb-6 text-center text-2xl font-semibold tracking-wide uppercase">
            {title || 'Galerie'}
          </h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {images.slice(0, displayedCount).map((image, index) => (
              <div
                key={image.uuid}
                className="relative flex cursor-pointer items-center justify-center overflow-hidden bg-neutral-100"
                style={{ aspectRatio: 16 / 9 }}
                onClick={() => openGallery(index)}
              >
                <Image
                  src={`/api/gallery?uuid=${image.uuid}`}
                  alt="Photo"
                  width={
                    (image.aspectRatio || 16 / 9) > 16 / 9
                      ? Math.round(225 * (image.aspectRatio || 16 / 9))
                      : 400
                  }
                  height={
                    (image.aspectRatio || 16 / 9) > 16 / 9
                      ? 225
                      : Math.round(400 / (image.aspectRatio || 16 / 9))
                  }
                  className={`bg-primary object-contain ${
                    !loadedImages.has(image.uuid) ? 'bg-secondary blur-sm' : ''
                  }`}
                  onLoad={() => handleImageLoadComplete(image.uuid)}
                />
              </div>
            ))}
          </div>

          {(displayedCount < images.length || hasMore) && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  if (displayedCount >= images.length && hasMore) {
                    onLoadMore();
                  } else {
                    setDisplayedCount((prev) => Math.min(prev + 15, images.length));
                  }
                }}
                disabled={isLoadingMore}
                className="bg-primary text-secondary hover:bg-accent border-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase disabled:opacity-50"
              >
                {isLoadingMore ? 'Laden...' : 'Mehr laden'}
              </button>
            </div>
          )}

          <AnimatePresence custom={direction}>
            {currentIndex !== null && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  className="text-primary bg-secondary hover:bg-accent absolute top-4 right-4 z-100 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl"
                  onClick={closeGallery}
                >
                  <X />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      className="text-primary bg-secondary hover:bg-accent absolute left-4 z-100 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl"
                      onClick={prevImage}
                    >
                      <ChevronLeft />
                    </button>

                    <button
                      className="text-primary bg-secondary hover:bg-accent absolute right-4 z-100 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl"
                      onClick={nextImage}
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}

                <div
                  className="bg-primary/80 fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                  onClick={closeGallery}
                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
                    key={images[currentIndex].uuid}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? 300 : -300,
                        opacity: 0,
                      }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir: number) => ({
                        x: dir < 0 ? 300 : -300,
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.3 }}
                    className="relative flex h-full max-h-[90%] w-full max-w-[90%] items-center justify-center"
                  >
                    <div className="relative">
                      <Image
                        src={`/api/gallery?uuid=${images[currentIndex].uuid}`}
                        alt="Photo"
                        width={800}
                        height={Math.round(800 / (images[currentIndex].aspectRatio || 16 / 9))}
                        className="object-contain"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryDisplay;

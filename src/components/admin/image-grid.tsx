import { IImage } from '@/models/image';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type AdminImageGridProps = {
  images: IImage[];
  loading: boolean;
  emptyMessage: string;
  onDeleteImage: (uuid: string) => void;
  deleteInProgressUuid?: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  gridClassName?: string;
};

export function AdminImageGrid({
  images,
  loading,
  emptyMessage,
  onDeleteImage,
  deleteInProgressUuid,
  hasMore,
  isLoadingMore,
  onLoadMore,
  gridClassName = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
}: AdminImageGridProps) {
  if (loading) {
    return <p>Lade Bilder...</p>;
  }

  if (images.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <>
      <div className={gridClassName}>
        {images.map((img) => (
          <motion.div
            key={img.uuid}
            whileHover={{ scale: 1.05 }}
            className="bg-primary/5 relative overflow-hidden rounded-xl shadow-lg"
          >
            <Link href={`/gallery/${img.uuid}`} target="_blank" className="block">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={`/api/gallery?uuid=${img.uuid}`}
                  alt="foti-box.com"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain"
                />
              </div>
            </Link>
            <button
              onClick={() => onDeleteImage(img.uuid)}
              disabled={deleteInProgressUuid === img.uuid}
              className="bg-error hover:bg-error-dark text-secondary absolute top-4 right-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition focus:outline-none disabled:opacity-50"
            >
              <X />
            </button>
          </motion.div>
        ))}
      </div>

      {(hasMore || isLoadingMore) && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="bg-primary text-secondary hover:bg-accent-dark border-secondary cursor-pointer rounded border px-6 py-2 font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
          >
            {isLoadingMore ? 'Laden...' : 'Mehr laden'}
          </button>
        </div>
      )}
    </>
  );
}

import { AdminImageGrid } from '@/components/admin/image-grid';
import { IImage } from '@/models/image';

type EventAdminImagesSectionProps = {
  imageCount: number;
  loadingImages: boolean;
  onLoadImages: () => void;
  images: IImage[];
  onDeleteImage: (uuid: string) => void;
  deleteInProgressUuid: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
};

export function EventAdminImagesSection({
  imageCount,
  loadingImages,
  onLoadImages,
  images,
  onDeleteImage,
  deleteInProgressUuid,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: EventAdminImagesSectionProps) {
  return (
    <section className="bg-secondary border-primary/20 rounded border p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-primary text-xl font-semibold">Bilder verwalten</h2>
          <p className="text-primary/60 text-sm">
            Hier kannst du Bilder löschen. Insgesamt {imageCount === 1 ? 'ist' : 'sind'}{' '}
            {imageCount} {imageCount === 1 ? 'Bild' : 'Bilder'} vorhanden.
          </p>
        </div>
        <button
          onClick={onLoadImages}
          disabled={loadingImages}
          className="bg-primary text-secondary hover:bg-accent-dark cursor-pointer rounded border px-6 py-2 text-sm font-semibold tracking-wide uppercase transition focus:outline-none disabled:opacity-50"
        >
          {loadingImages ? 'Laden...' : 'Bilder laden'}
        </button>
      </div>

      <AdminImageGrid
        images={images}
        loading={loadingImages}
        emptyMessage='Drücke auf "Bilder laden", um die Bilder anzuzeigen.'
        onDeleteImage={onDeleteImage}
        deleteInProgressUuid={deleteInProgressUuid}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
        gridClassName="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
      />
    </section>
  );
}

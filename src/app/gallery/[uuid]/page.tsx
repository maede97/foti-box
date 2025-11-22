'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const GalleryPage: React.FC<{ params: { uuid: string } }> = async ({ params }) => {
  const { uuid } = await params;
  if (!uuid) throw Error('uuid undefined');

  return (
    <div className="min-h-screen w-full bg-gray-950 p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <div className="relative mx-auto h-[500px] w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
          <Image
            src={`/api/gallery?uuid=${uuid}`}
            alt="Photo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
};

export default GalleryPage;

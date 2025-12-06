'use client';
import { LoadingSpinner } from '@/components/ui/loading';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export const GallerySingleImageClient: React.FC<{ uuid: string }> = ({ uuid }) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="absolute flex size-full items-center justify-center">
        <LoadingSpinner color={'secondary'} />
      </div>
    );
  }

  return (
    <div className="m-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Image
          src={`/api/gallery?uuid=${uuid}`}
          alt="Photo"
          fill
          className="bg-primary object-contain"
        />
      </motion.div>
    </div>
  );
};

'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const GallerySingleImageClient: React.FC<{ uuid: string }> = ({ uuid }) => {
  return (
    <div className="m-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[80vh] w-full"
      >
        <Image
          src={`/api/gallery?uuid=${uuid}`}
          alt="foti-box.com"
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          className="bg-primary object-contain"
          priority
        />
      </motion.div>
    </div>
  );
};

export default GallerySingleImageClient;

import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import ErrorPage from '@/pages/error';
import ImageUploadClient from '@/pages/upload-page-client';
import React from 'react';

export const generateMetadata = async () => {
  return {
    title: 'Hochladen | foti-box.com',
    description: 'Lade deine Bilder in die foti-box.com Galerie hoch.',
  };
};

interface ParamsType {
  slug: string;
}

const ImageUpload: React.FC = async ({ params }: { params: ParamsType }) => {
  await connectToDatabase();

  const { slug } = await params;

  const event = await Event.findOne({ slug: slug });


  if (!event || !event.allow_user_uploads) {
    return <ErrorPage message={'Uploads sind derzeit nicht möglich.'} />;
  }

  return <ImageUploadClient eventSlug={slug} />;
};

export default ImageUpload;

export const dynamic = 'force-dynamic';

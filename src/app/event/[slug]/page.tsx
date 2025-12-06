import { EventPageClient } from '@/app/pages/event-client';
import { connectToDatabase } from '@/lib/mongodb';
import event from '@/models/event';
import { notFound } from 'next/navigation';
import React from 'react';

interface ParamsType {
  slug: string;
}

export const generateMetadata = async ({ params }: { params: ParamsType }) => {
  await connectToDatabase();

  const { slug } = await params;
  const dbEvent = await event.findOne({ slug: slug });
  if (!dbEvent) {
    return {};
  }
  const { name } = dbEvent;

  return {
    title: `${name} | foti-box.com`,
    description: `foti-box.com Galerie für ${name}`,
  };
};

const EventPage: React.FC<{ params: ParamsType }> = async ({ params }) => {
  await connectToDatabase();

  const { slug } = await params;

  const dbEvent = await event.findOne({ slug: slug });

  if (!dbEvent) {
    notFound();
  }

  return <EventPageClient eventName={dbEvent.name} />;
};

export default EventPage;

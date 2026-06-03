import { environmentVariables } from '@/config/environment';
import { requireAdmin } from '@/lib/adminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import Image from '@/models/image';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { deleteImage } from '../delete-image/route';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const events = await Event.find({}).sort({ createdAt: -1 });

  // Count images for each event
  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const imageCount = await Image.countDocuments({ event: event._id });
      return {
        ...event.toObject(),
        imageCount,
      };
    }),
  );

  return NextResponse.json(eventsWithCounts);
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const { eventID } = await req.json();

  const images = await Image.find({ event: eventID });

  await Promise.all(
    images.map(async (img) => {
      try {
        await deleteImage(img.uuid);
      } catch (err) {
        console.error(`Bild konnte nicht gelöscht werden ${img.uuid}:`, err);
      }
    }),
  );

  // delete event
  await Event.findByIdAndDelete(eventID);

  // delete upload folder
  const eventDir = path.join(environmentVariables.UPLOAD_FOLDER, eventID);
  await fs.rm(eventDir, { recursive: true, force: true });

  return NextResponse.json({ status: 'ok' });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const { name, slug, password } = await req.json();
  if (!name || !slug)
    return NextResponse.json({ error: 'Fehlender Name oder Slug' }, { status: 400 });

  const event = new Event({
    name,
    slug,
    password: password,
    allow_user_uploads: false,
    active: false,
  });
  await event.save();

  return NextResponse.json({ message: 'Event erstellt', event });
}

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const { eventID, name, slug, password } = await req.json();

  if (!eventID || !name || !slug)
    return NextResponse.json({ error: 'Fehlender Event, Name oder Slug' }, { status: 400 });

  const slugAlreadyUsed = await Event.findOne({ slug, _id: { $ne: eventID } });
  if (slugAlreadyUsed)
    return NextResponse.json({ error: 'Slug wird bereits verwendet' }, { status: 400 });

  const event = await Event.findByIdAndUpdate(
    eventID,
    {
      $set: {
        name,
        slug,
        password: password || '',
      },
    },
    { new: true },
  );

  if (!event) return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 });

  return NextResponse.json({ message: 'Event aktualisiert', event });
}

export const dynamic = 'force-dynamic';

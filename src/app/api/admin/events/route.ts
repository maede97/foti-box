import { requireAdmin } from '@/lib/adminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import Image from '@/models/image';
import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '../delete-image/route';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await Event.find({}).sort({ createdAt: -1 });
  return NextResponse.json(events);
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { eventID } = await req.json();

  // check if event is active
  const event = await Event.findById(eventID);
  if (event.active) {
    return NextResponse.json({ error: 'Event is active' }, { status: 404 });
  }

  const images = await Image.find({ event: eventID });

  await Promise.all(
    images.map(async (img) => {
      try {
        await deleteImage(img.uuid);
      } catch (err) {
        console.error(`Failed to delete image ${img.uuid}:`, err);
      }
    }),
  );

  // delete event
  await Event.findByIdAndDelete(eventID);

  return NextResponse.json({ status: 'ok' });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, password } = await req.json();
  if (!name || !password)
    return NextResponse.json({ error: 'Missing name or password' }, { status: 400 });

  const event = new Event({ name, password, allow_user_uploads: false, active: false });
  await event.save();

  return NextResponse.json({ message: 'Event created', event });
}

export const dynamic = 'force-dynamic';

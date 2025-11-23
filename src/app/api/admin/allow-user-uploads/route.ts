import { requireAdmin } from '@/lib/adminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { eventId, allow_user_uploads } = await req.json();
  if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

  const event = await Event.findByIdAndUpdate(
    eventId,
    { allow_user_uploads: allow_user_uploads },
    { new: true },
  );
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  return NextResponse.json({
    message: `Event "${event.name}" does now ${allow_user_uploads ? '' : 'not '}allow uploads`,
    event,
  });
}

export const dynamic = 'force-dynamic';

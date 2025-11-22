import { requireAdmin } from '@/lib/adminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, password } = await req.json();
  if (!name || !password)
    return NextResponse.json({ error: 'Missing name or password' }, { status: 400 });

  await Event.updateMany({}, { active: false }); // Only one active event
  const event = new Event({ name, password, active: true });
  await event.save();

  return NextResponse.json({ message: 'Event created', event });
}

export const dynamic = 'force-dynamic';

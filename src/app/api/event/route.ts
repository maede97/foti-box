import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();

  const { slug, password } = await req.json();

  if (!slug || !password)
    return NextResponse.json({ error: 'Fehlender Slug oder Admin Passwort' }, { status: 400 });

  const event = await Event.findOne({ slug: slug });
  if (!event) return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 });

  if (event.admin_password !== password) {
    return NextResponse.json({ error: 'Falsches Admin Passwort.' }, { status: 401 });
  }

  return NextResponse.json({ event });
}

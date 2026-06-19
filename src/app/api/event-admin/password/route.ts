import { requireEventAdminAccess } from '@/lib/eventAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const { eventId, adminPassword, password } = await req.json();

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  authCheck.event.password = password || '';
  await authCheck.event.save();

  return NextResponse.json({
    message: 'Passwort aktualisiert',
    event: authCheck.event,
  });
}

export const dynamic = 'force-dynamic';

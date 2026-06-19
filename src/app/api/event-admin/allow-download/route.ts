import { requireEventAdminAccess } from '@/lib/eventAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { eventId, adminPassword, allow_download } = await req.json();

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  authCheck.event.allow_download = Boolean(allow_download);
  await authCheck.event.save();

  return NextResponse.json({
    message: `Der Event "${authCheck.event.name}" erlaubt nun ${allow_download ? '' : 'keine '}Downloads`,
    event: authCheck.event,
  });
}

export const dynamic = 'force-dynamic';

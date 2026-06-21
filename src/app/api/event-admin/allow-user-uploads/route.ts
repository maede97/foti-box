import { requireEventAdminAccess } from '@/lib/eventAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { eventId, adminPassword, allow_user_uploads } = await req.json();

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  authCheck.event.allow_user_uploads = Boolean(allow_user_uploads);
  await authCheck.event.save();

  const { admin_password, ...eventData } = authCheck.event.toObject();

  return NextResponse.json({
    message: `Der Event "${authCheck.event.name}" erlaubt nun ${allow_user_uploads ? '' : 'keine '}Uploads`,
    event: eventData,
  });
}

export const dynamic = 'force-dynamic';

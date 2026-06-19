import { requireEventAdminAccess } from '@/lib/eventAdmin';
import Image from '@/models/image';
import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '../../admin/delete-image/route';

export async function DELETE(req: NextRequest) {
  const { eventId, adminPassword, uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: 'Fehlende UUID' }, { status: 400 });
  }

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const image = await Image.findOne({ uuid });
  if (!image) {
    return NextResponse.json({ error: 'Bild nicht gefunden' }, { status: 404 });
  }

  if (String(image.event) !== String(authCheck.event._id)) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  await deleteImage(uuid);

  return NextResponse.json({ message: 'Bild gelöscht' });
}

export const dynamic = 'force-dynamic';

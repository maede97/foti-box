import { environmentVariables } from '@/config/environment';
import { requireEventAdminAccess } from '@/lib/eventAdmin';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function DELETE(req: NextRequest) {
  const { eventId, adminPassword } = await req.json();

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  authCheck.event.logo = '';
  await authCheck.event.save();

  return NextResponse.json({
    message: `Der Event "${authCheck.event.name}" hat nun kein Logo mehr.`,
    event: authCheck.event,
  });
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const eventId = formData.get('eventId') as string;
  const adminPassword = formData.get('adminPassword') as string;

  if (!file) {
    return NextResponse.json({ error: 'Bitte zuerst eine Datei auswählen.' }, { status: 400 });
  }

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Bitte eine gültige Bilddatei auswählen.' }, { status: 400 });
  }

  const uploadDir = path.join(environmentVariables.UPLOAD_FOLDER, 'logos');
  await fs.mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(path.join(uploadDir, file.name), buffer);

  authCheck.event.logo = file.name;
  await authCheck.event.save();

  return NextResponse.json({
    logo: file.name,
    event: authCheck.event,
  });
}

export const dynamic = 'force-dynamic';

import { environmentVariables } from '@/config/environment';
import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/models/event';
import Image from '@/models/image';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== environmentVariables.UPLOAD_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  // Get active event
  const event = await Event.findOne({ active: true });
  if (!event) {
    return NextResponse.json({ error: 'No active event found' }, { status: 400 });
  }

  // Generate a unique filename
  const fileExtension = path.extname(file.name) || '.jpg'; // default to .jpg if missing
  const fileUuid = uuidv4();
  const fileName = `${fileUuid}${fileExtension}`;

  // Create uploads folder for the event
  const uploadDir = path.join(environmentVariables.UPLOAD_FOLDER, event._id.toString());
  await fs.mkdir(uploadDir, { recursive: true });

  // Save file to filesystem
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  // Save metadata to database
  const image = new Image({
    uuid: fileUuid,
    extension: fileExtension,
    event: event._id,
  });

  await image.save();

  return NextResponse.json({ uuid: fileUuid });
}

export const dynamic = 'force-dynamic';

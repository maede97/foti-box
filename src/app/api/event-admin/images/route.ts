import { requireEventAdminAccess } from '@/lib/eventAdmin';
import Image from '@/models/image';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { eventId, adminPassword, page = 1, limit = 25 } = await req.json();

  const authCheck = await requireEventAdminAccess(eventId, adminPassword);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));

  const images = await Image.find({ event: authCheck.event._id })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return NextResponse.json(images);
}

export const dynamic = 'force-dynamic';

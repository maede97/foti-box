import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/event";
import { requireAdmin } from "@/lib/adminMiddleware";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await Event.find({}).sort({ active: -1, name: 1 });
  return NextResponse.json(events);
}

export const dynamic = "force-dynamic";

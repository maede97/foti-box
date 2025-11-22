import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Image from "@/models/image";
import { requireAdmin } from "@/lib/adminMiddleware";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const authCheck = requireAdmin(req);
  if (!authCheck)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await Image.find({}).sort({ createdAt: -1 });
  return NextResponse.json(
    images.map((img: any) => {
      img.data = {};
      return img;
    })
  );
}

export const dynamic = "force-dynamic";

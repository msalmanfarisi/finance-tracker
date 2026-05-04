import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const filename = `${session.userId}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

    await mkdir(uploadDir, { recursive: true });
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);

    const avatarUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({ where: { id: session.userId }, data: { avatar: avatarUrl } });

    return NextResponse.json({ avatar: avatarUrl });
  });
}

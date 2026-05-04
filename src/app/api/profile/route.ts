import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.locale) updateData.locale = data.locale;
    if (data.theme) updateData.theme = data.theme;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    if (data.currentPassword && data.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const isValid = await verifyPassword(data.currentPassword, user.password);
      if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

      updateData.password = await hashPassword(data.newPassword);
    }

    await prisma.user.update({ where: { id: session.userId }, data: updateData });
    return NextResponse.json({ success: true });
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const user = await prisma.user.findFirst({
      where: { id, tenantId: session.tenantId },
      select: { id: true, name: true, email: true, avatar: true, phone: true, address: true, isActive: true, locale: true, theme: true, lastLoginAt: true, createdAt: true, role: { select: { id: true, name: true } } },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      roleId: data.roleId,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    await prisma.user.updateMany({
      where: { id, tenantId: session.tenantId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    if (id === session.userId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }
    await prisma.user.deleteMany({ where: { id, tenantId: session.tenantId } });
    return NextResponse.json({ success: true });
  });
}

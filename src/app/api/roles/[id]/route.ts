import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();

    const role = await prisma.role.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (role.isSystem) return NextResponse.json({ error: "Cannot modify system role" }, { status: 400 });

    await prisma.role.update({
      where: { id },
      data: { name: data.name, description: data.description, permissions: data.permissions },
    });
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const role = await prisma.role.findFirst({ where: { id, tenantId: session.tenantId } });
    if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (role.isSystem) return NextResponse.json({ error: "Cannot delete system role" }, { status: 400 });

    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) return NextResponse.json({ error: "Role is in use" }, { status: 400 });

    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}

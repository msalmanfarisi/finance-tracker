import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();
    await prisma.incomePlan.updateMany({
      where: { id, tenantId: session.tenantId },
      data: {
        description: data.description,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        source: data.source,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        notes: data.notes,
        status: data.status,
      },
    });
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    await prisma.incomePlan.deleteMany({ where: { id, tenantId: session.tenantId } });
    return NextResponse.json({ success: true });
  });
}

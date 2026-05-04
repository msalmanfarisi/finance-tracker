import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();
    await prisma.debt.updateMany({
      where: { id, tenantId: session.tenantId },
      data: {
        creditor: data.creditor,
        amount: data.amount,
        remaining: data.remaining,
        interest: data.interest,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        description: data.description,
        status: data.status,
      },
    });
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    await prisma.debt.deleteMany({ where: { id, tenantId: session.tenantId } });
    return NextResponse.json({ success: true });
  });
}

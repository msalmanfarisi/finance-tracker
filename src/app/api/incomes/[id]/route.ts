import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();
    const income = await prisma.income.updateMany({
      where: { id, tenantId: session.tenantId },
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : undefined,
        source: data.source,
        notes: data.notes,
        isRecurring: data.isRecurring,
        recurType: data.recurType,
        categoryId: data.categoryId,
      },
    });
    return NextResponse.json(income);
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    await prisma.income.deleteMany({ where: { id, tenantId: session.tenantId } });
    return NextResponse.json({ success: true });
  });
}

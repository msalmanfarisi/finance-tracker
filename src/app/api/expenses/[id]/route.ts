import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();
    const expense = await prisma.expense.updateMany({
      where: { id, tenantId: session.tenantId },
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : undefined,
        vendor: data.vendor,
        notes: data.notes,
        isRecurring: data.isRecurring,
        recurType: data.recurType,
        categoryId: data.categoryId,
      },
    });
    return NextResponse.json(expense);
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    await prisma.expense.deleteMany({ where: { id, tenantId: session.tenantId } });
    return NextResponse.json({ success: true });
  });
}

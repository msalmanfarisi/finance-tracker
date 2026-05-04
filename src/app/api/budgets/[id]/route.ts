import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const budget = await prisma.budget.findFirst({
      where: { id, tenantId: session.tenantId },
      include: { category: true },
    });
    if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(budget);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    const data = await request.json();

    const budget = await prisma.budget.updateMany({
      where: { id, tenantId: session.tenantId },
      data: {
        name: data.name,
        amount: data.amount,
        spent: data.spent,
        period: data.period,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        notes: data.notes,
        categoryId: data.categoryId,
      },
    });

    return NextResponse.json(budget);
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (session) => {
    const { id } = await params;
    await prisma.budget.deleteMany({ where: { id, tenantId: session.tenantId } });
    return NextResponse.json({ success: true });
  });
}

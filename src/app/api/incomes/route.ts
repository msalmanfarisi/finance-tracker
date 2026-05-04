import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, paginationParams } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { page, limit, search, skip } = paginationParams(request);

    const where = {
      tenantId: session.tenantId,
      userId: session.userId,
      ...(search ? { description: { contains: search } } : {}),
    };

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({ where, include: { category: true }, skip, take: limit, orderBy: { date: "desc" } }),
      prisma.income.count({ where }),
    ]);

    return NextResponse.json({ incomes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();
    const income = await prisma.income.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
        source: data.source,
        notes: data.notes,
        isRecurring: data.isRecurring || false,
        recurType: data.recurType,
        categoryId: data.categoryId,
        userId: session.userId,
        tenantId: session.tenantId,
      },
      include: { category: true },
    });
    return NextResponse.json(income, { status: 201 });
  });
}

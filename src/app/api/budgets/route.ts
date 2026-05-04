import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, paginationParams } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { page, limit, search, skip } = paginationParams(request);

    const where = {
      tenantId: session.tenantId,
      userId: session.userId,
      ...(search ? { name: { contains: search } } : {}),
    };

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.budget.count({ where }),
    ]);

    return NextResponse.json({
      budgets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();

    const budget = await prisma.budget.create({
      data: {
        name: data.name,
        amount: data.amount,
        period: data.period,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
        categoryId: data.categoryId,
        userId: session.userId,
        tenantId: session.tenantId,
      },
      include: { category: true },
    });

    return NextResponse.json(budget, { status: 201 });
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, paginationParams } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { page, limit, search, skip } = paginationParams(request);

    const where = {
      tenantId: session.tenantId,
      userId: session.userId,
      ...(search ? { creditor: { contains: search } } : {}),
    };

    const [debts, total] = await Promise.all([
      prisma.debt.findMany({ where, include: { payments: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.debt.count({ where }),
    ]);

    return NextResponse.json({ debts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();
    const debt = await prisma.debt.create({
      data: {
        creditor: data.creditor,
        amount: data.amount,
        remaining: data.amount,
        interest: data.interest || 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        description: data.description,
        userId: session.userId,
        tenantId: session.tenantId,
      },
    });
    return NextResponse.json(debt, { status: 201 });
  });
}

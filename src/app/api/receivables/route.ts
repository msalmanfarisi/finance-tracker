import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, paginationParams } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { page, limit, search, skip } = paginationParams(request);

    const where = {
      tenantId: session.tenantId,
      userId: session.userId,
      ...(search ? { debtor: { contains: search } } : {}),
    };

    const [receivables, total] = await Promise.all([
      prisma.receivable.findMany({ where, include: { payments: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.receivable.count({ where }),
    ]);

    return NextResponse.json({ receivables, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();
    const receivable = await prisma.receivable.create({
      data: {
        debtor: data.debtor,
        amount: data.amount,
        remaining: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        description: data.description,
        userId: session.userId,
        tenantId: session.tenantId,
      },
    });
    return NextResponse.json(receivable, { status: 201 });
  });
}

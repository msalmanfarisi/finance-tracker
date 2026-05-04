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

    const [plans, total] = await Promise.all([
      prisma.incomePlan.findMany({ where, skip, take: limit, orderBy: { targetDate: "asc" } }),
      prisma.incomePlan.count({ where }),
    ]);

    return NextResponse.json({ plans, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();
    const plan = await prisma.incomePlan.create({
      data: {
        description: data.description,
        targetAmount: data.targetAmount,
        source: data.source,
        targetDate: new Date(data.targetDate),
        notes: data.notes,
        userId: session.userId,
        tenantId: session.tenantId,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  });
}

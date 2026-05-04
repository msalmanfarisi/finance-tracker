import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, paginationParams } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { page, limit, skip } = paginationParams(request);

    const where = { tenantId: session.tenantId };

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: { _count: { select: { users: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.role.count({ where }),
    ]);

    return NextResponse.json({ roles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions || {},
        tenantId: session.tenantId,
      },
    });
    return NextResponse.json(role, { status: 201 });
  });
}

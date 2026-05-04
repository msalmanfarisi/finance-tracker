import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, paginationParams } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { page, limit, search, skip } = paginationParams(request);

    const where = {
      tenantId: session.tenantId,
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true, role: { select: { id: true, name: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const data = await request.json();
    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        address: data.address,
        roleId: data.roleId,
        tenantId: session.tenantId,
      },
      select: { id: true, name: true, email: true, isActive: true, role: { select: { name: true } } },
    });

    return NextResponse.json(user, { status: 201 });
  });
}

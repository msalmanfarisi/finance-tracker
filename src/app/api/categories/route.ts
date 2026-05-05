import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    const where = {
      tenantId: session.tenantId,
      ...(type ? { type } : {}),
    };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  });
}

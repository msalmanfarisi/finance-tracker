import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId, tenantId: session.tenantId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: session.userId, tenantId: session.tenantId, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  });
}

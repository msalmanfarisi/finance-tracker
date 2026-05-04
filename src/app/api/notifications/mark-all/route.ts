import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { markAs } = await request.json();

    await prisma.notification.updateMany({
      where: { userId: session.userId, tenantId: session.tenantId },
      data: { isRead: markAs === "read" },
    });

    return NextResponse.json({ success: true });
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
    const settings = await prisma.setting.findMany({ where: { tenantId: session.tenantId } });

    return NextResponse.json({ tenant, settings });
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (session) => {
    if (session.roleName !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        appName: data.appName,
        currency: data.currency,
        locale: data.locale,
        theme: data.theme,
      },
    });

    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await prisma.setting.upsert({
          where: { key_tenantId: { key, tenantId: session.tenantId } },
          update: { value: value as string },
          create: { key, value: value as string, tenantId: session.tenantId },
        });
      }
    }

    return NextResponse.json({ success: true });
  });
}

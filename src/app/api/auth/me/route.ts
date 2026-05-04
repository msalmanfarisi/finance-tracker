import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      locale: user.locale,
      theme: user.theme,
      role: { id: user.role.id, name: user.role.name, permissions: user.role.permissions },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        appName: user.tenant.appName,
        currency: user.tenant.currency,
        slug: user.tenant.slug,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";

export async function POST(request: NextRequest) {
  try {
    const { email, password, captchaId, captchaAnswer, tenantSlug } = await request.json();

    if (!email || !password || !captchaId || !captchaAnswer) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!verifyCaptcha(captchaId, captchaAnswer)) {
      return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug || "default" },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email_tenantId: { email, tenantId: tenant.id } },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        locale: user.locale,
        theme: user.theme,
        role: { id: user.role.id, name: user.role.name, permissions: user.role.permissions },
        tenant: { id: tenant.id, name: tenant.name, appName: tenant.appName, currency: tenant.currency, slug: tenant.slug },
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

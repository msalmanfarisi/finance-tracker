import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./auth";

export async function withAuth(
  request: NextRequest,
  handler: (session: { userId: string; tenantId: string; roleId: string; roleName: string; email: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handler(session);
}

export function paginationParams(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || "";
  const skip = (page - 1) * limit;
  return { page, limit, search, skip };
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

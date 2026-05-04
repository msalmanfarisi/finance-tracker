import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const dataType = formData.get("dataType") as string;

    if (!file || !dataType) {
      return NextResponse.json({ error: "File and data type required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    let imported = 0;

    for (const row of rows) {
      try {
        switch (dataType) {
          case "incomes": {
            let category = await prisma.category.findFirst({
              where: { name: String(row["Category"] || "Other"), type: "income", tenantId: session.tenantId },
            });
            if (!category) {
              category = await prisma.category.create({
                data: { name: String(row["Category"] || "Other"), type: "income", tenantId: session.tenantId },
              });
            }
            await prisma.income.create({
              data: {
                description: String(row["Description"] || ""),
                amount: Number(row["Amount"] || 0),
                date: row["Date"] ? new Date(String(row["Date"])) : new Date(),
                source: row["Source"] ? String(row["Source"]) : null,
                notes: row["Notes"] ? String(row["Notes"]) : null,
                categoryId: category.id,
                userId: session.userId,
                tenantId: session.tenantId,
              },
            });
            imported++;
            break;
          }
          case "expenses": {
            let category = await prisma.category.findFirst({
              where: { name: String(row["Category"] || "Other"), type: "expense", tenantId: session.tenantId },
            });
            if (!category) {
              category = await prisma.category.create({
                data: { name: String(row["Category"] || "Other"), type: "expense", tenantId: session.tenantId },
              });
            }
            await prisma.expense.create({
              data: {
                description: String(row["Description"] || ""),
                amount: Number(row["Amount"] || 0),
                date: row["Date"] ? new Date(String(row["Date"])) : new Date(),
                vendor: row["Vendor"] ? String(row["Vendor"]) : null,
                notes: row["Notes"] ? String(row["Notes"]) : null,
                categoryId: category.id,
                userId: session.userId,
                tenantId: session.tenantId,
              },
            });
            imported++;
            break;
          }
        }
      } catch (error) {
        console.error("Import row error:", error);
      }
    }

    return NextResponse.json({ success: true, imported, total: rows.length });
  });
}

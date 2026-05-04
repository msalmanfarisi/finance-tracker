import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, HeadingLevel } from "docx";

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    const { dataType, format, startDate, endDate } = await request.json();

    const dateFilter = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };

    let data: Record<string, unknown>[] = [];
    let title = "";

    switch (dataType) {
      case "incomes":
        title = "Incomes";
        data = (await prisma.income.findMany({
          where: { tenantId: session.tenantId, userId: session.userId, ...(startDate || endDate ? { date: dateFilter } : {}) },
          include: { category: true },
          orderBy: { date: "desc" },
        })).map((i) => ({ Description: i.description, Amount: Number(i.amount), Date: i.date.toISOString().split("T")[0], Source: i.source || "", Category: i.category.name, Notes: i.notes || "" }));
        break;
      case "expenses":
        title = "Expenses";
        data = (await prisma.expense.findMany({
          where: { tenantId: session.tenantId, userId: session.userId, ...(startDate || endDate ? { date: dateFilter } : {}) },
          include: { category: true },
          orderBy: { date: "desc" },
        })).map((e) => ({ Description: e.description, Amount: Number(e.amount), Date: e.date.toISOString().split("T")[0], Vendor: e.vendor || "", Category: e.category.name, Notes: e.notes || "" }));
        break;
      case "debts":
        title = "Debts";
        data = (await prisma.debt.findMany({
          where: { tenantId: session.tenantId, userId: session.userId },
          orderBy: { createdAt: "desc" },
        })).map((d) => ({ Creditor: d.creditor, Amount: Number(d.amount), Remaining: Number(d.remaining), Interest: Number(d.interest), Status: d.status, DueDate: d.dueDate?.toISOString().split("T")[0] || "" }));
        break;
      case "receivables":
        title = "Receivables";
        data = (await prisma.receivable.findMany({
          where: { tenantId: session.tenantId, userId: session.userId },
          orderBy: { createdAt: "desc" },
        })).map((r) => ({ Debtor: r.debtor, Amount: Number(r.amount), Remaining: Number(r.remaining), Status: r.status, DueDate: r.dueDate?.toISOString().split("T")[0] || "" }));
        break;
      case "budgets":
        title = "Budgets";
        data = (await prisma.budget.findMany({
          where: { tenantId: session.tenantId, userId: session.userId },
          include: { category: true },
          orderBy: { createdAt: "desc" },
        })).map((b) => ({ Name: b.name, Amount: Number(b.amount), Spent: Number(b.spent), Period: b.period, Category: b.category.name, Start: b.startDate.toISOString().split("T")[0], End: b.endDate.toISOString().split("T")[0] }));
        break;
      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 });
    }

    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title);
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${title}-${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }

    if (format === "docx") {
      const headers = data.length > 0 ? Object.keys(data[0]) : [];

      const tableRows = [
        new TableRow({
          children: headers.map((h) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
            width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
          })),
        }),
        ...data.map((row) => new TableRow({
          children: headers.map((h) => new TableCell({
            children: [new Paragraph(String(row[h] ?? ""))],
          })),
        })),
      ];

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Exported on ${new Date().toLocaleDateString()}`, spacing: { after: 300 } }),
            new Table({ rows: tableRows }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const uint8 = new Uint8Array(buffer);

      return new NextResponse(uint8, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${title}-${new Date().toISOString().split("T")[0]}.docx"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  });
}

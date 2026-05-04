import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalIncomeResult,
      totalExpenseResult,
      totalDebtResult,
      totalReceivableResult,
      monthlyIncomeResult,
      monthlyExpenseResult,
      recentIncomes,
      recentExpenses,
      activeBudgets,
      upcomingDebts,
      monthlyData,
    ] = await Promise.all([
      prisma.income.aggregate({ where: { userId: session.userId, tenantId: session.tenantId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId: session.userId, tenantId: session.tenantId }, _sum: { amount: true } }),
      prisma.debt.aggregate({ where: { userId: session.userId, tenantId: session.tenantId, status: "active" }, _sum: { remaining: true } }),
      prisma.receivable.aggregate({ where: { userId: session.userId, tenantId: session.tenantId, status: "active" }, _sum: { remaining: true } }),
      prisma.income.aggregate({
        where: { userId: session.userId, tenantId: session.tenantId, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId: session.userId, tenantId: session.tenantId, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.income.findMany({
        where: { userId: session.userId, tenantId: session.tenantId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.expense.findMany({
        where: { userId: session.userId, tenantId: session.tenantId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.budget.findMany({
        where: { userId: session.userId, tenantId: session.tenantId, endDate: { gte: now } },
        include: { category: true },
        take: 5,
      }),
      prisma.debt.findMany({
        where: { userId: session.userId, tenantId: session.tenantId, status: "active", dueDate: { gte: now } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.$queryRaw`
        SELECT
          DATE_FORMAT(date, '%Y-%m') as month,
          SUM(amount) as total,
          'income' as type
        FROM incomes
        WHERE user_id = ${session.userId} AND tenant_id = ${session.tenantId}
          AND date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        UNION ALL
        SELECT
          DATE_FORMAT(date, '%Y-%m') as month,
          SUM(amount) as total,
          'expense' as type
        FROM expenses
        WHERE user_id = ${session.userId} AND tenant_id = ${session.tenantId}
          AND date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC
      `.catch(() => []),
    ]);

    const totalIncome = Number(totalIncomeResult._sum.amount || 0);
    const totalExpense = Number(totalExpenseResult._sum.amount || 0);
    const totalDebt = Number(totalDebtResult._sum.remaining || 0);
    const totalReceivable = Number(totalReceivableResult._sum.remaining || 0);
    const netBalance = totalIncome - totalExpense;

    let healthStatus = "healthy";
    if (totalExpense > totalIncome * 0.9) healthStatus = "warning";
    if (totalExpense > totalIncome || totalDebt > totalIncome * 0.5) healthStatus = "critical";

    return NextResponse.json({
      overview: {
        totalIncome,
        totalExpense,
        totalDebt,
        totalReceivable,
        netBalance,
        monthlyIncome: Number(monthlyIncomeResult._sum.amount || 0),
        monthlyExpense: Number(monthlyExpenseResult._sum.amount || 0),
        healthStatus,
      },
      recentTransactions: [
        ...recentIncomes.map((i) => ({ ...i, type: "income", amount: Number(i.amount) })),
        ...recentExpenses.map((e) => ({ ...e, type: "expense", amount: Number(e.amount) })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
      activeBudgets: activeBudgets.map((b) => ({ ...b, amount: Number(b.amount), spent: Number(b.spent) })),
      upcomingDebts: upcomingDebts.map((d) => ({ ...d, amount: Number(d.amount), remaining: Number(d.remaining) })),
      monthlyData,
    });
  });
}

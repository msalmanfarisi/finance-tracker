import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcryptjs";

const url = process.env.DATABASE_URL!;
const parsed = new URL(url);
const adapter = new PrismaMariaDb({
  host: parsed.hostname,
  port: parseInt(parsed.port || "3306"),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.slice(1),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Default Organization",
      slug: "default",
      appName: "Finance Tracker",
      currency: "IDR",
      locale: "id",
    },
  });

  // Create admin role
  const adminRole = await prisma.role.upsert({
    where: { name_tenantId: { name: "Admin", tenantId: tenant.id } },
    update: {},
    create: {
      name: "Admin",
      description: "Full access administrator",
      permissions: { "*": true },
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  // Create user role
  const userRole = await prisma.role.upsert({
    where: { name_tenantId: { name: "User", tenantId: tenant.id } },
    update: {},
    create: {
      name: "User",
      description: "Standard user",
      permissions: {
        "budgets.view": true, "budgets.create": true, "budgets.edit": true, "budgets.delete": true,
        "incomes.view": true, "incomes.create": true, "incomes.edit": true, "incomes.delete": true,
        "expenses.view": true, "expenses.create": true, "expenses.edit": true, "expenses.delete": true,
        "debts.view": true, "debts.create": true, "debts.edit": true, "debts.delete": true,
        "receivables.view": true, "receivables.create": true, "receivables.edit": true, "receivables.delete": true,
      },
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  // Create admin user
  const hashedPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email_tenantId: { email: "admin@financetracker.com", tenantId: tenant.id } },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@financetracker.com",
      password: hashedPassword,
      roleId: adminRole.id,
      tenantId: tenant.id,
      locale: "id",
      theme: "system",
    },
  });

  // Create demo user
  const demoPassword = await hash("demo123", 12);
  await prisma.user.upsert({
    where: { email_tenantId: { email: "demo@financetracker.com", tenantId: tenant.id } },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@financetracker.com",
      password: demoPassword,
      roleId: userRole.id,
      tenantId: tenant.id,
      locale: "id",
      theme: "system",
    },
  });

  // Create default categories
  const categories = [
    { name: "Gaji", type: "income", icon: "briefcase", color: "#10b981" },
    { name: "Freelance", type: "income", icon: "laptop", color: "#6366f1" },
    { name: "Investasi", type: "income", icon: "trending-up", color: "#8b5cf6" },
    { name: "Lainnya", type: "income", icon: "circle", color: "#64748b" },
    { name: "Makanan", type: "expense", icon: "utensils", color: "#ef4444" },
    { name: "Transportasi", type: "expense", icon: "car", color: "#f97316" },
    { name: "Belanja", type: "expense", icon: "shopping-bag", color: "#ec4899" },
    { name: "Tagihan", type: "expense", icon: "file-text", color: "#eab308" },
    { name: "Hiburan", type: "expense", icon: "music", color: "#06b6d4" },
    { name: "Kesehatan", type: "expense", icon: "heart", color: "#14b8a6" },
    { name: "Pendidikan", type: "expense", icon: "book", color: "#8b5cf6" },
    { name: "Lainnya", type: "expense", icon: "circle", color: "#64748b" },
    { name: "Operasional", type: "budget", icon: "settings", color: "#6366f1" },
    { name: "Darurat", type: "budget", icon: "alert-triangle", color: "#ef4444" },
    { name: "Tabungan", type: "budget", icon: "piggy-bank", color: "#10b981" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name_type_tenantId: { name: cat.name, type: cat.type, tenantId: tenant.id } },
      update: {},
      create: { ...cat, tenantId: tenant.id },
    });
  }

  console.log("Seeding completed!");
  console.log("Admin: admin@financetracker.com / admin123");
  console.log("Demo: demo@financetracker.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

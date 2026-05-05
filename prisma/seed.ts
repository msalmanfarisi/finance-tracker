import "dotenv/config";
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

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
        "income-plans.view": true, "income-plans.create": true, "income-plans.edit": true, "income-plans.delete": true,
      },
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  // Create admin user
  const hashedAdmin = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email_tenantId: { email: "admin@financetracker.com", tenantId: tenant.id } },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@financetracker.com",
      password: hashedAdmin,
      roleId: adminRole.id,
      tenantId: tenant.id,
      locale: "id",
      theme: "system",
    },
  });

  // Create demo user
  const hashedDemo = await hash("demo123", 12);
  const demo = await prisma.user.upsert({
    where: { email_tenantId: { email: "demo@financetracker.com", tenantId: tenant.id } },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@financetracker.com",
      password: hashedDemo,
      roleId: userRole.id,
      tenantId: tenant.id,
      locale: "id",
      theme: "system",
    },
  });

  // Create dummy users with password user123!
  const hashedUser = await hash("user123!", 12);
  const dummyUsers = [
    { name: "Budi Santoso", email: "budi@financetracker.com", avatar: "/assets/avatars/user-1.svg" },
    { name: "Siti Rahayu", email: "siti@financetracker.com", avatar: "/assets/avatars/user-2.svg" },
    { name: "Andi Pratama", email: "andi@financetracker.com", avatar: "/assets/avatars/user-3.svg" },
    { name: "Dewi Lestari", email: "dewi@financetracker.com", avatar: "/assets/avatars/user-4.svg" },
    { name: "Rizky Aditya", email: "rizky@financetracker.com", avatar: "/assets/avatars/user-5.svg" },
    { name: "Maya Putri", email: "maya@financetracker.com", avatar: "/assets/avatars/user-6.svg" },
    { name: "Hendra Wijaya", email: "hendra@financetracker.com", avatar: "/assets/avatars/user-7.svg" },
    { name: "Lina Susanti", email: "lina@financetracker.com", avatar: "/assets/avatars/user-8.svg" },
  ];

  const createdUsers = [];
  for (const u of dummyUsers) {
    const user = await prisma.user.upsert({
      where: { email_tenantId: { email: u.email, tenantId: tenant.id } },
      update: { avatar: u.avatar },
      create: {
        name: u.name,
        email: u.email,
        password: hashedUser,
        avatar: u.avatar,
        roleId: userRole.id,
        tenantId: tenant.id,
        locale: "id",
        theme: "system",
      },
    });
    createdUsers.push(user);
  }

  const allUsers = [admin, demo, ...createdUsers];

  // Create default categories
  const categoryDefs = [
    { name: "Gaji", type: "income", icon: "briefcase", color: "#10b981" },
    { name: "Freelance", type: "income", icon: "laptop", color: "#6366f1" },
    { name: "Investasi", type: "income", icon: "trending-up", color: "#8b5cf6" },
    { name: "Bonus", type: "income", icon: "gift", color: "#f59e0b" },
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
    { name: "Hiburan", type: "budget", icon: "music", color: "#06b6d4" },
    { name: "Pendidikan", type: "budget", icon: "book", color: "#8b5cf6" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryDefs) {
    const c = await prisma.category.upsert({
      where: { name_type_tenantId: { name: cat.name, type: cat.type, tenantId: tenant.id } },
      update: {},
      create: { ...cat, tenantId: tenant.id },
    });
    categories[`${cat.type}:${cat.name}`] = c.id;
  }

  const budgetCatIds = Object.entries(categories).filter(([k]) => k.startsWith("budget:")).map(([, v]) => v);
  const incomeCatIds = Object.entries(categories).filter(([k]) => k.startsWith("income:")).map(([, v]) => v);
  const expenseCatIds = Object.entries(categories).filter(([k]) => k.startsWith("expense:")).map(([, v]) => v);

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // ==================== BUDGETS (40 records) ====================
  const budgetNames = [
    "Anggaran Makan Bulanan", "Anggaran Transportasi", "Anggaran Hiburan",
    "Anggaran Belanja Bulanan", "Anggaran Kesehatan", "Anggaran Pendidikan Anak",
    "Anggaran Liburan Keluarga", "Anggaran Tagihan Listrik", "Anggaran Internet",
    "Anggaran Sewa Rumah", "Anggaran Asuransi", "Anggaran Bensin",
    "Anggaran Perawatan Kendaraan", "Anggaran Pakaian", "Anggaran Donasi",
    "Anggaran Gadget", "Anggaran Renovasi", "Anggaran Hobi",
    "Anggaran Tabungan Darurat", "Anggaran Investasi Bulanan",
    "Anggaran Operasional Kantor", "Anggaran Makan Siang Kantor",
    "Anggaran Kursus Online", "Anggaran Buku", "Anggaran Olahraga",
    "Anggaran Perawatan Diri", "Anggaran Hadiah", "Anggaran Langganan",
    "Anggaran Parkir", "Anggaran Pulsa", "Anggaran Air PDAM",
    "Anggaran Gas", "Anggaran Laundry", "Anggaran Perabotan",
    "Anggaran Makanan Hewan", "Anggaran Service AC", "Anggaran Pajak",
    "Anggaran THR", "Anggaran Zakat", "Anggaran Dana Pensiun",
  ];
  const periods = ["monthly", "quarterly", "yearly"];

  console.log("Creating budgets...");
  for (let i = 0; i < 40; i++) {
    const user = pickRandom(allUsers);
    const amount = randomInt(5, 100) * 100000;
    const spent = Math.floor(amount * (Math.random() * 1.2));
    const startDate = randomDate(yearStart, now);
    const endDate = new Date(startDate);
    const period = pickRandom(periods);
    if (period === "monthly") endDate.setMonth(endDate.getMonth() + 1);
    else if (period === "quarterly") endDate.setMonth(endDate.getMonth() + 3);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    await prisma.budget.create({
      data: {
        name: budgetNames[i],
        amount,
        spent,
        period,
        startDate,
        endDate,
        notes: i % 3 === 0 ? `Catatan untuk ${budgetNames[i]}` : null,
        categoryId: pickRandom(budgetCatIds),
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  // ==================== INCOMES (45 records) ====================
  const incomeDescs = [
    "Gaji Bulanan Januari", "Gaji Bulanan Februari", "Gaji Bulanan Maret",
    "Gaji Bulanan April", "Gaji Bulanan Mei", "Gaji Bulanan Juni",
    "Bonus Tahunan", "THR Lebaran", "Dividen Saham BBCA",
    "Freelance Web Development", "Freelance Mobile App", "Freelance Desain Logo",
    "Hasil Investasi Reksadana", "Bunga Deposito BCA", "Sewa Kos-kosan",
    "Jual Barang Bekas", "Royalti Buku", "Penghasilan YouTube",
    "Komisi Penjualan", "Cashback Promo", "Hadiah Undian",
    "Pengembalian Pajak", "Lembur Proyek", "Konsultasi IT",
    "Penghasilan Shopee", "Penghasilan Tokopedia", "Hasil Jual Emas",
    "Profit Trading Crypto", "Sewa Properti", "Penghasilan Kursus Online",
    "Jasa Fotografi", "Jasa Penerjemahan", "Penghasilan Affiliate",
    "Bonus Kinerja Q1", "Bonus Kinerja Q2", "Honor Pembicara",
    "Hasil Pertanian", "Jasa Konsultan", "Penghasilan Grab/Gojek",
    "Uang Saku Orang Tua", "Beasiswa Pendidikan", "Pengembalian Deposit",
    "Cashback Kartu Kredit", "Hasil Panen Sawit", "Penghasilan Airbnb",
  ];
  const incomeSources = [
    "PT Teknologi Nusantara", "Bank BCA", "Shopee", "Tokopedia",
    "Client Freelance", "Investasi", "Rental", "YouTube", "Trading",
    "Konsultan", "E-commerce", "Grab", "Gojek",
  ];

  console.log("Creating incomes...");
  for (let i = 0; i < 45; i++) {
    const user = pickRandom(allUsers);
    await prisma.income.create({
      data: {
        description: incomeDescs[i],
        amount: randomInt(1, 200) * 100000,
        date: randomDate(yearStart, now),
        source: pickRandom(incomeSources),
        notes: i % 4 === 0 ? `Detail: ${incomeDescs[i]}` : null,
        isRecurring: i < 6,
        recurType: i < 6 ? "monthly" : null,
        categoryId: pickRandom(incomeCatIds),
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  // ==================== EXPENSES (50 records) ====================
  const expenseDescs = [
    "Belanja Groceries Superindo", "Makan Siang Warteg", "Bensin Pertamax",
    "Tagihan Listrik PLN", "Tagihan Internet Indihome", "Pulsa Telkomsel",
    "Tagihan Air PDAM", "Sewa Apartemen Bulanan", "Cicilan Motor Honda",
    "Asuransi Kesehatan BPJS", "Langganan Netflix", "Langganan Spotify",
    "Belanja Shopee", "Belanja Tokopedia", "Servis Motor Berkala",
    "Obat dan Vitamin", "Periksa Dokter Gigi", "Belanja Pakaian Uniqlo",
    "Makan Restoran Keluarga", "Kopi Starbucks", "Ojek Online Grab",
    "Parkir Mall", "Laundry Bulanan", "Cat Rambut Salon",
    "Beli Buku Programming", "Kursus Online Udemy", "Gym Membership",
    "Donasi Masjid", "Zakat Penghasilan", "Beli Kado Ulang Tahun",
    "Biaya Admin Bank", "Materai dan Surat", "Fotokopi Dokumen",
    "Beli Alat Tulis Kantor", "Perawatan AC", "Ganti Oli Motor",
    "Belanja Makanan Kucing", "Iuran RT/RW", "Pajak Kendaraan",
    "Pajak Bumi dan Bangunan", "Tiket Bioskop", "Langganan Game Pass",
    "Beli Sepatu Olahraga", "Service HP Layar Retak", "Cetak Foto Keluarga",
    "Biaya Pengiriman JNE", "Top Up E-Wallet", "Bayar Kredit Laptop",
    "Beli Peralatan Masak", "Renovasi Kamar Mandi",
  ];
  const vendors = [
    "Superindo", "Alfamart", "Indomaret", "PLN", "Telkom",
    "Pertamina", "Shopee", "Tokopedia", "Honda", "Samsung",
    "Apple", "Netflix", "Spotify", "Grab", "Gojek",
    "Starbucks", "McDonalds", "KFC", "Uniqlo", "Udemy",
  ];

  console.log("Creating expenses...");
  for (let i = 0; i < 50; i++) {
    const user = pickRandom(allUsers);
    await prisma.expense.create({
      data: {
        description: expenseDescs[i],
        amount: randomInt(1, 50) * 50000,
        date: randomDate(yearStart, now),
        vendor: pickRandom(vendors),
        notes: i % 5 === 0 ? `Receipt #${1000 + i}` : null,
        isRecurring: i < 4,
        recurType: i < 4 ? "monthly" : null,
        categoryId: pickRandom(expenseCatIds),
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  // ==================== DEBTS (35 records) ====================
  const debtCreditors = [
    "Bank BCA", "Bank Mandiri", "Bank BRI", "Bank BNI",
    "Akulaku", "Kredivo", "Home Credit", "Adira Finance",
    "FIF Group", "Pegadaian", "Bank Syariah Indonesia",
    "BCA Finance", "Pak Ahmad (Tetangga)", "Bu Siti (Keluarga)",
    "Koperasi Kantor", "Bank DKI", "Bank Jatim",
  ];
  const debtStatuses = ["active", "active", "active", "paid", "overdue"];

  console.log("Creating debts...");
  for (let i = 0; i < 35; i++) {
    const user = pickRandom(allUsers);
    const amount = randomInt(5, 500) * 100000;
    const status = pickRandom(debtStatuses);
    const remaining = status === "paid" ? 0 : Math.floor(amount * (0.2 + Math.random() * 0.8));

    await prisma.debt.create({
      data: {
        creditor: pickRandom(debtCreditors),
        amount,
        remaining,
        interest: randomInt(0, 24),
        dueDate: randomDate(now, new Date(now.getFullYear() + 2, 11, 31)),
        description: `Pinjaman ${i % 2 === 0 ? "konsumtif" : "produktif"} #${i + 1}`,
        status,
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  // ==================== RECEIVABLES (35 records) ====================
  const receivableDebtors = [
    "Pak Rudi", "Bu Rina", "Mas Agus", "Mbak Dina",
    "Pak Harto", "Bu Yuli", "Mas Dedi", "Mbak Sari",
    "PT Jaya Abadi", "CV Maju Bersama", "UD Sejahtera",
    "Toko Makmur", "Bengkel Jaya", "Warung Bu Tini",
    "Koperasi Desa", "Pak Joko (Kantor)", "Bu Dewi (Arisan)",
  ];
  const recvStatuses = ["active", "active", "active", "received", "overdue"];

  console.log("Creating receivables...");
  for (let i = 0; i < 35; i++) {
    const user = pickRandom(allUsers);
    const amount = randomInt(1, 200) * 100000;
    const status = pickRandom(recvStatuses);
    const remaining = status === "received" ? 0 : Math.floor(amount * (0.1 + Math.random() * 0.9));

    await prisma.receivable.create({
      data: {
        debtor: pickRandom(receivableDebtors),
        amount,
        remaining,
        dueDate: randomDate(now, new Date(now.getFullYear() + 1, 11, 31)),
        description: `Piutang ${i % 3 === 0 ? "usaha" : i % 3 === 1 ? "pribadi" : "pinjaman"} #${i + 1}`,
        status,
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  // ==================== INCOME PLANS (40 records) ====================
  const planDescs = [
    "Target Freelance Web Q1", "Target Freelance Web Q2",
    "Target Penjualan Online Januari", "Target Penjualan Online Februari",
    "Target Sewa Properti 2025", "Rencana Investasi Saham",
    "Target Kursus Online Income", "Rencana Penghasilan YouTube",
    "Target Komisi Penjualan", "Rencana Passive Income Dividen",
    "Target Jasa Konsultasi", "Rencana Affiliate Marketing",
    "Target Penghasilan Grab", "Rencana Pendapatan Rental",
    "Target Bonus Tahunan", "Rencana THR + Bonus",
    "Target Jual Produk Digital", "Rencana Penghasilan Desain",
    "Target Side Project App", "Rencana Pendapatan Podcast",
    "Target Penghasilan Fotografi", "Rencana Penulisan Artikel",
    "Target Pendapatan Workshop", "Rencana Mentoring Income",
    "Target E-commerce Q3", "Rencana Dropshipping",
    "Target Content Creator", "Rencana Jasa Terjemahan",
    "Target Penghasilan Tutoring", "Rencana Pendapatan Katering",
    "Target Jasa Laundry", "Rencana Sewa Kendaraan",
    "Target Hasil Pertanian", "Rencana Peternakan Ayam",
    "Target Hasil Perkebunan", "Rencana Penghasilan Craft",
    "Target Jasa IT Support", "Rencana Pendapatan Printing",
    "Target Penjualan Kue", "Rencana Penghasilan Jahit",
  ];
  const planSources = [
    "Freelance", "E-commerce", "Investasi", "Rental",
    "YouTube/Content", "Konsultasi", "Side Business", "Trading",
  ];
  const planStatuses = ["planned", "planned", "in_progress", "in_progress", "achieved"];

  console.log("Creating income plans...");
  for (let i = 0; i < 40; i++) {
    const user = pickRandom(allUsers);
    const targetAmount = randomInt(5, 200) * 100000;
    const status = pickRandom(planStatuses);
    const currentAmount = status === "achieved"
      ? targetAmount
      : status === "in_progress"
        ? Math.floor(targetAmount * (0.2 + Math.random() * 0.7))
        : Math.floor(targetAmount * Math.random() * 0.3);

    await prisma.incomePlan.create({
      data: {
        description: planDescs[i],
        targetAmount,
        currentAmount,
        source: pickRandom(planSources),
        targetDate: randomDate(now, new Date(now.getFullYear() + 1, 11, 31)),
        status,
        notes: i % 4 === 0 ? `Strategi: ${planDescs[i]}` : null,
        userId: user.id,
        tenantId: tenant.id,
      },
    });
  }

  // ==================== NOTIFICATIONS ====================
  console.log("Creating notifications...");
  const notifTemplates = [
    { title: "Budget Alert", message: "Anggaran Makan Bulanan sudah mencapai 80%", type: "warning" },
    { title: "Payment Due", message: "Cicilan motor jatuh tempo dalam 3 hari", type: "warning" },
    { title: "Income Received", message: "Gaji bulan ini sudah masuk", type: "success" },
    { title: "System Update", message: "Aplikasi telah diperbarui ke versi terbaru", type: "info" },
    { title: "Expense Alert", message: "Pengeluaran bulan ini melebihi rata-rata", type: "error" },
  ];

  for (const user of allUsers) {
    for (const notif of notifTemplates) {
      await prisma.notification.create({
        data: {
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: Math.random() > 0.5,
          userId: user.id,
          tenantId: tenant.id,
        },
      });
    }
  }

  console.log("Seeding completed!");
  console.log("Admin: admin@financetracker.com / admin123");
  console.log("Demo: demo@financetracker.com / demo123");
  console.log("Dummy users (password: user123!):");
  for (const u of dummyUsers) {
    console.log(`  ${u.name}: ${u.email}`);
  }
  console.log(`\nCreated: 40 budgets, 45 incomes, 50 expenses, 35 debts, 35 receivables, 40 income plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

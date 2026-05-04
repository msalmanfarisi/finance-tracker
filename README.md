# 💰 Finance Tracker — Personal Financial Assistant

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL/MariaDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**Aplikasi web asisten keuangan pribadi yang komprehensif dengan fitur lengkap untuk mengelola anggaran, pemasukan, pengeluaran, utang, piutang, dan rencana keuangan.**

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

</div>

---

## Bahasa Indonesia

### 📋 Tentang Aplikasi

Finance Tracker adalah aplikasi manajemen keuangan berbasis web yang dibangun dengan arsitektur **multi-tenant SaaS**. Aplikasi ini dirancang untuk membantu individu dan organisasi dalam mengelola keuangan secara efisien dengan antarmuka yang elegan dan futuristik.

### ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Dashboard** | Widget kondisi keuangan real-time dengan grafik dan statistik |
| 💰 **Anggaran** | CRUD pengelolaan budget dengan tracking penggunaan |
| 📈 **Pemasukan** | Pencatatan pemasukan dengan kategori dan recurring |
| 📉 **Pengeluaran** | Pencatatan pengeluaran dengan vendor dan kuitansi |
| 💳 **Utang** | Manajemen utang dengan bunga dan riwayat pembayaran |
| 🤝 **Piutang** | Tracking piutang dengan status dan jatuh tempo |
| 🎯 **Rencana Pemasukan** | Perencanaan target pemasukan dengan progress tracking |
| 👥 **Manajemen Pengguna** | CRUD pengguna dengan peran dan status aktif/nonaktif |
| 🛡️ **Manajemen Peran** | Pengaturan peran dan izin akses granular |
| 👤 **Profil** | Edit profil termasuk foto profil, ubah password |
| ⚙️ **Pengaturan** | Nama aplikasi, mata uang, bahasa, tema |
| 💾 **Backup** | Export database ke .sql, .zip, atau .gz |
| 📤 **Export** | Export data ke XLSX (Excel) dan DOCX (Word) |
| 📥 **Import** | Import data dari file XLSX |
| 🔔 **Notifikasi** | Bell notification dengan toggle read/unread |
| 🌙 **Dark/Light Mode** | Transisi tema gelap/terang yang halus |
| 🎨 **Theme Selection** | 6 tema warna: Default, Ocean, Sunset, Forest, Midnight, Rose |
| 🌐 **Bilingual** | Bahasa Indonesia & English, berganti otomatis tanpa refresh |
| 📱 **Responsive** | Sidebar expandable/collapsible dengan ikon unik |
| 🔒 **Security** | CAPTCHA 8 digit + operasi matematika, OWASP headers A+ |
| 🏢 **Multi-tenant** | Arsitektur SaaS untuk multiple organisasi |

### 🛡️ Fitur Keamanan

- **CAPTCHA**: 8 digit karakter (huruf besar, huruf kecil, angka) + operasi matematika sederhana untuk mengecoh brute-force
- **Security Headers**: Konfigurasi lengkap untuk grade A+ di SecurityHeaders.com
  - Content-Security-Policy (CSP)
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
  - Permissions-Policy
  - Cross-Origin policies
- **JWT Authentication**: Token-based auth dengan HttpOnly cookies
- **Password Hashing**: bcrypt dengan 12 rounds
- **OWASP Compliance**: Mengikuti standar secure coding OWASP

### 🔧 Teknologi

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| ![Next.js](https://img.shields.io/badge/-Next.js-000?logo=next.js&logoColor=white&style=flat-square) | 16.x | Full-stack React framework |
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square) | 19.x | UI library |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) | 5.x | Type safety |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwind-css&logoColor=white&style=flat-square) | 4.x | Styling framework |
| ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white&style=flat-square) | 7.x | Database ORM |
| ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) | 8.x+ | Database |
| ![MariaDB](https://img.shields.io/badge/-MariaDB-003545?logo=mariadb&logoColor=white&style=flat-square) | 10.x+ | Database (alternative) |
| ![Lucide](https://img.shields.io/badge/-Lucide_React-f97316?style=flat-square) | Latest | Icon library |
| ![bcryptjs](https://img.shields.io/badge/-bcryptjs-333?style=flat-square) | 3.x | Password hashing |
| ![JWT](https://img.shields.io/badge/-jsonwebtoken-000?logo=jsonwebtokens&logoColor=white&style=flat-square) | 9.x | Authentication tokens |
| ![xlsx](https://img.shields.io/badge/-SheetJS-339933?style=flat-square) | 0.18.x | Excel export/import |
| ![docx](https://img.shields.io/badge/-docx-2B579A?logo=microsoft-word&logoColor=white&style=flat-square) | 9.x | Word document export |

### 📋 Requirements

- **Node.js** >= 22.x
- **npm** >= 10.x
- **MySQL** 8.x+ atau **MariaDB** 10.x+

### 🚀 Instalasi

#### 1. Clone Repository

```bash
git clone https://github.com/msalmanfarisi/finance-tracker.git
cd finance-tracker
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan:

```env
DATABASE_URL="mysql://root:password@localhost:3306/finance_tracker"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
```

#### 4. Setup Database

```bash
# Buat database
mysql -u root -p -e "CREATE DATABASE finance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Push schema ke database
npm run db:push

# Seed data awal (admin user & kategori)
npm run db:seed
```

#### 5. Jalankan Aplikasi

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

#### 6. Akses Aplikasi

Buka browser ke `http://localhost:3000`

**Akun Default:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@financetracker.com | admin123 |
| User | demo@financetracker.com | demo123 |

### 📁 Struktur Proyek

```
finance-tracker/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts             # Database seeder
├── public/
│   └── uploads/            # File uploads (avatars)
├── src/
│   ├── app/
│   │   ├── (auth)/         # Auth pages (login)
│   │   ├── (dashboard)/    # Dashboard & all CRUD pages
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── layout/         # Sidebar, Header
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts (AppContext)
│   ├── i18n/               # Translations (id, en)
│   ├── lib/                # Utilities (auth, prisma, captcha)
│   └── middleware.ts       # Security headers & auth middleware
├── .env.example            # Environment template
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
└── README.md               # Documentation
```

### 🔐 Catatan Keamanan

1. **Ubah `JWT_SECRET`** di production environment
2. **Gunakan HTTPS** di production untuk HSTS compliance
3. **Ubah password default** setelah instalasi
4. **Backup database** secara berkala melalui menu Settings

---

## English

### About

Finance Tracker is a comprehensive web-based personal financial assistant built with **multi-tenant SaaS architecture**. It helps individuals and organizations manage their finances efficiently with an elegant, futuristic interface.

### Key Features

- **Dashboard** with real-time financial condition widgets
- **Full CRUD** for Budgets, Incomes, Expenses, Debts, Receivables, Income Plans
- **User & Role Management** with granular permissions
- **Profile Editing** with avatar upload and password change
- **Admin Settings** — app name, currency, backup (SQL/ZIP/GZ)
- **Export/Import** data to XLSX and DOCX formats
- **Notification Bell** with mark all read/unread toggle
- **Dark/Light Mode** with smooth transitions
- **6 Color Themes** — Default, Ocean, Sunset, Forest, Midnight, Rose
- **Bilingual** — Indonesian & English, switch without page refresh
- **Collapsible Sidebar** with unique icons for each menu
- **Security CAPTCHA** — 8 chars (uppercase, lowercase, digits) + math challenges
- **OWASP Security Headers** — grade A+ on SecurityHeaders.com & Qualys

### Quick Start

```bash
git clone https://github.com/msalmanfarisi/finance-tracker.git
cd finance-tracker
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:push
npm run db:seed
npm run dev
```

### License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ using Next.js, TailwindCSS & Prisma</p>
</div>

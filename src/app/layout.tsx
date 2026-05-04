import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Finance Tracker - Personal Financial Assistant",
  description: "Comprehensive financial management application for budgets, income, expenses, debts, and receivables tracking",
  keywords: ["finance", "budget", "expense tracker", "income", "debt management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}

// frontend/src/app/layout.js
import "./globals.css";
import { Vazirmatn } from "next/font/google";
import AppShell from "../components/layout/AppShell";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
});

export const metadata = {
  title: "Kabul Asia ERP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${vazirmatn.className} min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

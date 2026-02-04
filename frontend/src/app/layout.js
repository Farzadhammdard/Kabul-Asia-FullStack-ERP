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
    <html lang="fa" dir="rtl">
      <body
        suppressHydrationWarning
        className={`${vazirmatn.className} bg-[#0b1220] text-gray-200 min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_40%),radial-gradient(circle_at_20%_20%,_rgba(251,191,36,0.12),_transparent_35%)]`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

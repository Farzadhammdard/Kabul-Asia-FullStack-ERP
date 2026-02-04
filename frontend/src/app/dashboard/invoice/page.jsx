import { redirect } from "next/navigation";

export default function DashboardInvoiceRedirect() {
  redirect("/invoices");
}

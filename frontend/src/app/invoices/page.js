"use client";
import InvoiceManager from "@/components/finance/InvoiceTable";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function InvoicesPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("invoicesTitle")}</h2>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <InvoiceManager />
        </div>
      </div>
    </div>
  );
}

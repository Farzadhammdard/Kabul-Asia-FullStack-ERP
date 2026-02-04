import InvoiceManager from "@/components/finance/InvoiceTable";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">فاکتورها</h2>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <InvoiceManager />
        </div>
      </div>
    </div>
  );
}

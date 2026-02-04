// frontend/src/components/invoice/InvoiceTable.jsx
export default function InvoiceTable({ invoices }) {
  return (
    <div className="bg-[#0e1627] rounded-xl p-5 mt-6">
      <h3 className="mb-4 text-sm text-gray-300">آخرین فاکتورها</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-white/5">
          <tr>
            <th className="text-right py-2">مشتری</th>
            <th>مبلغ</th>
            <th>تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {invoices?.map((inv) => (
            <tr key={inv.id} className="border-b border-white/5">
              <td className="py-2">{inv.customer}</td>
              <td className="text-yellow-400">
                AFN {inv.total}
              </td>
              <td>{inv.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

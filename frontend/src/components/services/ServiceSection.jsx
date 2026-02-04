"use client";

const mockCards = [
  { id: 1, customer: "ahmad", total: 1500, qty: 50, unit: 30, date: "1402/10/20" },
  { id: 2, customer: "شرکت نظیری", total: 12000, qty: 10, unit: 1200, date: "1402/10/22" },
];

function PencilIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function BadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export default function ServiceSection({ title, tag }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
            {tag?.[0] || "S"}
          </div>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <button className="bg-amber-400/90 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-full">
          + فاکتور جدید
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockCards.map((card) => (
          <div key={card.id} className="rounded-3xl bg-[#0e1627] border border-[#121a2c] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full">ID: #{card.id}</div>
              <button className="w-9 h-9 rounded-full bg-white/5 text-amber-300 flex items-center justify-center">
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="text-lg font-bold text-gray-100">{card.customer}</div>
            <div className="text-xs text-gray-500 mt-1">سرویس: {tag}</div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-400">
              <div>متراژ: {card.qty}</div>
              <div>فی واحد: {card.unit}</div>
              <div className="text-rose-300">تخفیف: 0</div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="text-amber-300 font-bold">AFN {card.total.toLocaleString("fa-AF")}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BadgeIcon className="w-4 h-4" />
                {card.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

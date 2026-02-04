// frontend/src/components/ui/StatsCard.jsx
export default function StatsCard({ title, value }) {
  return (
    <div className="bg-[#0e1627] rounded-xl p-5 flex justify-between items-center shadow">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-bold text-yellow-400 mt-1">
          AFN {value?.toLocaleString()}
        </p>
      </div>

      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
        💰
      </div>
    </div>
  );
}

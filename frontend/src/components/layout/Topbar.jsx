export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 h-14 bg-[#0e1627] border-b border-white/5">
      <div className="text-sm text-gray-300">
        پنل مدیریت کابل آسیا
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">admin</span>
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black text-sm">
          A
        </div>
      </div>
    </header>
  );
}

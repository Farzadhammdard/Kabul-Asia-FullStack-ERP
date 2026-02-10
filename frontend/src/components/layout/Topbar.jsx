"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getUserProfile } from "@/lib/api";

export default function Topbar({ companyName = "" }) {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("theme");
    const savedUser = localStorage.getItem("username");
    const savedDisplay = localStorage.getItem("display_name");
    const savedAvatar = localStorage.getItem("avatar_url");
    if (savedUser) setUsername(savedUser);
    if (savedUser) {
      const perUserDisplay = localStorage.getItem(`display_name:${savedUser}`);
      const perUserAvatar = localStorage.getItem(`avatar_url:${savedUser}`);
      if (perUserDisplay) setDisplayName(perUserDisplay);
      else if (savedDisplay) setDisplayName(savedDisplay);
      if (perUserAvatar) setAvatar(perUserAvatar);
      else if (savedAvatar) setAvatar(savedAvatar);
    } else {
      if (savedDisplay) setDisplayName(savedDisplay);
      if (savedAvatar) setAvatar(savedAvatar);
    }
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const initial = saved || preferred || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    getUserProfile(token)
      .then((data) => {
        const name = data?.display_name || "";
        const avatarUrl = data?.avatar || "";
        setDisplayName(name);
        setAvatar(avatarUrl);
        const userKey = localStorage.getItem("username") || "";
        if (userKey) {
          if (name) localStorage.setItem(`display_name:${userKey}`, name);
          if (avatarUrl) localStorage.setItem(`avatar_url:${userKey}`, avatarUrl);
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    function onProfileUpdate(e) {
      const name = e?.detail?.display_name || localStorage.getItem("display_name") || "";
      const avatarUrl = e?.detail?.avatar || localStorage.getItem("avatar_url") || "";
      setDisplayName(name);
      setAvatar(avatarUrl);
    }
    window.addEventListener("profile:updated", onProfileUpdate);
    return () => window.removeEventListener("profile:updated", onProfileUpdate);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard_query", searchValue || "");
      window.dispatchEvent(new CustomEvent("dashboard:search", { detail: { query: searchValue || "" } }));
    }
    setSearchOpen(false);
    setSearchValue("");
    router.push("/dashboard");
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-[var(--topbar-bg)] border-b border-[var(--border-color)]">
      <div className="text-sm text-[var(--app-text)]">
        {companyName || t("panelTitle")}
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[var(--app-text)] flex items-center justify-center"
            title={t("quickSearch")}
          >
            🔍
          </button>
          {searchOpen && (
            <form
              onSubmit={onSearchSubmit}
              className="absolute left-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl rounded-xl p-2"
            >
              <input
                className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs outline-none"
                placeholder={t("searchPlaceholder")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
              />
            </form>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
          <button
            type="button"
            onClick={() => setLang("fa")}
            className={`text-[10px] px-2 py-1 rounded-full ${lang === "fa" ? "bg-[var(--accent)] text-black" : "text-[var(--app-text)]"}`}
          >
            FA
          </button>
          <button
            type="button"
            onClick={() => setLang("ps")}
            className={`text-[10px] px-2 py-1 rounded-full ${lang === "ps" ? "bg-[var(--accent)] text-black" : "text-[var(--app-text)]"}`}
          >
            PS
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`text-[10px] px-2 py-1 rounded-full ${lang === "en" ? "bg-[var(--accent)] text-black" : "text-[var(--app-text)]"}`}
          >
            EN
          </button>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[var(--app-text)] flex items-center justify-center"
          title={theme === "dark" ? t("themeLight") : t("themeDark")}
        >
          {theme === "dark" ? "☀" : "🌙"}
        </button>
        <span className="text-xs text-[var(--muted)]">{displayName || username || t("userLabel")}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center text-black text-sm overflow-hidden"
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            (displayName || username || "A").trim().slice(0, 1).toUpperCase()
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl rounded-xl p-2 text-sm">
            <a href="/settings/profile" className="block px-3 py-2 rounded hover:bg-black/5">{t("profile")}</a>
            <a href="/settings/company" className="block px-3 py-2 rounded hover:bg-black/5">{t("company")}</a>
            <a href="/settings/users" className="block px-3 py-2 rounded hover:bg-black/5">{t("users")}</a>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("display_name");
                localStorage.removeItem("avatar_url");
                window.location.href = "/login";
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-black/5 text-red-500"
            >
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

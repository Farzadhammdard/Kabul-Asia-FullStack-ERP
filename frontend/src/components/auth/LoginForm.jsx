"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { decodeJwt } from "@/lib/jwt";
import { useI18n } from "@/components/i18n/I18nProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

export default function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [postLoginLoading, setPostLoginLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    let success = false;
    try {
      const res = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(t("loginErrorInvalid"));
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        const payload = decodeJwt(data.access);
        localStorage.setItem("username", payload?.username || username);
        localStorage.setItem("is_staff", payload?.is_staff ? "true" : "false");
        localStorage.setItem("toast_pending", JSON.stringify({ message: t("loginSuccess") || "Login successful" }));
      }
      success = true;
      setPostLoginLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2200));
      router.push("/dashboard");
    } catch (err) {
      setError(t("loginErrorServer"));
    } finally {
      if (!success) setLoading(false);
    }
  }

  return (
    <>
      {postLoginLoading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-card">
            <div className="mx-auto mb-4 text-amber-300">
              <span className="spinner spinner-lg" />
            </div>
            <div className="text-sm text-[var(--muted)]">{t("loginLoading")}</div>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="bg-[#0f172a]/90 p-8 rounded-[32px] w-80 border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-400/80"></div>
      </div>
      <h2 className="text-center mb-1 font-extrabold text-lg">{t("loginTitle")}</h2>
      <p className="text-center text-[10px] text-gray-500 mb-6">{t("loginSubtitle")}</p>

      {error && (
        <div className="mb-3 text-xs text-red-400 bg-red-500/10 p-2 rounded">{error}</div>
      )}

      <input
        className="w-full mb-3 px-4 py-3 rounded-full bg-black/30 outline-none border border-white/10 text-sm"
        placeholder={t("usernamePlaceholder")}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />
      <input
        className="w-full mb-5 px-4 py-3 rounded-full bg-black/30 outline-none border border-white/10 text-sm"
        type="password"
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black py-3 rounded-full font-bold flex items-center justify-center gap-2"
      >
        {loading && <span className="spinner" />}
        {loading ? t("loginLoading") : t("loginButton")}
      </button>
      <div className="mt-4 text-center">
        <span className="text-xs text-[var(--muted)]"> </span>
      </div>
      <p className="text-[10px] text-gray-500 text-center mt-4">POWERED BY ASIA CABLE TECH</p>
      </form>
    </>
  );
}

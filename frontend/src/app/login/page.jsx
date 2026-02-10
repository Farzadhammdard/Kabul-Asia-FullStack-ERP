"use client";
import LoginForm from "@/components/auth/LoginForm";
import { I18nProvider, useI18n } from "@/components/i18n/I18nProvider";

function LoginContent() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_40%),radial-gradient(circle_at_20%_20%,_rgba(251,191,36,0.12),_transparent_35%),radial-gradient(circle_at_80%_70%,_rgba(14,116,144,0.15),_transparent_40%)]">
      <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
        <button
          type="button"
          onClick={() => setLang("fa")}
          className={`text-[10px] px-2 py-1 rounded-full ${lang === "fa" ? "bg-[var(--accent)] text-black" : "text-[var(--app-text)]"}`}
        >
          {t("langFa")}
        </button>
        <button
          type="button"
          onClick={() => setLang("ps")}
          className={`text-[10px] px-2 py-1 rounded-full ${lang === "ps" ? "bg-[var(--accent)] text-black" : "text-[var(--app-text)]"}`}
        >
          {t("langPs")}
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`text-[10px] px-2 py-1 rounded-full ${lang === "en" ? "bg-[var(--accent)] text-black" : "text-[var(--app-text)]"}`}
        >
          {t("langEn")}
        </button>
      </div>
      <LoginForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <I18nProvider>
      <LoginContent />
    </I18nProvider>
  );
}

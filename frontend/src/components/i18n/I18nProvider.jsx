"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DICT, getInitialLang, t as translate, LANGS } from "@/lib/i18n";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("fa");

  useEffect(() => {
    const initial = getInitialLang();
    setLang(initial);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", initial);
    }
  }, []);

  function changeLang(next) {
    if (!LANGS.includes(next)) return;
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", next);
      document.documentElement.setAttribute("lang", next);
    }
  }

  const value = useMemo(() => ({
    lang,
    setLang: changeLang,
    t: (key) => translate(lang, key),
    dict: DICT[lang] || DICT.fa,
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { lang: "fa", setLang: () => {}, t: (key) => key, dict: DICT.fa };
  }
  return ctx;
}

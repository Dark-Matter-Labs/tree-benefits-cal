"use client";

import { LanguageToggle } from "./LanguageToggle";

type Language = "en" | "fr";

interface WorkshopHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "calculator" | "portfolio";
  onTabChange: (tab: "calculator" | "portfolio") => void;
}

export function WorkshopHeader({
  language,
  onLanguageChange,
  activeTab,
  onTabChange
}: WorkshopHeaderProps) {
  return (
    <header className="border-b border-primary-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary-500/30">
            🌲
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                {language === "fr"
                  ? "Calculatrice canadienne des bénéfices des arbres"
                  : "Canadian Tree Benefits Calculator"}
              </h1>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {language === "fr" ? "Prototype atelier" : "Workshop prototype"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === "fr"
                ? "Démonstration de flux pour les municipalités et le FCM"
                : "Demo flow for municipalities and FCM portfolio view"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 p-1 text-xs">
            <button
              type="button"
              onClick={() => onTabChange("calculator")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === "calculator"
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {language === "fr"
                ? "Estimateur de bénéfices"
                : "Benefits estimator"}
            </button>
            <button
              type="button"
              onClick={() => onTabChange("portfolio")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === "portfolio"
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {language === "fr"
                ? "Portefeuille FCM"
                : "FCM portfolio view"}
            </button>
          </nav>
          <LanguageToggle value={language} onChange={onLanguageChange} />
        </div>
      </div>
    </header>
  );
}


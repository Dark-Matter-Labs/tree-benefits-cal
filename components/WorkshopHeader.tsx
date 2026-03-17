"use client";

import { LanguageToggle } from "./LanguageToggle";
import Image from "next/image";
import gcccLogo from "../assets/logo.png";

type Language = "en" | "fr";

interface WorkshopHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "home" | "calculator" | "portfolio";
  onTabChange: (tab: "home" | "calculator" | "portfolio") => void;
}

export function WorkshopHeader({
  language,
  onLanguageChange,
  activeTab,
  onTabChange
}: WorkshopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onTabChange("home")}
            className="flex items-center gap-2 group"
          >
            <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-primary-50 border border-primary-100 shadow-sm flex items-center justify-center">
              <Image
                src={gcccLogo}
                alt={language === "fr" ? "Marque GCCC" : "GCCC mark"}
                className="object-contain"
                sizes="36px"
                fill
              />
            </div>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 leading-tight">
                {language === "fr"
                  ? "Outil d'aide à la création d'une canopée communautaire"
                  : "Community Canopy Benefits Tool"}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
              {language === "fr"
                ? "Version prototype de l'outil de données du GCCC"
                : "Prototype-version of GCCC’s data tool"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => onTabChange("home")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {language === "fr" ? "Accueil" : "Home"}
            </button>
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


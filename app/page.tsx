"use client";

import { useState } from "react";
import { WorkshopHeader } from "@/components/WorkshopHeader";
import { CalculatorSteps } from "@/components/CalculatorSteps";
import { PortfolioDemo } from "@/components/PortfolioDemo";

type Language = "en" | "fr";

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<"calculator" | "portfolio">(
    "calculator"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <WorkshopHeader
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "calculator" ? (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-10">
          <section className="mb-4">
            <p className="text-sm text-slate-600 max-w-3xl">
              {language === "fr"
                ? "Cet outil aide les municipalités à transformer un projet de verdissement en un argumentaire clair pour les demandes de financement : saisir le projet, cadrer la typologie et l’équité, puis générer un résumé d’impacts prêt à intégrer dans un dossier de subvention ou une note au conseil."
                : "This calculator is an MVP of the funding tool: it helps municipalities turn a planting or restoration project into a clear, grant-ready story by capturing core inputs, equity and community impact, then surfacing a concise impact snapshot for applications and council briefs."}
            </p>
          </section>
          <CalculatorSteps language={language} />
        </main>
      ) : (
        <PortfolioDemo language={language} />
      )}
    </div>
  );
}


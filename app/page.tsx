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
                ? "Cette démonstration montre le parcours principal : une municipalité entre un projet, sélectionne les bénéfices pertinents et obtient un aperçu visuel prêt à être intégré dans une demande de subvention."
                : "This demo walks through the core journey: a municipality enters a project, selects the most relevant benefits, and gets a visual summary ready to drop into a grant application or council deck."}
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


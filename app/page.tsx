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
                ? "Transformez votre projet de plantation ou de restauration d’arbres en impacts mesurables. Que ce soit pour des demandes de subvention, des rapports aux parties prenantes, la planification d’investissements futurs ou la communication avec le public, cet outil vous aide à générer des estimations crédibles des bénéfices environnementaux, sanitaires et économiques."
                : "Turn your tree planting or restoration project into measurable impact. Whether you're applying for grants, reporting to stakeholders, planning future investments, or communicating with the public, this tool helps you generate credible estimates of environmental, health, and economic benefits."}
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


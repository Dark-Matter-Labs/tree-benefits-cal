"use client";

import { useState } from "react";
import Image from "next/image";
import { WorkshopHeader } from "@/components/WorkshopHeader";
import { CalculatorSteps } from "@/components/CalculatorSteps";
import { PortfolioDemo } from "@/components/PortfolioDemo";
import gcccHero from "../assets/Woodland_Woodland.png";

type Language = "en" | "fr";

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<"home" | "calculator" | "portfolio">(
    "home"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <WorkshopHeader
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "home" && (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-12 space-y-10">
          <section className="grid gap-6 md:grid-cols-[1.2fr,1fr] items-center">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-semibold text-primary-800 leading-tight">
                {language === "fr"
                  ? "Mesurez les bénéfices de vos canopées communautaires"
                  : "Measure the benefits of your community canopies"}
              </h2>
              <p className="text-sm md:text-base text-slate-700 max-w-xl">
                {language === "fr"
                  ? "Prototype inspiré de l’initiative « Growing Canada’s Community Canopies » du Fonds municipal vert. Explorez comment les projets de plantation d’arbres peuvent générer des bénéfices climatiques, économiques, de santé et d’équité."
                  : "A prototype inspired by the Green Municipal Fund’s Growing Canada’s Community Canopies initiative. Explore how tree planting projects can generate climate, economic, health and equity benefits."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("calculator")}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/40 hover:shadow-lg hover:shadow-primary-500/60 transition"
                >
                  {language === "fr"
                    ? "Ouvrir l’estimateur de bénéfices"
                    : "Open benefits estimator"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("portfolio")}
                  className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-white px-5 py-2.5 text-sm font-medium text-secondary-800 hover:bg-secondary-50 transition"
                >
                  {language === "fr"
                    ? "Voir la vue portefeuille FCM"
                    : "View FCM portfolio snapshot"}
                </button>
              </div>
            </div>
            <div className="relative h-52 md:h-64 rounded-[24px] overflow-hidden border border-slate-200 shadow-md bg-slate-900/5">
              <Image
                src={gcccHero}
                alt={
                  language === "fr"
                    ? "Capture d’écran GCCC avec canopées urbaines"
                    : "GCCC screenshot with urban tree canopies"
                }
                fill
                sizes="(min-width: 768px) 320px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
            </div>
          </section>

          <section className="rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-[#141a16] p-4 md:p-5 space-y-4">
            <h3 className="text-sm md:text-base font-semibold text-[#f0f5f2]">
              {language === "fr"
                ? "Qui est derrière ce prototype ?"
                : "Who is behind this prototype?"}
            </h3>
            <p className="text-xs md:text-sm text-[#c8d5cc]">
              {language === "fr"
                ? "Ce prototype a été conçu pour illustrer comment les municipalités et le FCM pourraient explorer les bénéfices des projets de plantation d’arbres. Il ne reflète pas encore la méthodologie ou les données officielles du Fonds municipal vert."
                : "This prototype is designed to illustrate how municipalities and FCM could explore the benefits of tree planting projects. It does not yet reflect official Green Municipal Fund methodologies or data."}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-[#6b8a77]">
                {language === "fr" ? "Partenaires de conception" : "Design partners"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#1a2420] px-3 py-1 text-[#f0f5f2]">
                <span className="font-semibold">Dark Matter Labs</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#1a2420] px-3 py-1 text-[#f0f5f2]">
                <span className="font-semibold">TreesAI</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  window.open("https://greenmunicipalfund.ca/trees", "_blank")
                }
                className="inline-flex items-center gap-1 rounded-md border border-[#3dd68c] bg-transparent px-3 py-1 text-[11px] font-medium text-[#3dd68c] hover:border-[#5ff0a4] hover:text-[#5ff0a4] transition"
              >
                {language === "fr"
                  ? "En savoir plus sur GCCC"
                  : "Learn more about GCCC"}
              </button>
            </div>
          </section>

          <section
            id="how-to"
            className="rounded-[24px] border border-slate-200 bg-slate-900/2 shadow-sm p-4 md:p-5 space-y-3"
          >
            <h3 className="text-sm md:text-base font-semibold text-primary-800">
              {language === "fr"
                ? "Comment utiliser ce prototype ?"
                : "How to use this prototype"}
            </h3>
            <ol className="list-decimal list-inside text-xs md:text-sm text-slate-700 space-y-1.5">
              <li>
                {language === "fr"
                  ? "Commencez par l’estimateur de bénéfices pour un projet type et explorez les résultats."
                  : "Start with the benefits estimator for a sample project and explore the results."}
              </li>
              <li>
                {language === "fr"
                  ? "Passez ensuite à la vue portefeuille pour voir comment plusieurs projets pourraient être agrégés."
                  : "Then switch to the portfolio view to see how multiple projects might be aggregated."}
              </li>
              <li>
                {language === "fr"
                  ? "Gardez à l’esprit que toutes les valeurs sont des démonstrations d’ordre de grandeur et ne doivent pas être utilisées pour le suivi officiel."
                  : "Keep in mind that all values are order-of-magnitude demonstrations and should not be used for official reporting."}
              </li>
            </ol>
          </section>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("how-to")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-1 rounded-md border border-[#3dd68c] bg-transparent px-4 py-2 text-xs font-semibold text-[#3dd68c] hover:border-[#5ff0a4] hover:text-[#5ff0a4] transition"
            >
              {language === "fr"
                ? "Comment fonctionne ce prototype ?"
                : "How does this prototype work?"}
            </button>
          </div>
        </main>
      )}

      {activeTab === "calculator" && (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-10 space-y-4">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            ← {language === "fr" ? "Retour à l’accueil" : "Back to landing"}
          </button>
          <section className="mb-2">
            <p className="text-sm text-slate-600 max-w-3xl">
              {language === "fr"
                ? "Transformez votre projet de plantation ou de restauration d’arbres en impacts mesurables. Que ce soit pour des demandes de subvention, des rapports aux parties prenantes, la planification d’investissements futurs ou la communication avec le public, cet outil vous aide à générer des estimations crédibles des bénéfices environnementaux, sanitaires et économiques."
                : "Turn your tree planting or restoration project into measurable impact. Whether you're applying for grants, reporting to stakeholders, planning future investments, or communicating with the public, this tool helps you generate credible estimates of environmental, health, and economic benefits."}
            </p>
          </section>
          <CalculatorSteps language={language} />
        </main>
      )}

      {activeTab === "portfolio" && (
        <div className="flex-1">
          <PortfolioDemo language={language} />
        </div>
      )}
    </div>
  );
}


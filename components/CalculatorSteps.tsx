"use client";

import { useState } from "react";
import {
  BenefitResults,
  BenefitCategory,
  MunicipalitySize,
  MunicipalityType,
  Region,
  calculateBenefits
} from "@/lib/benefitCalculator";

type Language = "en" | "fr";

interface CalculatorStepsProps {
  language: Language;
}

const allBenefitCategories: { id: BenefitCategory; labelEn: string; labelFr: string }[] =
  [
    { id: "carbon", labelEn: "Carbon", labelFr: "Carbone" },
    { id: "stormwater", labelEn: "Stormwater", labelFr: "Eaux pluviales" },
    { id: "airQuality", labelEn: "Air quality", labelFr: "Qualité de l’air" },
    { id: "heat", labelEn: "Heat mitigation", labelFr: "Îlot de chaleur" },
    { id: "biodiversity", labelEn: "Biodiversity", labelFr: "Biodiversité" },
    { id: "health", labelEn: "Health", labelFr: "Santé" },
    {
      id: "propertyValue",
      labelEn: "Property value",
      labelFr: "Valeur foncière"
    }
  ];

export function CalculatorSteps({ language }: CalculatorStepsProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [region, setRegion] = useState<Region>("ontario");
  const [municipalitySize, setMunicipalitySize] =
    useState<MunicipalitySize>("medium");
  const [municipalityType, setMunicipalityType] =
    useState<MunicipalityType>("urban");
  const [populationServed, setPopulationServed] = useState(50000);
  const [householdsServed, setHouseholdsServed] = useState(20000);
  const [numberOfTrees, setNumberOfTrees] = useState(500);
  const [projectAreaHa, setProjectAreaHa] = useState(2);
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Tree planting details
  const [deciduousPercent, setDeciduousPercent] = useState(60);
  const [evergreenPercent, setEvergreenPercent] = useState(40);
  const [improvedGreenSpaceHa, setImprovedGreenSpaceHa] = useState(0);
  const [newTreesInFootpath, setNewTreesInFootpath] = useState(0);
  const [hasSustainableWaterSystems, setHasSustainableWaterSystems] = useState(false);

  // Optional contextual parameters (lower priority / advanced)
  const [showAdvancedContext, setShowAdvancedContext] = useState(false);
  const [populationDensity, setPopulationDensity] = useState(3200); // people / km²
  const [baselineCanopy, setBaselineCanopy] = useState(18); // %
  const [heatVulnerability, setHeatVulnerability] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [floodRisk, setFloodRisk] = useState<"low" | "medium" | "high">("medium");

  const [selectedBenefits, setSelectedBenefits] = useState<BenefitCategory[]>([
    "carbon",
    "stormwater",
    "health",
    "heat"
  ]);

  // Benefit-specific details
  const [carbonDetails, setCarbonDetails] = useState({
    baselineEmissions: 0, // tCO₂e/year
    carbonPrice: 65 // $/tCO₂e
  });
  const [stormwaterDetails, setStormwaterDetails] = useState({
    imperviousSurfaceArea: 0, // ha
    averageRainfall: 1000, // mm/year
    infrastructureCostPerLiter: 0.001 // $/L
  });
  const [healthDetails, setHealthDetails] = useState({
    proximityToResidential: true,
    accessibilityScore: 7 // 1-10
  });
  const [heatDetails, setHeatDetails] = useState({
    currentMaxTemp: 35, // °C
    targetTempReduction: 2 // °C
  });
  const [airQualityDetails, setAirQualityDetails] = useState({
    proximityToRoads: true,
    trafficVolume: "medium" as "low" | "medium" | "high"
  });
  const [biodiversityDetails, setBiodiversityDetails] = useState({
    nativeSpeciesPercent: 80, // %
    habitatConnectivity: true
  });
  const [propertyValueDetails, setPropertyValueDetails] = useState({
    adjacentProperties: 0,
    averagePropertyValue: 500000 // $
  });

  const [results, setResults] = useState<BenefitResults | null>(null);

  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  const handleToggleBenefit = (id: BenefitCategory) => {
    setSelectedBenefits(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleCalculate = () => {
    const res = calculateBenefits({
      region,
      municipalitySize,
      municipalityType,
      populationServed,
      householdsServed,
      numberOfTrees,
      projectAreaHa,
      year
    });
    setResults(res);
    setStep(5);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1.4fr]">
      <section className="rounded-2xl bg-white border border-slate-200 p-5 lg:p-6 shadow-md">
        <header className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t("Project setup", "Configuration du projet")}
            </h2>
            <p className="text-xs text-slate-600">
              {t(
                "5 steps to estimate your project benefits.",
                "5 étapes pour estimer les bénéfices de votre projet."
              )}
            </p>
          </div>
          <ol className="flex items-center gap-2 text-xs">
            {[1, 2, 3, 4, 5].map(i => (
              <li
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium ${
                  step === i
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500 text-white shadow-sm"
                    : step > i
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "border-slate-300 text-slate-400 bg-slate-50"
                }`}
              >
                {i}
              </li>
            ))}
          </ol>
        </header>

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {t("Context", "Contexte")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Region", "Région")}
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value as Region)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="atlantic">
                    {t("Atlantic", "Atlantique")}
                  </option>
                  <option value="quebec">Québec</option>
                  <option value="ontario">Ontario</option>
                  <option value="prairies">
                    {t("Prairies", "Prairies")}
                  </option>
                  <option value="bc">
                    {t("British Columbia", "Colombie-Britannique")}
                  </option>
                  <option value="territories">
                    {t("Territories", "Territoires")}
                  </option>
                </select>
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Used to set climate and carbon defaults.",
                    "Utilisé pour définir les paramètres climatiques et de carbone."
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Municipality size", "Taille de la municipalité")}
                </label>
                <select
                  value={municipalitySize}
                  onChange={e =>
                    setMunicipalitySize(e.target.value as MunicipalitySize)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="small">
                    {t("Small (<25k)", "Petite (<25k)")}
                  </option>
                  <option value="medium">
                    {t("Medium (25k–200k)", "Moyenne (25k–200k)")}
                  </option>
                  <option value="large">
                    {t("Large (>200k)", "Grande (>200k)")}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Context", "Contexte")}
                </label>
                <select
                  value={municipalityType}
                  onChange={e =>
                    setMunicipalityType(e.target.value as MunicipalityType)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="urban">
                    {t("Urban", "Urbain")}
                  </option>
                  <option value="rural">
                    {t("Rural", "Rural")}
                  </option>
                  <option value="northern">
                    {t("Northern", "Nordique")}
                  </option>
                  <option value="remote">
                    {t("Remote", "Éloigné")}
                  </option>
                  <option value="indigenous">
                    {t("Indigenous community", "Communauté autochtone")}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Year of planting completion",
                    "Année de fin de plantation"
                  )}
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value) || year)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Population served (approx pop living <500m)",
                    "Population desservie (population vivant à <500 m, approx.)"
                  )}
                </label>
                <input
                  type="number"
                  value={populationServed}
                  onChange={e =>
                    setPopulationServed(
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Households served (approx pop living <500m)",
                    "Ménages desservis (population vivant à <500 m, approx.)"
                  )}
                </label>
                <input
                  type="number"
                  value={householdsServed}
                  onChange={e =>
                    setHouseholdsServed(
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>
            </div>

            {/* Optional advanced context parameters */}
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {t(
                      "Refine context assumptions (optional)",
                      "Affiner les hypothèses de contexte (optionnel)"
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t(
                      "These parameters sit behind the regional defaults and can be tweaked when you have better local data.",
                      "Ces paramètres se trouvent derrière les valeurs régionales par défaut et peuvent être ajustés si vous disposez de données locales plus précises."
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedContext(prev => !prev)}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {showAdvancedContext
                    ? t("Hide details", "Masquer les détails")
                    : t("Show details", "Afficher les détails")}
                </button>
              </div>

              {showAdvancedContext && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      {t(
                        "Population density (people/km²)",
                        "Densité de population (pers./km²)"
                      )}
                    </label>
                    <input
                      type="number"
                      value={populationDensity}
                      onChange={e =>
                        setPopulationDensity(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      {t("Baseline canopy cover (%)", "Couvert forestier de base (%)")}
                    </label>
                    <input
                      type="number"
                      value={baselineCanopy}
                      onChange={e =>
                        setBaselineCanopy(
                          Math.min(100, Math.max(0, Number(e.target.value) || 0))
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      {t("Heat vulnerability", "Vulnérabilité à la chaleur")}
                    </label>
                    <select
                      value={heatVulnerability}
                      onChange={e =>
                        setHeatVulnerability(
                          e.target.value as "low" | "medium" | "high"
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                    >
                      <option value="low">{t("Low", "Faible")}</option>
                      <option value="medium">{t("Medium", "Moyenne")}</option>
                      <option value="high">{t("High", "Élevée")}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      {t("Flood / stormwater risk", "Risque d’inondation / eaux pluviales")}
                    </label>
                    <select
                      value={floodRisk}
                      onChange={e =>
                        setFloodRisk(e.target.value as "low" | "medium" | "high")
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                    >
                      <option value="low">{t("Low", "Faible")}</option>
                      <option value="medium">{t("Medium", "Moyenne")}</option>
                      <option value="high">{t("High", "Élevé")}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 transition-all"
              >
                {t("Next: Trees", "Suivant : Arbres")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {t("Tree planting", "Plantation d’arbres")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Number of trees and woody shrubs",
                    "Nombre d’arbres et d’arbustes ligneux"
                  )}
                </label>
                <input
                  type="number"
                  value={numberOfTrees}
                  onChange={e =>
                    setNumberOfTrees(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Use your best estimate – the tool will scale results.",
                    "Utilisez votre meilleure estimation – l’outil ajustera les résultats."
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Area of tree Planting (Ha)", "Superficie de plantation d'arbres (Ha)")}
                </label>
                <input
                  type="number"
                  value={projectAreaHa}
                  onChange={e =>
                    setProjectAreaHa(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>
            </div>

            {/* Additional tree planting details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Tree species composition", "Composition des espèces d'arbres")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">
                      {t("Deciduous (%)", "Feuillus (%)")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={deciduousPercent}
                      onChange={e => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setDeciduousPercent(val);
                        setEvergreenPercent(100 - val);
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">
                      {t("Evergreen (%)", "Conifères (%)")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={evergreenPercent}
                      onChange={e => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setEvergreenPercent(val);
                        setDeciduousPercent(100 - val);
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Total should equal 100%",
                    "Le total doit être égal à 100%"
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Improved green space (Ha)", "Espace vert amélioré (Ha)")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={improvedGreenSpaceHa}
                  onChange={e =>
                    setImprovedGreenSpaceHa(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Area of green space improved as part of this project",
                    "Superficie d'espace vert améliorée dans le cadre de ce projet"
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("New trees in footpath", "Nouveaux arbres dans les trottoirs")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={newTreesInFootpath}
                  onChange={e =>
                    setNewTreesInFootpath(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Number of trees planted in footpaths/sidewalks",
                    "Nombre d'arbres plantés dans les trottoirs"
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Sustainable water systems",
                    "Systèmes d'eau durables"
                  )}
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSustainableWaterSystems}
                      onChange={e => setHasSustainableWaterSystems(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t(
                        "Project combined with sustainable water systems for irrigation or drainage",
                        "Projet combiné avec des systèmes d'eau durables pour l'irrigation ou le drainage"
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-600 hover:text-slate-900 transition"
              >
                {t("Back to context", "Retour au contexte")}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 transition-all"
              >
                {t(
                  "Next: Benefit categories",
                  "Suivant : Catégories de bénéfices"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
              {t("Benefit focus", "Bénéfices ciblés")}
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                "Select the benefit categories that are most relevant for your funder or council.",
                "Sélectionnez les catégories de bénéfices les plus pertinentes pour votre bailleur de fonds ou votre conseil."
              )}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allBenefitCategories.map(cat => {
                const selected = selectedBenefits.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleBenefit(cat.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                      selected
                        ? "border-primary-500 bg-primary-50 text-primary-900 font-medium shadow-sm"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-primary-400 hover:bg-primary-50/50"
                    }`}
                  >
                    <div className="font-medium">
                      {language === "fr" ? cat.labelFr : cat.labelEn}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-600 hover:text-slate-900 transition"
              >
                {t("Back to trees", "Retour aux arbres")}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={selectedBenefits.length === 0}
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Next: Benefit details", "Suivant : Détails des bénéfices")}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {t("Benefit details", "Détails des bénéfices")}
            </h3>
            <p className="text-xs text-slate-600">
              {t(
                "Provide additional details for the selected benefit categories to refine calculations.",
                "Fournissez des détails supplémentaires pour les catégories de bénéfices sélectionnées afin d'affiner les calculs."
              )}
            </p>

            <div className="space-y-6">
              {selectedBenefits.includes("carbon") && (
                <div className="rounded-xl border border-primary-200 bg-primary-50/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-primary-900 uppercase tracking-wide">
                    {t("Carbon sequestration", "Séquestration du carbone")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Baseline emissions (tCO₂e/year)", "Émissions de base (tCO₂e/an)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={carbonDetails.baselineEmissions}
                        onChange={e =>
                          setCarbonDetails(prev => ({
                            ...prev,
                            baselineEmissions: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      />
                      <p className="text-[11px] text-slate-500 italic">
                        {t("Current annual emissions in project area", "Émissions annuelles actuelles dans la zone du projet")}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Carbon price ($/tCO₂e)", "Prix du carbone ($/tCO₂e)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={carbonDetails.carbonPrice}
                        onChange={e =>
                          setCarbonDetails(prev => ({
                            ...prev,
                            carbonPrice: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      />
                      <p className="text-[11px] text-slate-500 italic">
                        {t("Canadian carbon pricing (default: $65)", "Tarification du carbone au Canada (par défaut : 65 $)")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("stormwater") && (
                <div className="rounded-xl border border-secondary-200 bg-secondary-50/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-secondary-900 uppercase tracking-wide">
                    {t("Stormwater management", "Gestion des eaux pluviales")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Impervious surface area (Ha)", "Superficie imperméable (Ha)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stormwaterDetails.imperviousSurfaceArea}
                        onChange={e =>
                          setStormwaterDetails(prev => ({
                            ...prev,
                            imperviousSurfaceArea: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Average annual rainfall (mm)", "Précipitations annuelles moyennes (mm)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stormwaterDetails.averageRainfall}
                        onChange={e =>
                          setStormwaterDetails(prev => ({
                            ...prev,
                            averageRainfall: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Infrastructure cost per liter ($/L)", "Coût d'infrastructure par litre ($/L)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={stormwaterDetails.infrastructureCostPerLiter}
                        onChange={e =>
                          setStormwaterDetails(prev => ({
                            ...prev,
                            infrastructureCostPerLiter: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition"
                      />
                      <p className="text-[11px] text-slate-500 italic">
                        {t("Cost of managing stormwater through infrastructure", "Coût de gestion des eaux pluviales par l'infrastructure")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("health") && (
                <div className="rounded-xl border border-accent-200 bg-accent-50/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-accent-900 uppercase tracking-wide">
                    {t("Health & well-being", "Santé et bien-être")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={healthDetails.proximityToResidential}
                          onChange={e =>
                            setHealthDetails(prev => ({
                              ...prev,
                              proximityToResidential: e.target.checked
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-300 text-accent-600 focus:ring-2 focus:ring-accent-500"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {t("Proximity to residential areas", "Proximité des zones résidentielles")}
                        </span>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Accessibility score (1-10)", "Score d'accessibilité (1-10)")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={healthDetails.accessibilityScore}
                        onChange={e =>
                          setHealthDetails(prev => ({
                            ...prev,
                            accessibilityScore: Math.min(10, Math.max(1, Number(e.target.value) || 1))
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("heat") && (
                <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
                    {t("Heat island mitigation", "Atténuation des îlots de chaleur")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Current max temperature (°C)", "Température maximale actuelle (°C)")}
                      </label>
                      <input
                        type="number"
                        value={heatDetails.currentMaxTemp}
                        onChange={e =>
                          setHeatDetails(prev => ({
                            ...prev,
                            currentMaxTemp: Number(e.target.value) || 0
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Target temperature reduction (°C)", "Réduction cible de la température (°C)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={heatDetails.targetTempReduction}
                        onChange={e =>
                          setHeatDetails(prev => ({
                            ...prev,
                            targetTempReduction: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("airQuality") && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                    {t("Air quality improvement", "Amélioration de la qualité de l'air")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={airQualityDetails.proximityToRoads}
                          onChange={e =>
                            setAirQualityDetails(prev => ({
                              ...prev,
                              proximityToRoads: e.target.checked
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {t("Proximity to major roads", "Proximité des routes principales")}
                        </span>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Traffic volume", "Volume de trafic")}
                      </label>
                      <select
                        value={airQualityDetails.trafficVolume}
                        onChange={e =>
                          setAirQualityDetails(prev => ({
                            ...prev,
                            trafficVolume: e.target.value as "low" | "medium" | "high"
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="low">{t("Low", "Faible")}</option>
                        <option value="medium">{t("Medium", "Moyen")}</option>
                        <option value="high">{t("High", "Élevé")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("biodiversity") && (
                <div className="rounded-xl border border-green-200 bg-green-50/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-green-900 uppercase tracking-wide">
                    {t("Biodiversity & habitat", "Biodiversité et habitat")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Native species percentage (%)", "Pourcentage d'espèces indigènes (%)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={biodiversityDetails.nativeSpeciesPercent}
                        onChange={e =>
                          setBiodiversityDetails(prev => ({
                            ...prev,
                            nativeSpeciesPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0))
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer pt-6">
                        <input
                          type="checkbox"
                          checked={biodiversityDetails.habitatConnectivity}
                          onChange={e =>
                            setBiodiversityDetails(prev => ({
                              ...prev,
                              habitatConnectivity: e.target.checked
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {t("Enhances habitat connectivity", "Améliore la connectivité de l'habitat")}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("propertyValue") && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                    {t("Property value impact", "Impact sur la valeur foncière")}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Adjacent properties", "Propriétés adjacentes")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={propertyValueDetails.adjacentProperties}
                        onChange={e =>
                          setPropertyValueDetails(prev => ({
                            ...prev,
                            adjacentProperties: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Average property value ($)", "Valeur moyenne des propriétés ($)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={propertyValueDetails.averagePropertyValue}
                        onChange={e =>
                          setPropertyValueDetails(prev => ({
                            ...prev,
                            averagePropertyValue: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-slate-600 hover:text-slate-900 transition"
              >
                {t("Back to benefit categories", "Retour aux catégories de bénéfices")}
              </button>
              <button
                type="button"
                onClick={handleCalculate}
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 transition-all"
              >
                {t("Calculate benefits", "Calculer les bénéfices")}
              </button>
            </div>
          </div>
        )}

        {step === 5 && results && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {t("Summary", "Résumé")}
            </h3>
            <p className="text-xs text-slate-600">
              {t(
                "These figures are illustrative demo values for workshop purposes.",
                "Ces valeurs sont illustratives pour les besoins de l’atelier."
              )}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedBenefits.includes("carbon") && (
                <div className="rounded-xl border border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
                    {t("Carbon", "Carbone")}
                  </h4>
                  <p className="text-lg font-bold text-primary-900">
                    {results.total.carbonTonnes.toFixed(1)} tCO₂e /{" "}
                    {t("year (approx.)", "an (approx.)")}
                  </p>
                  <p className="text-sm text-primary-700 mt-1 font-medium">
                    ≈ $
                    {results.total.carbonValue.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    {t("carbon value", "valeur carbone")}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-600">
                    {t(
                      "Based on simplified Canadian carbon price assumptions.",
                      "Basé sur des hypothèses simplifiées du prix du carbone au Canada."
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("stormwater") && (
                <div className="rounded-xl border border-secondary-300 bg-gradient-to-br from-secondary-50 to-secondary-100/50 p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-secondary-700 uppercase tracking-wide mb-2">
                    {t("Stormwater", "Eaux pluviales")}
                  </h4>
                  <p className="text-lg font-bold text-secondary-900">
                    {results.total.stormwaterLitres.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    L
                  </p>
                  <p className="text-sm text-secondary-700 mt-1 font-medium">
                    ≈ $
                    {results.total.stormwaterValue.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    {t(
                      "avoided infrastructure",
                      "infrastructure évitée (approx.)"
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("health") && (
                <div className="rounded-xl border border-accent-300 bg-gradient-to-br from-accent-50 to-accent-100/50 p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-accent-700 uppercase tracking-wide mb-2">
                    {t("Health & well-being", "Santé et bien-être")}
                  </h4>
                  <p className="text-lg font-bold text-accent-900">
                    $
                    {results.total.healthSavings.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    {t("per year (proxy)", "par an (proxy)")}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {t(
                      "Order-of-magnitude proxy based on Canadian health literature.",
                      "Proxy d’ordre de grandeur basé sur la littérature canadienne en santé."
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("propertyValue") && (
                <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                    {t("Property value", "Valeur foncière")}
                  </h4>
                  <p className="text-lg font-bold text-amber-900">
                    $
                    {results.total.propertyValueIncrease.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 0
                      }
                    )}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {t(
                      "Indicative uplift in adjacent property value.",
                      "Hausse indicative de la valeur des propriétés adjacentes."
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("heat") && (
                <div className="rounded-xl border border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
                    {t("Urban heat", "Îlots de chaleur urbains")}
                  </h4>
                  <p className="text-lg font-bold text-orange-900">
                    −
                    {results.total.heatIslandReductionDegC.toFixed(2)}°C
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {t(
                      "Illustrative cooling effect over the project footprint.",
                      "Effet rafraîchissant illustratif sur l’emprise du projet."
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                  {t("Per capita carbon", "Carbone par habitant")}
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  {results.perCapita.carbonTonnes.toFixed(3)} tCO₂e
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                  {t(
                    "Per capita value (carbon)",
                    "Valeur par habitant (carbone)"
                  )}
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  $
                  {results.perCapita.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                  {t(
                    "Per household value (carbon)",
                    "Valeur par ménage (carbone)"
                  )}
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  $
                  {results.perHousehold.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-xs text-slate-600 hover:text-slate-900 transition"
              >
                {t(
                  "Adjust benefit details",
                  "Ajuster les détails des bénéfices"
                )}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition"
              >
                {t("Print / export", "Imprimer / exporter")}
              </button>
            </div>

            {/* Simple benefit mix visualization (pie + bars) */}
            <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr,1.5fr] items-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {t("Benefit mix (relative)", "Répartition des bénéfices (relative)")}
                </h4>
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-40 h-40">
                    {/* Carbon segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#carbon)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray="40 188.4"
                      strokeDashoffset="0"
                    />
                    {/* Stormwater segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#storm)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray="35 193.4"
                      strokeDashoffset="-40"
                    />
                    {/* Health segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#health)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray="25 203.4"
                      strokeDashoffset="-75"
                    />
                    {/* Biodiversity segment */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#biodiv)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray="20 208.4"
                      strokeDashoffset="-100"
                    />
                    <defs>
                      <linearGradient id="carbon" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b7a57" />
                        <stop offset="100%" stopColor="#2d6246" />
                      </linearGradient>
                      <linearGradient id="storm" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2a5d84" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="health" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a67c52" />
                        <stop offset="100%" stopColor="#8f6844" />
                      </linearGradient>
                      <linearGradient id="biodiv" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#16a34a" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                    </defs>
                    <text
                      x="60"
                      y="60"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-800 text-[10px] font-semibold"
                    >
                      {t("Illustrative mix", "Répartition illustrative")}
                    </text>
                  </svg>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 text-center">
                  {t(
                    "Indicative share of physical and financial benefits across categories.",
                    "Part indicative des bénéfices physiques et financiers par catégorie."
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {t("Benefit groups comparison", "Comparaison des groupes de bénéfices")}
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700">
                        {t("Climate / carbon", "Climat / carbone")}
                      </span>
                      <span className="text-slate-500">
                        {t("strong", "fort")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-2 w-4/5 bg-primary-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700">
                        {t("Stormwater / flooding", "Eaux pluviales / inondations")}
                      </span>
                      <span className="text-slate-500">
                        {t("medium", "moyen")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-2 w-2/3 bg-secondary-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700">
                        {t("Health / equity", "Santé / équité")}
                      </span>
                      <span className="text-slate-500">
                        {t("medium", "moyen")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-2 w-1/2 bg-accent-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700">
                        {t("Biodiversity", "Biodiversité")}
                      </span>
                      <span className="text-slate-500">
                        {t("emerging", "émergent")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-2 w-2/5 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-primary-200 bg-gradient-to-b from-primary-50 to-white p-5 shadow-md">
          <h3 className="text-sm font-semibold text-primary-900 mb-1">
            {t("Grant-ready snapshot", "Résumé prêt pour la demande")}
          </h3>
          <p className="text-xs text-slate-700 mb-4">
            {t(
              "Use this page live in your workshop to walk municipalities from inputs to a persuasive, visual story of benefits.",
              "Utilisez cette page en direct lors de l’atelier pour guider les municipalités des données d’entrée vers un récit visuel convaincant des bénéfices."
            )}
          </p>
          <ul className="space-y-1.5 text-[11px] text-slate-700">
            <li>
              •{" "}
              {t(
                "Highlight small-community impact with per-capita metrics.",
                "Mettez en valeur l’impact des petites collectivités grâce aux indicateurs par habitant."
              )}
            </li>
            <li>
              •{" "}
              {t(
                "Toggle benefit categories to match different funders.",
                "Activez ou désactivez des catégories selon les exigences des bailleurs de fonds."
              )}
            </li>
            <li>
              •{" "}
              {t(
                "Explain that values are illustrative and will be refined with the peer-reviewed methodology.",
                "Expliquez que les valeurs sont indicatives et seront affinées avec la méthodologie examinée par les pairs."
              )}
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center rounded-full border border-dashed border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {t(
              "COMPARISON ANGLE · What if this same area stayed as turf grass?",
              "ANGLE DE COMPARAISON · Et si cette même superficie restait en gazon?"
            )}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {t("Edit inputs and re-run", "Modifier les intrants et relancer")}
          </button>
        </div>
      </aside>
    </div>
  );
}


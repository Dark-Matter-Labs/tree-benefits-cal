"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BenefitResults,
  BenefitCategory,
  MunicipalitySize,
  Region,
  calculateBenefits
} from "@/lib/benefitCalculator";
import woodlandIllustration from "../assets/Woodland_Woodland.png";
import pocketParkIllustration from "../assets/Pocket Park.png";
import restorationIllustration from "../assets/Vacant and Derelict.png";
import streetTreesIllustration from "../assets/Street Trees.png";
import parkTreesIllustration from "../assets/Park Trees .png";
import wetlandIllustration from "../assets/ wetland.png";
import tinyForestIllustration from "../assets/Tiny forest_Tiny Forest.png";
import greenWallIllustration from "../assets/Green Wall-34.png";

type Language = "en" | "fr";

interface CalculatorStepsProps {
  language: Language;
}

type ProjectTypology =
  | "communityWideUrbanPlanting"
  | "forestRestoration"
  | "localizedPlanting";

type SupportedActivity =
  | "streetTrees"
  | "urbanLowCanopy"
  | "parkTrees"
  | "riparian"
  | "forestRestorationActivity";

const canadianMunicipalities: {
  name: string;
  province: string;
  region: Region;
}[] = [
  { name: "Halifax", province: "NS", region: "atlantic" },
  { name: "Charlottetown", province: "PE", region: "atlantic" },
  { name: "St. John's", province: "NL", region: "atlantic" },
  { name: "Moncton", province: "NB", region: "atlantic" },
  { name: "Québec City", province: "QC", region: "quebec" },
  { name: "Montréal", province: "QC", region: "quebec" },
  { name: "Gatineau", province: "QC", region: "quebec" },
  { name: "Toronto", province: "ON", region: "ontario" },
  { name: "Ottawa", province: "ON", region: "ontario" },
  { name: "Hamilton", province: "ON", region: "ontario" },
  { name: "Winnipeg", province: "MB", region: "prairies" },
  { name: "Saskatoon", province: "SK", region: "prairies" },
  { name: "Calgary", province: "AB", region: "prairies" },
  { name: "Edmonton", province: "AB", region: "prairies" },
  { name: "Vancouver", province: "BC", region: "bc" },
  { name: "Victoria", province: "BC", region: "bc" },
  { name: "Whitehorse", province: "YT", region: "territories" },
  { name: "Yellowknife", province: "NT", region: "territories" },
  { name: "Iqaluit", province: "NU", region: "territories" }
];

function normalizeMunicipalityName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function inferRegionFromMunicipality(name: string): Region | null {
  const normalized = normalizeMunicipalityName(name);
  const match = canadianMunicipalities.find(
    m => normalizeMunicipalityName(m.name) === normalized
  );
  return match ? match.region : null;
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
  const [projectName, setProjectName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const [municipalityIsCustom, setMunicipalityIsCustom] = useState(false);
  const [region, setRegion] = useState<Region>("ontario");
  const [municipalitySize, setMunicipalitySize] =
    useState<MunicipalitySize>("medium");
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

  // Project typology & activities
  const [projectTypology, setProjectTypology] =
    useState<ProjectTypology | null>(null);
  const [supportedActivities, setSupportedActivities] = useState<
    SupportedActivity[]
  >([]);

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
    pedestrianActivity: "moderate" as "low" | "moderate" | "high"
  });
  const [heatDetails, setHeatDetails] = useState({
    currentMaxTemp: 35, // °C
    targetTempReduction: 2 // °C
  });
  const [airQualityDetails, setAirQualityDetails] = useState({
    trafficVolume: "medium" as "low" | "medium" | "high",
    noiseLevel: "moderate" as "low" | "moderate" | "high"
  });
  const [biodiversityDetails, setBiodiversityDetails] = useState({
    nativeSpeciesPercent: 80, // %
    habitatConnectivity: true
  });
  const [propertyValueDetails, setPropertyValueDetails] = useState({
    adjacentProperties: 0,
    averagePropertyValue: 500000 // $
  });

  // Community impact & equity
  const [communityImpactScope, setCommunityImpactScope] = useState<
    "site" | "neighbourhood" | "multiNeighbourhood" | "cityWide"
  >("neighbourhood");
  const [equityFocusLevel, setEquityFocusLevel] = useState<
    "none" | "emerging" | "strong"
  >("emerging");
  const [priorityGroups, setPriorityGroups] = useState<string[]>([]);

  // Project story & costs (optional)
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCapitalCost, setProjectCapitalCost] = useState<number | null>(
    null
  );
  const [projectAnnualCost, setProjectAnnualCost] = useState<number | null>(
    null
  );

  // Typology-specific contextual questions (optional, for future use)
  const [communitySitesCount, setCommunitySitesCount] = useState<number | null>(
    null
  );
  const [forestRestorationAreaHa, setForestRestorationAreaHa] = useState<
    number | null
  >(null);
  const [localizedSiteContext, setLocalizedSiteContext] = useState("");
  const [streetLengthKm, setStreetLengthKm] = useState<number | null>(null);
  const [riparianLengthKm, setRiparianLengthKm] = useState<number | null>(null);
  const [parkCount, setParkCount] = useState<number | null>(null);

  // Turf vs tree comparison modal
  const [showTurfComparison, setShowTurfComparison] = useState(false);
  const [treeSharePercent, setTreeSharePercent] = useState(100);

  const [results, setResults] = useState<BenefitResults | null>(null);

  // Derived mixes and comparison helpers (only used when results exist)
  let valueMix:
    | null
    | {
        carbon: number;
        stormwater: number;
        health: number;
        property: number;
        total: number;
      } = null;

  let groupScores:
    | null
    | {
        climate: number;
        water: number;
        health: number;
        biodiversity: number;
        max: number;
      } = null;

  let turfScenario:
    | null
    | {
        carbonTonnes: number;
        stormwaterLitres: number;
        healthSavings: number;
        propertyValueIncrease: number;
        heatIslandReductionDegC: number;
      } = null;

  if (results) {
    const carbonValue = results.total.carbonValue;
    const stormValue = results.total.stormwaterValue;
    const healthValue = results.total.healthSavings;
    const propertyValue = results.total.propertyValueIncrease;
    const totalValue =
      carbonValue + stormValue + healthValue + propertyValue || 1;

    valueMix = {
      carbon: carbonValue,
      stormwater: stormValue,
      health: healthValue,
      property: propertyValue,
      total: totalValue
    };

    const climateScore = results.total.carbonTonnes;
    const waterScore = results.total.stormwaterLitres / 1_000_000;
    const healthScore = results.total.healthSavings / 1_000;
    const biodiversityScore = biodiversityDetails.nativeSpeciesPercent / 10;
    const maxScore = Math.max(
      1,
      climateScore,
      waterScore,
      healthScore,
      biodiversityScore
    );

    groupScores = {
      climate: climateScore,
      water: waterScore,
      health: healthScore,
      biodiversity: biodiversityScore,
      max: maxScore
    };

    // Very simplified "turf grass" baseline as a fraction of tree scenario
    turfScenario = {
      carbonTonnes: results.total.carbonTonnes * 0.25,
      stormwaterLitres: results.total.stormwaterLitres * 0.3,
      healthSavings: results.total.healthSavings * 0.4,
      propertyValueIncrease: results.total.propertyValueIncrease * 0.3,
      heatIslandReductionDegC: results.total.heatIslandReductionDegC * 0.15
    };
  }

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
    <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1.4fr] relative">
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
              {t("Project basics", "Informations de base sur le projet")}
            </h3>
            <p className="text-xs text-slate-600">
              {t(
                "Tell us where and for whom this project is happening. This helps the tool scale impacts to the right community context.",
                "Indiquez où le projet a lieu et qui il touche. Cela aide l’outil à adapter les impacts au bon contexte communautaire."
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-700">
                  {t("Project name", "Nom du projet")}
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder={t(
                    "Example: Main Street Heat Relief Canopy",
                    "Exemple : Canopée de rafraîchissement de la rue Principale"
                  )}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Municipality", "Municipalité")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={municipalityQuery}
                    onChange={e => {
                      const value = e.target.value;
                      setMunicipalityQuery(value);
                      setMunicipality(value);
                      if (!value) {
                        setMunicipalityIsCustom(false);
                        setRegion("ontario");
                        return;
                      }
                      const inferred = inferRegionFromMunicipality(value);
                      if (inferred) {
                        setRegion(inferred);
                        setMunicipalityIsCustom(false);
                      } else {
                        setMunicipalityIsCustom(true);
                      }
                    }}
                    placeholder={t(
                      "Start typing to search Canadian municipalities",
                      "Commencez à taper pour rechercher des municipalités canadiennes"
                    )}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    aria-autocomplete="list"
                    aria-expanded={municipalityQuery.length > 1}
                  />
                  {municipalityQuery.length > 1 && (
                    <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg text-sm">
                      {canadianMunicipalities
                        .filter(m =>
                          normalizeMunicipalityName(m.name).includes(
                            normalizeMunicipalityName(municipalityQuery)
                          )
                        )
                        .slice(0, 8)
                        .map(m => (
                          <button
                            key={`${m.name}-${m.province}`}
                            type="button"
                            onClick={() => {
                              const label = m.name;
                              setMunicipality(label);
                              setMunicipalityQuery(label);
                              setRegion(m.region);
                              setMunicipalityIsCustom(false);
                            }}
                            className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-primary-50"
                          >
                            <span className="text-slate-900">{m.name}</span>
                            <span className="text-[11px] text-slate-500">
                              {m.province}
                            </span>
                          </button>
                        ))}
                      {canadianMunicipalities.filter(m =>
                        normalizeMunicipalityName(m.name).includes(
                          normalizeMunicipalityName(municipalityQuery)
                        )
                      ).length === 0 && (
                        <div className="px-3 py-1.5 text-[11px] text-slate-500">
                          {t(
                            "No match found – you can still use your municipality name.",
                            "Aucune correspondance – vous pouvez quand même utiliser le nom de votre municipalité."
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  {municipalityIsCustom
                    ? t(
                        "We’ll apply regional defaults based on national averages for now.",
                        "Nous appliquerons pour l’instant des valeurs par défaut régionales basées sur des moyennes nationales."
                      )
                    : t(
                        "Used to set climate and carbon defaults automatically by region.",
                        "Utilisé pour définir automatiquement les paramètres climatiques et de carbone par région."
                      )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t("Affected community size", "Taille de la communauté touchée")}
                </label>
                <select
                  value={municipalitySize}
                  onChange={e =>
                    setMunicipalitySize(e.target.value as MunicipalitySize)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="small">
                    {t("Smaller catchment (up to ~10k people)", "Petite zone de desserte (jusqu’à ~10k personnes)")}
                  </option>
                  <option value="medium">
                    {t("Neighbourhood scale (~10k–100k)", "Échelle de quartier (~10k–100k)")}
                  </option>
                  <option value="large">
                    {t("City-wide / multi-neighbourhood (>100k)", "Échelle municipale / multi-quartiers (>100k)")}
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
              {t("Project typology & trees", "Typologie du projet et arbres")}
            </h3>
            <p className="text-xs text-slate-600">
              {t(
                "Classify the project and describe what type of planting work it includes. This helps align results with how funders and partners talk about projects.",
                "Classez le projet et décrivez le type de travaux de plantation qu’il comprend. Cela aide à aligner les résultats sur le langage des bailleurs de fonds et des partenaires."
              )}
            </p>

            {/* Project typology */}
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setProjectTypology("communityWideUrbanPlanting")}
                className={`flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left text-xs transition ${
                  projectTypology === "communityWideUrbanPlanting"
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-primary-800">
                    {t("CW", "CG")}
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t(
                      "Community-wide urban planting",
                      "Plantation urbaine à l’échelle de la collectivité"
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t(
                    "Projects that span multiple neighbourhoods or a full municipality, usually combining several sites.",
                    "Projets couvrant plusieurs quartiers ou une municipalité entière, combinant généralement plusieurs sites."
                  )}
                </p>
                <div className="mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    src={woodlandIllustration}
                    alt={t(
                      "Illustration of community-wide urban planting",
                      "Illustration d’une plantation urbaine à l’échelle de la collectivité"
                    )}
                    className="w-full h-auto"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProjectTypology("forestRestoration")}
                className={`flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left text-xs transition ${
                  projectTypology === "forestRestoration"
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-800">
                    {t("FR", "FR")}
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t(
                      "Forest restoration in naturalized areas",
                      "Restauration forestière dans des secteurs naturalisés"
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t(
                    "Rehabilitation of naturalized or semi-natural areas, often following disturbance, pests or wildfire.",
                    "Réhabilitation de zones naturalisées ou semi-naturelles, souvent après une perturbation, des ravageurs ou un incendie de forêt."
                  )}
                </p>
                <div className="mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    src={restorationIllustration}
                    alt={t(
                      "Illustration of forest restoration in naturalized areas",
                      "Illustration de restauration forestière dans des secteurs naturalisés"
                    )}
                    className="w-full h-auto"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProjectTypology("localizedPlanting")}
                className={`flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left text-xs transition ${
                  projectTypology === "localizedPlanting"
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[11px] font-semibold text-amber-800">
                    {t("LP", "PL")}
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t(
                      "Localized planting projects",
                      "Projets de plantation localisés"
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t(
                    "Site-specific projects such as a corridor, park, school yard or main street.",
                    "Projets ciblant un site précis comme un corridor, un parc, une cour d’école ou une rue principale."
                  )}
                </p>
                <div className="mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    src={pocketParkIllustration}
                    alt={t(
                      "Illustration of a localized planting project",
                      "Illustration d’un projet de plantation localisé"
                    )}
                    className="w-full h-auto"
                  />
                </div>
              </button>
            </div>

            {/* Supported activities */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {t("Supported activities", "Activités soutenues")}
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {([
                  {
                    id: "streetTrees",
                    labelEn: "Street tree planting",
                    labelFr: "Plantation d’arbres de rue",
                    descEn:
                      "Thoughtful placement of trees along public streets, improving shade, aesthetics and air quality.",
                    descFr:
                      "Implantation réfléchie d’arbres le long des rues publiques pour améliorer l’ombre, l’esthétique et la qualité de l’air.",
                    illustration: streetTreesIllustration
                  },
                  {
                    id: "urbanLowCanopy",
                    labelEn: "Urban planting in low-canopy areas",
                    labelFr: "Plantation urbaine en zones à faible canopée",
                    descEn:
                      "New planting in heat-vulnerable or asphalt-dominated areas to reduce urban heat island effects.",
                    descFr:
                      "Nouvelles plantations dans des zones vulnérables à la chaleur ou dominées par l’asphalte pour réduire les îlots de chaleur.",
                    illustration: greenWallIllustration
                  },
                  {
                    id: "parkTrees",
                    labelEn: "Park tree planting",
                    labelFr: "Plantation d’arbres dans les parcs",
                    descEn:
                      "Establishing new groves and revitalizing existing stands in parks and green spaces.",
                    descFr:
                      "Création de nouveaux bosquets et revitalisation de peuplements existants dans les parcs et espaces verts.",
                    illustration: parkTreesIllustration
                  },
                  {
                    id: "riparian",
                    labelEn: "Riparian planting in flood-prone areas",
                    labelFr: "Plantation riveraine en zones inondables",
                    descEn:
                      "Stabilizing banks and increasing infiltration along rivers, streams or shorelines.",
                    descFr:
                      "Stabilisation des berges et augmentation de l’infiltration le long des rivières, cours d’eau ou rives.",
                    illustration: wetlandIllustration
                  },
                  {
                    id: "forestRestorationActivity",
                    labelEn: "Forest restoration & reforestation",
                    labelFr: "Restauration forestière et reboisement",
                    descEn:
                      "Rebuilding canopy in areas affected by pests, disease or wildfire.",
                    descFr:
                      "Reconstitution de la canopée dans des zones touchées par des ravageurs, des maladies ou des feux de forêt.",
                    illustration: tinyForestIllustration
                  }
                ] as const).map(activity => {
                  const selected = supportedActivities.includes(
                    activity.id as SupportedActivity
                  );
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() =>
                        setSupportedActivities(prev =>
                          prev.includes(activity.id as SupportedActivity)
                            ? prev.filter(a => a !== activity.id)
                            : [...prev, activity.id as SupportedActivity]
                        )
                      }
                      className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-3 text-left text-[11px] transition ${
                        selected
                          ? "border-primary-500 bg-primary-50 shadow-sm"
                          : "border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/40"
                      }`}
                    >
                      <span className="font-semibold text-slate-900">
                        {language === "fr" ? activity.labelFr : activity.labelEn}
                      </span>
                      <p className="text-slate-600">
                        {language === "fr" ? activity.descFr : activity.descEn}
                      </p>
                      {activity.illustration && (
                        <div className="mt-1.5 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                          <Image
                            src={activity.illustration}
                            alt={language === "fr" ? activity.labelFr : activity.labelEn}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Top 5 species (optional)",
                    "5 principales espèces (optionnel)"
                  )}
                </label>
                <textarea
                  rows={2}
                  placeholder={t(
                    "List your top species (e.g. red maple, bur oak, linden...)",
                    "Listez vos principales espèces (p. ex. érable rouge, chêne à gros fruits, tilleul...)"
                  )}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-y"
                />
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "This helps refine communications and, in future versions, species-specific benefits.",
                    "Ceci aide à affiner les communications et, dans de futures versions, les bénéfices propres aux espèces."
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

            {/* Typology-specific contextual questions */}
            <div className="mt-4 space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] text-slate-600">
                {t(
                  "These optional questions help describe project context in a way that aligns with funder language. They do not change the calculations yet.",
                  "Ces questions optionnelles aident à décrire le contexte du projet en cohérence avec le langage des bailleurs de fonds. Elles ne modifient pas encore les calculs."
                )}
              </p>

              {projectTypology === "communityWideUrbanPlanting" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Approximate number of neighbourhoods included",
                        "Nombre approximatif de quartiers inclus"
                      )}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={communitySitesCount ?? ""}
                      onChange={e =>
                        setCommunitySitesCount(
                          e.target.value === ""
                            ? null
                            : Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Does the project connect multiple corridors or centres?",
                        "Le projet relie-t-il plusieurs corridors ou pôles?"
                      )}
                    </label>
                    <select
                      value={
                        localizedSiteContext ||
                        t("Not specified", "Non précisé")
                      }
                      onChange={e => setLocalizedSiteContext(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    >
                      <option value="">
                        {t("Not specified", "Non précisé")}
                      </option>
                      <option value="corridors">
                        {t(
                          "Yes – multiple corridors or centres",
                          "Oui – plusieurs corridors ou pôles"
                        )}
                      </option>
                      <option value="singleArea">
                        {t("Mostly one area", "Essentiellement une seule zone")}
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {projectTypology === "forestRestoration" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Area of degraded or disturbed forest (Ha)",
                        "Superficie de forêt dégradée ou perturbée (Ha)"
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={forestRestorationAreaHa ?? ""}
                      onChange={e =>
                        setForestRestorationAreaHa(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t("Main disturbance type", "Type principal de perturbation")}
                    </label>
                    <select
                      value={localizedSiteContext}
                      onChange={e => setLocalizedSiteContext(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    >
                      <option value="">
                        {t("Not specified", "Non précisé")}
                      </option>
                      <option value="pests">
                        {t("Pests / disease", "Ravageurs / maladies")}
                      </option>
                      <option value="wildfire">
                        {t("Wildfire", "Feu de forêt")}
                      </option>
                      <option value="clearing">
                        {t("Clearing / historical land use", "Défrichement / usages antérieurs")}
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {projectTypology === "localizedPlanting" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t("Main site type", "Type principal de site")}
                    </label>
                    <select
                      value={localizedSiteContext}
                      onChange={e => setLocalizedSiteContext(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    >
                      <option value="">
                        {t("Not specified", "Non précisé")}
                      </option>
                      <option value="corridor">
                        {t("Street or mobility corridor", "Rue ou corridor de mobilité")}
                      </option>
                      <option value="park">
                        {t("Park or square", "Parc ou place")}
                      </option>
                      <option value="school">
                        {t("School or institutional site", "École ou site institutionnel")}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t("Number of key sites", "Nombre de sites clés")}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={parkCount ?? ""}
                      onChange={e =>
                        setParkCount(
                          e.target.value === ""
                            ? null
                            : Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Activity-specific context */}
              <div className="grid gap-3 md:grid-cols-3">
                {supportedActivities.includes("streetTrees") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Approximate length of streets treated (km)",
                        "Longueur approximative des rues concernées (km)"
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={streetLengthKm ?? ""}
                      onChange={e =>
                        setStreetLengthKm(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                )}

                {supportedActivities.includes("riparian") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Riparian edge treated (km)",
                        "Longueur de rive traitée (km)"
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={riparianLengthKm ?? ""}
                      onChange={e =>
                        setRiparianLengthKm(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                )}

                {supportedActivities.includes("parkTrees") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Number of parks or green spaces",
                        "Nombre de parcs ou d’espaces verts"
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={parkCount ?? ""}
                      onChange={e =>
                        setParkCount(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                )}
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
                  "Next: Community impact & benefits",
                  "Suivant : Impact communautaire et bénéfices"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {t("Project story, community impact & benefit focus", "Récit du projet, impact communautaire et bénéfices ciblés")}
            </h3>
            <p className="text-xs text-slate-600">
              {t(
                "Optionally capture a short narrative and costs, then describe who is most affected and which benefit story you need to emphasize.",
                "Saisissez de façon optionnelle un court récit et les coûts, puis décrivez qui est le plus touché et quels bénéfices vous devez mettre de l’avant."
              )}
            </p>

            {/* Project story & costs (optional) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {t("Short project description (optional)", "Brève description du projet (optionnel)")}
                </label>
                <textarea
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                  rows={3}
                  placeholder={t(
                    "3–4 sentences on what changes on the ground, who benefits and what risks are reduced.",
                    "3–4 phrases sur les changements sur le terrain, les bénéficiaires et les risques réduits."
                  )}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-y"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {t("Estimated capital cost (optional)", "Coût d’investissement estimé (optionnel)")}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-600">$</span>
                    <input
                      type="number"
                      min="0"
                      value={projectCapitalCost ?? ""}
                      onChange={e =>
                        setProjectCapitalCost(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      placeholder={t("Total project budget", "Budget total du projet")}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {t("Estimated annual operating cost (optional)", "Coût annuel d’exploitation estimé (optionnel)")}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-600">$</span>
                    <input
                      type="number"
                      min="0"
                      value={projectAnnualCost ?? ""}
                      onChange={e =>
                        setProjectAnnualCost(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      placeholder={t("Maintenance, watering, monitoring", "Entretien, arrosage, suivi")}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                {t(
                  "These fields are optional and meant to support narrative and budget sections in applications.",
                  "Ces champs sont optionnels et visent à alimenter les sections de récit et de budget dans vos demandes."
                )}
              </p>
            </div>

            {/* Community impact & equity */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {t("Community impact", "Impact communautaire")}
                </h4>
                <label className="text-[11px] font-medium text-slate-700">
                  {t("Scale of people directly affected", "Échelle des personnes directement touchées")}
                </label>
                <select
                  value={communityImpactScope}
                  onChange={e =>
                    setCommunityImpactScope(
                      e.target.value as
                        | "site"
                        | "neighbourhood"
                        | "multiNeighbourhood"
                        | "cityWide"
                    )
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="site">
                    {t(
                      "Single site (e.g. park, school yard)",
                      "Un seul site (p. ex. parc, cour d’école)"
                    )}
                  </option>
                  <option value="neighbourhood">
                    {t(
                      "One neighbourhood or corridor",
                      "Un quartier ou un corridor"
                    )}
                  </option>
                  <option value="multiNeighbourhood">
                    {t(
                      "Several neighbourhoods",
                      "Plusieurs quartiers"
                    )}
                  </option>
                  <option value="cityWide">
                    {t(
                      "City-wide or multiple communities",
                      "À l’échelle municipale ou de plusieurs collectivités"
                    )}
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {t("Equity focus", "Accent sur l’équité")}
                </h4>
                <label className="text-[11px] font-medium text-slate-700">
                  {t("How intentional is the equity focus?", "À quel point l’équité est-elle au cœur du projet?")}
                </label>
                <select
                  value={equityFocusLevel}
                  onChange={e =>
                    setEquityFocusLevel(
                      e.target.value as "none" | "emerging" | "strong"
                    )
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="none">
                    {t(
                      "General benefits (no specific equity focus)",
                      "Bénéfices généraux (sans accent explicite sur l’équité)"
                    )}
                  </option>
                  <option value="emerging">
                    {t(
                      "Emerging equity focus (some priority groups)",
                      "Accent émergent sur l’équité (quelques groupes prioritaires)"
                    )}
                  </option>
                  <option value="strong">
                    {t(
                      "Strong equity focus (designed around priority groups)",
                      "Fort accent sur l’équité (conçu autour de groupes prioritaires)"
                    )}
                  </option>
                </select>

                <p className="mt-2 text-[11px] font-medium text-slate-700">
                  {t("Priority groups (optional)", "Groupes prioritaires (optionnel)")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    t("Equity-deserving communities", "Communautés en quête d’équité"),
                    t("Indigenous communities", "Communautés autochtones"),
                    t("Children & youth", "Enfants et jeunes"),
                    t("Older adults", "Personnes aînées"),
                    t("Low-income households", "Ménages à faible revenu")
                  ].map(label => {
                    const selected = priorityGroups.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          setPriorityGroups(prev =>
                            prev.includes(label)
                              ? prev.filter(g => g !== label)
                              : [...prev, label]
                          )
                        }
                        className={`rounded-full border px-2 py-1 text-[10px] font-medium transition ${
                          selected
                            ? "border-primary-500 bg-primary-50 text-primary-800"
                            : "border-slate-300 bg-slate-50 text-slate-700 hover:border-primary-400 hover:bg-primary-50/50"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-dashed border-slate-200" />

            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              {t("Benefit focus", "Bénéfices ciblés")}
            </h4>
            <p className="text-[11px] text-slate-600">
              {t(
                "Select the benefit categories that are most relevant for your funder, council or community.",
                "Sélectionnez les catégories de bénéfices les plus pertinentes pour votre bailleur de fonds, votre conseil ou votre communauté."
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
                      <label className="text-xs font-medium text-slate-700">
                        {t(
                          "What is the typical level of pedestrian activity on these streets?",
                          "Quel est le niveau habituel d’activité piétonne sur ces rues?"
                        )}
                      </label>
                      <select
                        value={healthDetails.pedestrianActivity}
                        onChange={e =>
                          setHealthDetails(prev => ({
                            ...prev,
                            pedestrianActivity: e.target.value as
                              | "low"
                              | "moderate"
                              | "high"
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
                      >
                        <option value="high">
                          {t(
                            "High (busy sidewalks throughout the day)",
                            "Élevée (trottoirs très fréquentés toute la journée)"
                          )}
                        </option>
                        <option value="moderate">
                          {t(
                            "Moderate (regular pedestrian use)",
                            "Modérée (utilisation piétonne régulière)"
                          )}
                        </option>
                        <option value="low">
                          {t(
                            "Low (minimal foot traffic)",
                            "Faible (très peu de circulation piétonne)"
                          )}
                        </option>
                      </select>
                    </div>
                    <div />
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
                      <label className="text-xs font-medium text-slate-700">
                        {t(
                          "Traffic – Does this street experience high traffic volumes?",
                          "Trafic – Cette rue connaît-elle un trafic important?"
                        )}
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
                        <option value="high">
                          {t(
                            "Yes – high traffic (busy arterial or collector road)",
                            "Oui – trafic élevé (artère ou collectrice achalandée)"
                          )}
                        </option>
                        <option value="medium">
                          {t(
                            "Moderate traffic (neighbourhood connector)",
                            "Trafic modéré (rue de liaison de quartier)"
                          )}
                        </option>
                        <option value="low">
                          {t(
                            "Low traffic (local / residential street)",
                            "Faible trafic (rue locale / résidentielle)"
                          )}
                        </option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t(
                          "Air pollution – Does this street experience high levels of noise pollution?",
                          "Pollution atmosphérique – Cette rue présente-t-elle des niveaux élevés de pollution sonore?"
                        )}
                      </label>
                      <select
                        value={airQualityDetails.noiseLevel}
                        onChange={e =>
                          setAirQualityDetails(prev => ({
                            ...prev,
                            noiseLevel: e.target.value as "low" | "moderate" | "high"
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="high">
                          {t(
                            "Yes – significant noise issues",
                            "Oui – problèmes sonores importants"
                          )}
                        </option>
                        <option value="moderate">
                          {t(
                            "Moderate noise levels",
                            "Niveaux sonores modérés"
                          )}
                        </option>
                        <option value="low">
                          {t(
                            "No – relatively quiet",
                            "Non – relativement calme"
                          )}
                        </option>
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
                "These results provide an order-of-magnitude view of your project’s benefits, based on simplified Canadian default assumptions.",
                "Ces résultats offrent un ordre de grandeur des bénéfices de votre projet, à partir d’hypothèses canadiennes simplifiées."
              )}
            </p>

            {/* Key User Inputs */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                {t("Project inputs", "Entrées du projet")}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {projectName && (
                  <div className="md:col-span-2">
                    <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                      {t("Project name", "Nom du projet")}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {projectName}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("Municipality / region", "Municipalité / région")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {municipality || t("Not specified", "Non précisée")}
                    <span className="ml-1 text-[11px] text-slate-500">
                      ·{" "}
                      {region === "atlantic"
                        ? t("Atlantic", "Atlantique")
                        : region === "quebec"
                        ? "Québec"
                        : region === "ontario"
                        ? "Ontario"
                        : region === "prairies"
                        ? t("Prairies", "Prairies")
                        : region === "bc"
                        ? t("British Columbia", "Colombie-Britannique")
                        : t("Territories", "Territoires")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("Number of trees", "Nombre d'arbres")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {numberOfTrees.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("Area", "Superficie")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {projectAreaHa.toFixed(1)} {t("Ha", "Ha")}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("Year", "Année")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {year}
                  </div>
                </div>
              </div>
            </div>

            {(projectDescription || projectCapitalCost || projectAnnualCost) && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                  {t("Project story & costs", "Récit du projet et coûts")}
                </h4>
                {projectDescription && (
                  <div className="mb-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                      {t("Short description", "Brève description")}
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-line">
                      {projectDescription}
                    </p>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {projectCapitalCost !== null && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                        {t("Estimated capital cost", "Coût d’investissement estimé")}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        $
                        {projectCapitalCost.toLocaleString(undefined, {
                          maximumFractionDigits: 0
                        })}
                      </div>
                    </div>
                  )}
                  {projectAnnualCost !== null && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                        {t("Estimated annual operating cost", "Coût annuel d’exploitation estimé")}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        $
                        {projectAnnualCost.toLocaleString(undefined, {
                          maximumFractionDigits: 0
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {selectedBenefits.includes("carbon") && (
                <div className="rounded-xl border border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                      {t("Carbon", "Carbone")}
                    </h4>
                    <button
                      type="button"
                      className="text-[11px] text-primary-800 underline-offset-2 hover:underline"
                      onClick={() =>
                        window.alert(
                          t(
                            "Carbon estimates combine approximate sequestration per tree with regional adjustment factors. They are designed for comparing options and building a narrative, not for carbon crediting.",
                            "Les estimations de carbone combinent une séquestration approximative par arbre avec des facteurs d’ajustement régionaux. Elles servent à comparer des options et à soutenir le récit, et non à la création de crédits carbone."
                          )
                        )
                      }
                    >
                      {t("What does this mean?", "Que signifie cet indicateur?")}
                    </button>
                  </div>
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
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-700 mb-1">
                      {t("Impact scale", "Échelle d’impact")}
                    </p>
                    <div className="h-2 rounded-full bg-primary-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{
                          width:
                            results.total.carbonTonnes < 10
                              ? "30%"
                              : results.total.carbonTonnes < 40
                              ? "60%"
                              : "90%"
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                      <span>{t("Lower", "Plus faible")}</span>
                      <span>{t("Typical", "Typique")}</span>
                      <span>{t("High", "Élevé")}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">
                    {t(
                      "Based on simplified Canadian carbon price assumptions; methodology note available via the link on the right.",
                      "Basé sur des hypothèses simplifiées de tarification du carbone au Canada; une note méthodologique est accessible via le lien à droite."
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("stormwater") && (
                <div className="rounded-xl border border-secondary-300 bg-gradient-to-br from-secondary-50 to-secondary-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-secondary-700 uppercase tracking-wide">
                      {t("Stormwater", "Eaux pluviales")}
                    </h4>
                    <button
                      type="button"
                      className="text-[11px] text-secondary-800 underline-offset-2 hover:underline"
                      onClick={() =>
                        window.alert(
                          t(
                            "Stormwater benefits approximate the additional rainfall intercepted and slowed by trees compared to hard surfaces.",
                            "Les bénéfices en matière d’eaux pluviales représentent la pluie interceptée et ralentie par les arbres par rapport aux surfaces imperméables."
                          )
                        )
                      }
                    >
                      {t("What does this mean?", "Que signifie cet indicateur?")}
                    </button>
                  </div>
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
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-700 mb-1">
                      {t("Impact scale", "Échelle d’impact")}
                    </p>
                    <div className="h-2 rounded-full bg-secondary-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-secondary-600"
                        style={{
                          width:
                            results.total.stormwaterLitres < 1_000_000
                              ? "30%"
                              : results.total.stormwaterLitres < 5_000_000
                              ? "60%"
                              : "90%"
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                      <span>{t("Lower", "Plus faible")}</span>
                      <span>{t("Typical", "Typique")}</span>
                      <span>{t("High", "Élevé")}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedBenefits.includes("health") && (
                <div className="rounded-xl border border-accent-300 bg-gradient-to-br from-accent-50 to-accent-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-accent-700 uppercase tracking-wide">
                      {t("Health & well-being", "Santé et bien-être")}
                    </h4>
                    <button
                      type="button"
                      className="text-[11px] text-accent-800 underline-offset-2 hover:underline"
                      onClick={() =>
                        window.alert(
                          t(
                            "Health benefits are a proxy based on international and Canadian literature linking urban trees to avoided health costs.",
                            "Les bénéfices pour la santé sont un proxy basé sur la littérature internationale et canadienne reliant les arbres urbains aux coûts de santé évités."
                          )
                        )
                      }
                    >
                      {t("What does this mean?", "Que signifie cet indicateur?")}
                    </button>
                  </div>
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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      {t("Property value", "Valeur foncière")}
                    </h4>
                    <button
                      type="button"
                      className="text-[11px] text-amber-900 underline-offset-2 hover:underline"
                      onClick={() =>
                        window.alert(
                          t(
                            "Property value uplift is based on typical percentage increases observed near greener streets and parks.",
                            "La hausse de la valeur foncière est basée sur des augmentations typiques observées à proximité de rues et de parcs plus verts."
                          )
                        )
                      }
                    >
                      {t("What does this mean?", "Que signifie cet indicateur?")}
                    </button>
                  </div>
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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                      {t("Urban heat", "Îlots de chaleur urbains")}
                    </h4>
                    <button
                      type="button"
                      className="text-[11px] text-orange-800 underline-offset-2 hover:underline"
                      onClick={() =>
                        window.alert(
                          t(
                            "Cooling estimates approximate local temperature reductions where canopy is added, relative to surrounding hard surfaces.",
                            "Les estimations de refroidissement représentent la réduction locale des températures là où la canopée est ajoutée, par rapport aux surfaces environnantes imperméables."
                          )
                        )
                      }
                    >
                      {t("What does this mean?", "Que signifie cet indicateur?")}
                    </button>
                  </div>
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

            {/* Simple benefit mix visualization (bars) */}
            <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr,1.5fr] items-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {t("Benefit mix (relative)", "Répartition des bénéfices (relative)")}
                </h4>
                {valueMix ? (
                  <div className="space-y-2 text-[11px]">
                    {(() => {
                      const vm = valueMix!;
                      return [
                      {
                        key: "carbon",
                        label: t("Carbon value", "Valeur carbone"),
                        color: "bg-primary-500"
                      },
                      {
                        key: "stormwater",
                        label: t("Stormwater value", "Valeur eaux pluviales"),
                        color: "bg-secondary-500"
                      },
                      {
                        key: "health",
                        label: t("Health proxy", "Proxy santé"),
                        color: "bg-accent-500"
                      },
                      {
                        key: "property",
                        label: t("Property value", "Valeur foncière"),
                        color: "bg-amber-500"
                      }
                      ].map(cat => {
                        const raw =
                          cat.key === "carbon"
                            ? vm.carbon
                            : cat.key === "stormwater"
                            ? vm.stormwater
                            : cat.key === "health"
                            ? vm.health
                            : vm.property;
                        const pct = Math.round((raw / vm.total) * 100);
                        return (
                          <div key={cat.key} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-700">{cat.label}</span>
                              <span className="text-slate-500">{pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${cat.color}`}
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    <p className="mt-1 text-[10px] text-slate-500">
                      {t(
                        "Shares are based on the monetary proxies used in this tool (carbon price, avoided stormwater costs, health proxy and property uplift).",
                        "Les parts sont basées sur les proxys monétaires utilisés par l’outil (prix du carbone, coûts d’eaux pluviales évités, proxy santé et hausse foncière)."
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {t(
                      "Run a calculation to see how benefits are distributed across categories.",
                      "Lancez un calcul pour voir comment les bénéfices se répartissent entre les catégories."
                    )}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {t("Benefit groups comparison", "Comparaison des groupes de bénéfices")}
                </h4>
                {groupScores ? (
                  <div className="space-y-2 text-[11px]">
                    {(() => {
                      const gs = groupScores!;
                      return [
                      {
                        key: "climate",
                        label: t("Climate / carbon", "Climat / carbone"),
                        color: "bg-primary-500",
                        value: gs.climate
                      },
                      {
                        key: "water",
                        label: t("Stormwater / flooding", "Eaux pluviales / inondations"),
                        color: "bg-secondary-500",
                        value: gs.water
                      },
                      {
                        key: "health",
                        label: t("Health / equity (proxy)", "Santé / équité (proxy)"),
                        color: "bg-accent-500",
                        value: gs.health
                      },
                      {
                        key: "biodiversity",
                        label: t("Biodiversity", "Biodiversité"),
                        color: "bg-green-500",
                        value: gs.biodiversity
                      }
                      ].map(group => {
                        const ratio = group.value / gs.max;
                        const widthPct = Math.max(8, Math.round(ratio * 100));
                        const strength =
                          ratio >= 0.75
                            ? t("very strong", "très fort")
                            : ratio >= 0.5
                            ? t("strong", "fort")
                            : ratio >= 0.25
                            ? t("moderate", "modéré")
                            : t("emerging", "émergent");
                        return (
                          <div key={group.key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-700">
                                {group.label}
                              </span>
                              <span className="text-slate-500">{strength}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${group.color}`}
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    <p className="mt-1 text-[10px] text-slate-500">
                      {t(
                        "Relative strength of each group is scaled to the strongest impact in your project.",
                        "L’intensité relative de chaque groupe est mise à l’échelle par rapport à l’impact le plus fort de votre projet."
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {t(
                      "Run a calculation to compare climate, water, health and biodiversity contributions.",
                      "Lancez un calcul pour comparer les contributions climat, eau, santé et biodiversité."
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Additional impact perspectives */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  {t("Compared to turf grass", "Comparaison avec le gazon")}
                </h4>
                <p className="text-[11px] text-slate-700 mb-2">
                  {t(
                    "Explore how benefits change if the same area stayed as turf grass instead of being planted with trees.",
                    "Explorez comment les bénéfices changent si la même superficie reste en gazon plutôt qu’en plantation d’arbres."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setShowTurfComparison(true)}
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!results || !turfScenario}
                >
                  {t(
                    "Open full-screen turf vs trees comparison",
                    "Ouvrir la comparaison plein écran gazon vs arbres"
                  )}
                </button>
                <p className="mt-1 text-[10px] text-slate-500">
                  {t(
                    "Uses simplified assumptions about how turf performs for carbon, water, health and heat.",
                    "S’appuie sur des hypothèses simplifiées de performance du gazon en carbone, eau, santé et chaleur."
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  {t("Stakeholders benefiting", "Parties prenantes bénéficiaires")}
                </h4>
                <p className="text-[11px] text-slate-700 mb-2">
                  {t(
                    "Use this as a starting point when tailoring your story for different audiences.",
                    "Utilisez cette vue comme point de départ pour adapter votre récit à différents publics."
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                    {t("Residents near the site", "Résident·es près du site")}
                  </span>
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                    {t("People walking, rolling & cycling", "Piétons, cyclistes et usagers en mobilité réduite")}
                  </span>
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                    {t("Municipal operations & infrastructure teams", "Services municipaux et équipes d’infrastructure")}
                  </span>
                  {priorityGroups.length > 0 && (
                    <span className="rounded-full bg-primary-50 border border-primary-200 px-2 py-1 text-primary-800">
                      {t("Priority groups you selected", "Groupes prioritaires sélectionnés")}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                  {t("Methodology & validation", "Méthodologie et validation")}
                </h4>
                <p className="text-[11px] text-slate-700 mb-2">
                  {t(
                    "The model combines Canadian datasets and peer-reviewed literature. It is being refined with academic partners.",
                    "Le modèle combine des ensembles de données canadiens et de la littérature examinée par les pairs. Il est affiné avec des partenaires universitaires."
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mb-2">
                  {t(
                    "Placeholder: list of universities and research groups validating this model will appear here.",
                    "Espace réservé : la liste des universités et groupes de recherche qui valident ce modèle apparaîtra ici."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => window.open("#methodology", "_blank")}
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition"
                >
                  {t("Read more about the methodology", "En savoir plus sur la méthodologie")}
                </button>
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
              "This calculator turns a few core project inputs into a grant-ready story: who benefits, how the site is changing, and what risks are being reduced.",
              "Ce calculateur transforme quelques éléments clés de votre projet en un récit prêt pour une demande de financement : qui bénéficie, comment le site change et quels risques sont réduits."
            )}
          </p>
          <ul className="space-y-1.5 text-[11px] text-slate-700">
            <li>
              •{" "}
              {t(
                "Highlight small-community impact with per-capita and per-household metrics.",
                "Mettez en valeur l’impact pour les petites collectivités grâce aux indicateurs par habitant et par ménage."
              )}
            </li>
            <li>
              •{" "}
              {t(
                "Choose the benefit categories and equity story that best match the expectations of a given funder or council.",
                "Choisissez les catégories de bénéfices et le récit d’équité qui correspondent le mieux aux attentes d’un bailleur de fonds ou d’un conseil."
              )}
            </li>
            <li>
              •{" "}
              {t(
                "Explain that values are indicative and will be refined as the peer-reviewed methodology and datasets evolve.",
                "Expliquez que les valeurs sont indicatives et seront affinées à mesure que la méthodologie examinée par les pairs et les données évoluent."
              )}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => window.open("#methodology", "_blank")}
            className="mt-4 inline-flex items-center gap-1 rounded-full border border-primary-300 bg-white px-3 py-1.5 text-[11px] font-medium text-primary-800 hover:bg-primary-50 transition"
          >
            {t(
              "Read full methodology (coming soon)",
              "Lire la méthodologie complète (à venir)"
            )}
          </button>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {t("Edit inputs and re-run", "Modifier les intrants et relancer")}
          </button>
        </div>
      </aside>

      {showTurfComparison && results && turfScenario && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60">
          <div className="relative mx-4 w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {t(
                    "Turf vs trees comparison",
                    "Comparaison gazon vs arbres"
                  )}
                </h3>
                <p className="text-[11px] text-slate-600">
                  {t(
                    "Use the slider to move between a turf baseline and the tree planting scenario you entered.",
                    "Utilisez le curseur pour passer d’un scénario de gazon de base au scénario de plantation d’arbres que vous avez saisi."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTurfComparison(false)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                ✕ {t("Close", "Fermer")}
              </button>
            </header>
            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-700 flex justify-between">
                  <span>
                    {t(
                      "Share of area planted with trees",
                      "Part de la superficie plantée d’arbres"
                    )}
                  </span>
                  <span className="text-slate-900">
                    {treeSharePercent}% {t("trees", "arbres")} /{" "}
                    {100 - treeSharePercent}% {t("turf", "gazon")}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={treeSharePercent}
                  onChange={e =>
                    setTreeSharePercent(Number(e.target.value) || 0)
                  }
                  className="w-full accent-primary-600"
                />
              </div>

              {(() => {
                const treeFraction = treeSharePercent / 100;
                const turfFraction = 1 - treeFraction;

                const mixedCarbon =
                  turfScenario.carbonTonnes * turfFraction +
                  results.total.carbonTonnes * treeFraction;
                const mixedStorm =
                  turfScenario.stormwaterLitres * turfFraction +
                  results.total.stormwaterLitres * treeFraction;
                const mixedHealth =
                  turfScenario.healthSavings * turfFraction +
                  results.total.healthSavings * treeFraction;
                const mixedHeat =
                  turfScenario.heatIslandReductionDegC * turfFraction +
                  results.total.heatIslandReductionDegC * treeFraction;

                return (
                  <div className="grid gap-4 md:grid-cols-2 items-start">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                        {t(
                          "Baseline: turf grass (0% trees)",
                          "Référence : gazon (0 % d’arbres)"
                        )}
                      </h4>
                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div className="flex justify-between">
                          <span>{t("Carbon", "Carbone")}</span>
                          <span>
                            {turfScenario.carbonTonnes.toFixed(1)} tCO₂e
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("Stormwater", "Eaux pluviales")}</span>
                          <span>
                            {turfScenario.stormwaterLitres.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 0 }
                            )}{" "}
                            L
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("Health proxy", "Proxy santé")}</span>
                          <span>
                            $
                            {turfScenario.healthSavings.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 0 }
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("Cooling", "Refroidissement")}</span>
                          <span>
                            −
                            {turfScenario.heatIslandReductionDegC.toFixed(2)}°C
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                        {t(
                          "Mixed scenario: trees + turf",
                          "Scénario mixte : arbres + gazon"
                        )}
                      </h4>
                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div className="flex justify-between">
                          <span>{t("Carbon", "Carbone")}</span>
                          <span>
                            {mixedCarbon.toFixed(1)} tCO₂e{" "}
                            <span className="text-emerald-600 font-medium">
                              (
                              {(
                                (mixedCarbon /
                                  Math.max(
                                    turfScenario.carbonTonnes,
                                    0.0001
                                  ) -
                                  1) * 100
                              ).toFixed(0)}
                              % {t("vs turf", "vs gazon")})
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("Stormwater", "Eaux pluviales")}</span>
                          <span>
                            {mixedStorm.toLocaleString(undefined, {
                              maximumFractionDigits: 0
                            })}{" "}
                            L{" "}
                            <span className="text-emerald-600 font-medium">
                              (
                              {(
                                (mixedStorm /
                                  Math.max(
                                    turfScenario.stormwaterLitres,
                                    0.0001
                                  ) -
                                  1) * 100
                              ).toFixed(0)}
                              % {t("vs turf", "vs gazon")})
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("Health proxy", "Proxy santé")}</span>
                          <span>
                            $
                            {mixedHealth.toLocaleString(undefined, {
                              maximumFractionDigits: 0
                            })}{" "}
                            <span className="text-emerald-600 font-medium">
                              (
                              {(
                                (mixedHealth /
                                  Math.max(
                                    turfScenario.healthSavings,
                                    0.0001
                                  ) -
                                  1) * 100
                              ).toFixed(0)}
                              % {t("vs turf", "vs gazon")})
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("Cooling", "Refroidissement")}</span>
                          <span>
                            −
                            {mixedHeat.toFixed(2)}°C{" "}
                            <span className="text-emerald-600 font-medium">
                              (
                              {(
                                (mixedHeat /
                                  Math.max(
                                    turfScenario.heatIslandReductionDegC,
                                    0.0001
                                  ) -
                                  1) * 100
                              ).toFixed(0)}
                              % {t("vs turf", "vs gazon")})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <p className="text-[10px] text-slate-500">
                {t(
                  "This comparison uses simple ratios for turf performance relative to trees. Final methodology will be refined with academic partners.",
                  "Cette comparaison utilise des rapports simplifiés de performance du gazon par rapport aux arbres. La méthodologie finale sera affinée avec des partenaires universitaires."
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


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

const benefitCategoriesByGroup: {
  groupEn: string;
  groupFr: string;
  benefits: { id: BenefitCategory; labelEn: string; labelFr: string }[];
}[] = [
  {
    groupEn: "ENVIRONMENTAL BENEFITS",
    groupFr: "BÉNÉFICES ENVIRONNEMENTAUX",
    benefits: [
      { id: "carbon", labelEn: "Carbon Sequestration", labelFr: "Séquestration du carbone" },
      { id: "airQuality", labelEn: "Air Quality Improvement", labelFr: "Amélioration de la qualité de l'air" },
      { id: "heat", labelEn: "Heat Mitigation", labelFr: "Atténuation de la chaleur" },
      { id: "floodManagement", labelEn: "Flood Management", labelFr: "Gestion des inondations" },
      { id: "waterQuality", labelEn: "Water Quality Improvement", labelFr: "Amélioration de la qualité de l'eau" },
      { id: "biodiversity", labelEn: "Biodiversity & Habitat", labelFr: "Biodiversité et habitat" },
      { id: "soilHealth", labelEn: "Soil Health & Erosion Control", labelFr: "Santé des sols et contrôle de l'érosion" }
    ]
  },
  {
    groupEn: "SOCIAL & COMMUNITY BENEFITS",
    groupFr: "BÉNÉFICES SOCIAUX ET COMMUNAUTAIRES",
    benefits: [
      { id: "health", labelEn: "Health & Wellbeing", labelFr: "Santé et bien-être" },
      { id: "recreation", labelEn: "Recreation & Community Connection", labelFr: "Loisirs et liens communautaires" },
      { id: "aesthetics", labelEn: "Aesthetics & Visual Amenity", labelFr: "Esthétique et aménité visuelle" },
      { id: "noiseReduction", labelEn: "Noise Reduction", labelFr: "Réduction du bruit" },
      { id: "culturalValues", labelEn: "Cultural & Indigenous Values", labelFr: "Valeurs culturelles et autochtones" }
    ]
  },
  {
    groupEn: "ECONOMIC BENEFITS",
    groupFr: "BÉNÉFICES ÉCONOMIQUES",
    benefits: [
      { id: "propertyValue", labelEn: "Property Value Enhancement", labelFr: "Amélioration de la valeur foncière" },
      { id: "energySavings", labelEn: "Energy Savings", labelFr: "Économies d'énergie" },
      { id: "labourProductivity", labelEn: "Labour Productivity", labelFr: "Productivité du travail" },
      { id: "tourism", labelEn: "Tourism & Destination Appeal", labelFr: "Tourisme et attrait de destination" },
      { id: "foodProduction", labelEn: "Food Production", labelFr: "Production alimentaire" }
    ]
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
    "floodManagement",
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

  // Street Tree Planting questions
  const [streetTreeSize, setStreetTreeSize] = useState<string>("");
  const [streetAddresses, setStreetAddresses] = useState<string[]>([""]);
  const [streetLengthM, setStreetLengthM] = useState<number | null>(null);
  const [streetPlantingDensity, setStreetPlantingDensity] = useState<number | null>(null);
  const [streetLandUse, setStreetLandUse] = useState<string>("");
  const [streetCanopyCover, setStreetCanopyCover] = useState<string>("");
  const [streetCombinedInterventions, setStreetCombinedInterventions] = useState<string[]>([]);
  const [streetHardscapeReductionArea, setStreetHardscapeReductionArea] = useState<number | null>(null);
  const [streetHardscapeReductionPercent, setStreetHardscapeReductionPercent] = useState<string>("");
  const [streetOtherGI, setStreetOtherGI] = useState<string>("");

  // Park Tree Planting questions
  const [parkNativeSpeciesPercent, setParkNativeSpeciesPercent] = useState<string>("");
  const [parkTreeSize, setParkTreeSize] = useState<string>("");
  const [parkName, setParkName] = useState<string>("");
  const [parkLocation, setParkLocation] = useState<string>("");
  const [parkSizeHa, setParkSizeHa] = useState<number | null>(null);
  const [parkType, setParkType] = useState<string>("");
  const [parkPurpose, setParkPurpose] = useState<string[]>([]);
  const [parkVisitation, setParkVisitation] = useState<string>("");
  const [parkEcologicalConnectivity, setParkEcologicalConnectivity] = useState<string>("");
  const [parkCombinedInterventions, setParkCombinedInterventions] = useState<string[]>([]);

  // Riparian Planting questions
  const [riparianLengthM, setRiparianLengthM] = useState<number | null>(null);
  const [riparianNativeSpeciesPercent, setRiparianNativeSpeciesPercent] = useState<string>("");
  const [riparianTreeSize, setRiparianTreeSize] = useState<string>("");
  const [riparianBufferWidth, setRiparianBufferWidth] = useState<string>("");
  const [riparianDensityPerM, setRiparianDensityPerM] = useState<number | null>(null);
  const [riparianDensityPerHa, setRiparianDensityPerHa] = useState<number | null>(null);
  const [riparianWatercourseType, setRiparianWatercourseType] = useState<string>("");
  const [riparianFloodHistory, setRiparianFloodHistory] = useState<string>("");
  const [riparianRiskProperties, setRiparianRiskProperties] = useState<string[]>([]);
  const [riparianSoilType, setRiparianSoilType] = useState<string>("");
  const [riparianErosion, setRiparianErosion] = useState<string>("");
  const [riparianCombinedInterventions, setRiparianCombinedInterventions] = useState<string[]>([]);

  // Forest Restoration questions
  const [forestRestorationAreaHa2, setForestRestorationAreaHa2] = useState<number | null>(null);
  const [forestNaturalRegeneration, setForestNaturalRegeneration] = useState<boolean>(false);
  const [forestPlantingDensity, setForestPlantingDensity] = useState<number | null>(null);
  const [forestVariableDensity, setForestVariableDensity] = useState<boolean>(false);
  const [forestNativeMatchPercent, setForestNativeMatchPercent] = useState<string>("");
  const [forestTreeSize, setForestTreeSize] = useState<string>("");
  const [forestRestorationApproach, setForestRestorationApproach] = useState<string[]>([]);
  const [forestDisturbanceType, setForestDisturbanceType] = useState<string[]>([]);
  const [forestDisturbanceSeverity, setForestDisturbanceSeverity] = useState<string>("");
  const [forestDisturbanceTime, setForestDisturbanceTime] = useState<string>("");
  const [forestSeedSources, setForestSeedSources] = useState<string>("");
  const [forestNaturalRegenCondition, setForestNaturalRegenCondition] = useState<string>("");
  const [forestSoilCondition, setForestSoilCondition] = useState<string>("");
  const [forestInvasiveSpecies, setForestInvasiveSpecies] = useState<string>("");
  const [forestVegetationCover, setForestVegetationCover] = useState<string>("");
  const [forestProximityToForest, setForestProximityToForest] = useState<string>("");
  const [forestNearbyForestSize, setForestNearbyForestSize] = useState<string>("");
  const [forestAccessibility, setForestAccessibility] = useState<string>("");
  const [forestEcosystemType, setForestEcosystemType] = useState<string>("");
  const [forestCarbonCredits, setForestCarbonCredits] = useState<string>("");
  const [forestBaselineCarbon, setForestBaselineCarbon] = useState<string>("");
  const [forestCombinedInterventions, setForestCombinedInterventions] = useState<string[]>([]);
  const [forestObjectives, setForestObjectives] = useState<string[]>([]);
  const [forestTimeline, setForestTimeline] = useState<string>("");

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
            <div className="mt-4 space-y-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] text-slate-600">
                {t(
                  "These optional questions help describe project context in a way that aligns with funder language. They do not change the calculations yet.",
                  "Ces questions optionnelles aident à décrire le contexte du projet en cohérence avec le langage des bailleurs de fonds. Elles ne modifient pas encore les calculs."
                )}
              </p>

              {/* Street Tree Planting Questions */}
              {supportedActivities.includes("streetTrees") && (
                <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {t("Street Tree Planting", "Plantation d'arbres de rue")}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Size of tree - What is the typical size of trees at planting?", "Taille des arbres - Quelle est la taille typique des arbres à la plantation?")}
                      </label>
                      <select
                        value={streetTreeSize}
                        onChange={e => setStreetTreeSize(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="whips">{t("Whips/saplings (less than 1.5m height)", "Baguettes/jeunes plants (moins de 1,5 m de hauteur)")}</option>
                        <option value="small">{t("Small caliper (25-50mm diameter / 1.5-2.5m height)", "Petit calibre (25-50 mm de diamètre / 1,5-2,5 m de hauteur)")}</option>
                        <option value="medium">{t("Medium caliper (50-75mm diameter / 2.5-4m height)", "Calibre moyen (50-75 mm de diamètre / 2,5-4 m de hauteur)")}</option>
                        <option value="large">{t("Large caliper (75mm+ diameter / 4m+ height)", "Grand calibre (75 mm+ de diamètre / 4 m+ de hauteur)")}</option>
                        <option value="mixed">{t("Mixed sizes", "Tailles mixtes")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Planting locations - Enter street address(es), one per line:", "Emplacements de plantation - Entrez l'adresse des rues, une par ligne:")}
                      </label>
                      {streetAddresses.map((addr, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={addr}
                            onChange={e => {
                              const newAddrs = [...streetAddresses];
                              newAddrs[idx] = e.target.value;
                              setStreetAddresses(newAddrs);
                            }}
                            placeholder={t("Street address", "Adresse de la rue")}
                            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                          />
                          {idx === streetAddresses.length - 1 && (
                            <button
                              type="button"
                              onClick={() => setStreetAddresses([...streetAddresses, ""])}
                              className="px-3 py-2 text-xs text-primary-600 hover:text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition"
                            >
                              {t("+ Add more", "+ Ajouter")}
                            </button>
                          )}
                          {streetAddresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setStreetAddresses(streetAddresses.filter((_, i) => i !== idx))}
                              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition"
                            >
                              {t("Remove", "Retirer")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Expected length of street(s) being planted (m):", "Longueur prévue de(s) rue(s) plantée(s) (m):")}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={streetLengthM ?? ""}
                          onChange={e =>
                            setStreetLengthM(
                              e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                        <p className="text-[10px] text-slate-500">
                          {t("(If multiple streets, provide combined total length)", "(Si plusieurs rues, fournir la longueur totale combinée)")}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Expected planting density (trees/km):", "Densité de plantation prévue (arbres/km):")}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={streetPlantingDensity ?? ""}
                          onChange={e =>
                            setStreetPlantingDensity(
                              e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                        <p className="text-[10px] text-slate-500">
                          {t("(Auto-calculated based on trees and length, or manually entered)", "(Calculé automatiquement selon les arbres et la longueur, ou saisi manuellement)")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Land-use - What is the primary land use along these streets?", "Utilisation du sol - Quelle est l'utilisation principale du sol le long de ces rues?")}
                      </label>
                      <select
                        value={streetLandUse}
                        onChange={e => setStreetLandUse(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="residential">{t("Residential", "Résidentiel")}</option>
                        <option value="commercial">{t("Commercial", "Commercial")}</option>
                        <option value="industrial">{t("Industrial", "Industriel")}</option>
                        <option value="institutional">{t("Institutional (schools, hospitals, government)", "Institutionnel (écoles, hôpitaux, gouvernement)")}</option>
                        <option value="mixed">{t("Mixed-use", "Usage mixte")}</option>
                        <option value="other">{t("Other", "Autre")}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Canopy cover - What is the current tree canopy cover on these streets?", "Couverture de canopée - Quelle est la couverture actuelle de la canopée d'arbres sur ces rues?")}
                      </label>
                      <select
                        value={streetCanopyCover}
                        onChange={e => setStreetCanopyCover(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="none">{t("None (0%)", "Aucune (0%)")}</option>
                        <option value="low">{t("Low (1-10%)", "Faible (1-10%)")}</option>
                        <option value="moderate">{t("Moderate (11-25%)", "Modérée (11-25%)")}</option>
                        <option value="high">{t("High (more than 25%)", "Élevée (plus de 25%)")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Combined interventions - Is this tree planting project combined with other green infrastructure improvements? (Check all that apply)", "Interventions combinées - Ce projet de plantation d'arbres est-il combiné à d'autres améliorations d'infrastructure verte? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "none", labelEn: "No additional measures - trees only", labelFr: "Aucune mesure supplémentaire - arbres seulement" },
                          { id: "hardscape", labelEn: "Yes - reducing hardscape/impervious surfaces (e.g., depaving, removing concrete)", labelFr: "Oui - réduction des surfaces dures/imperméables (p. ex., dépaver, enlever le béton)" },
                          { id: "raingardens", labelEn: "Yes - installing rain gardens or bioswales", labelFr: "Oui - installation de jardins pluviaux ou de bioswales" },
                          { id: "shrubs", labelEn: "Yes - adding shrub plantings", labelFr: "Oui - ajout de plantations d'arbustes" },
                          { id: "groundcover", labelEn: "Yes - adding groundcover/perennial plantings", labelFr: "Oui - ajout de couvre-sol/plantations vivaces" },
                          { id: "permeable", labelEn: "Yes - installing permeable paving", labelFr: "Oui - installation de pavage perméable" },
                          { id: "trenches", labelEn: "Yes - creating tree trenches or continuous soil cells", labelFr: "Oui - création de tranchées d'arbres ou de cellules de sol continues" },
                          { id: "other", labelEn: "Other green infrastructure", labelFr: "Autre infrastructure verte" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={streetCombinedInterventions.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setStreetCombinedInterventions([...streetCombinedInterventions, opt.id]);
                                } else {
                                  setStreetCombinedInterventions(streetCombinedInterventions.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                      {streetCombinedInterventions.includes("hardscape") && (
                        <div className="ml-6 space-y-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">
                              {t("If yes, approximate area being converted (m²):", "Si oui, superficie approximative convertie (m²):")}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={streetHardscapeReductionArea ?? ""}
                              onChange={e =>
                                setStreetHardscapeReductionArea(
                                  e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                                )
                              }
                              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">
                              {t("What percentage of the street corridor will be converted from hard to permeable/vegetated surfaces?", "Quel pourcentage du corridor de rue sera converti de surfaces dures à perméables/végétalisées?")}
                            </label>
                            <select
                              value={streetHardscapeReductionPercent}
                              onChange={e => setStreetHardscapeReductionPercent(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            >
                              <option value="">{t("Select...", "Sélectionner...")}</option>
                              <option value="na">{t("Not applicable", "Non applicable")}</option>
                              <option value="less10">{t("Less than 10%", "Moins de 10%")}</option>
                              <option value="10-25">{t("10-25%", "10-25%")}</option>
                              <option value="25-50">{t("25-50%", "25-50%")}</option>
                              <option value="more50">{t("More than 50%", "Plus de 50%")}</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {streetCombinedInterventions.includes("other") && (
                        <div className="ml-6 space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">
                            {t("Please specify:", "Veuillez préciser:")}
                          </label>
                          <input
                            type="text"
                            value={streetOtherGI}
                            onChange={e => setStreetOtherGI(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Park Tree Planting Questions */}
              {supportedActivities.includes("parkTrees") && (
                <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {t("Park Tree Planting", "Plantation d'arbres dans les parcs")}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Native species - What percentage of the species are native to your region?", "Espèces indigènes - Quel pourcentage des espèces sont indigènes à votre région?")}
                      </label>
                      <select
                        value={parkNativeSpeciesPercent}
                        onChange={e => setParkNativeSpeciesPercent(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="100">{t("All native species (100%)", "Toutes les espèces indigènes (100%)")}</option>
                        <option value="75-99">{t("Mostly native (75-99%)", "Principalement indigènes (75-99%)")}</option>
                        <option value="25-74">{t("Mix of native and non-native (25-74%)", "Mélange d'indigènes et non-indigènes (25-74%)")}</option>
                        <option value="less25">{t("Mostly non-native (less than 25%)", "Principalement non-indigènes (moins de 25%)")}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Size of trees - What is the typical size of trees at planting?", "Taille des arbres - Quelle est la taille typique des arbres à la plantation?")}
                      </label>
                      <select
                        value={parkTreeSize}
                        onChange={e => setParkTreeSize(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="seeds">{t("Seeds or acorns (natural regeneration)", "Graines ou glands (régénération naturelle)")}</option>
                        <option value="seedlings">{t("Seedlings (less than 30cm height)", "Semis (moins de 30 cm de hauteur)")}</option>
                        <option value="whips">{t("Whips/saplings (30cm-1.5m height)", "Baguettes/jeunes plants (30 cm-1,5 m de hauteur)")}</option>
                        <option value="small">{t("Small stock (1.5-2.5m height)", "Petit stock (1,5-2,5 m de hauteur)")}</option>
                        <option value="medium">{t("Medium stock (2.5-4m height)", "Stock moyen (2,5-4 m de hauteur)")}</option>
                        <option value="large">{t("Larger transplants (4m+ height)", "Transplants plus grands (4 m+ de hauteur)")}</option>
                        <option value="mixed">{t("Mixed sizes", "Tailles mixtes")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Park name:", "Nom du parc:")}
                        </label>
                        <input
                          type="text"
                          value={parkName}
                          onChange={e => setParkName(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Park address or location:", "Adresse ou emplacement du parc:")}
                        </label>
                        <input
                          type="text"
                          value={parkLocation}
                          onChange={e => setParkLocation(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Size of park (hectares):", "Taille du parc (hectares):")}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={parkSizeHa ?? ""}
                          onChange={e =>
                            setParkSizeHa(
                              e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Park type - What type of park is this?", "Type de parc - Quel type de parc s'agit-il?")}
                        </label>
                        <select
                          value={parkType}
                          onChange={e => setParkType(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="neighbourhood">{t("Neighbourhood park (local/small scale)", "Parc de quartier (échelle locale/petite)")}</option>
                          <option value="community">{t("Community park (medium scale)", "Parc communautaire (échelle moyenne)")}</option>
                          <option value="regional">{t("Regional park (large scale)", "Parc régional (grande échelle)")}</option>
                          <option value="natural">{t("Natural area or conservation park", "Zone naturelle ou parc de conservation")}</option>
                          <option value="sports">{t("Sports/recreation focused park", "Parc axé sur les sports/loisirs")}</option>
                          <option value="other">{t("Other", "Autre")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Purpose of planting - What is the primary purpose of this park tree planting project? (Check all that apply)", "Objectif de la plantation - Quel est l'objectif principal de ce projet de plantation d'arbres dans le parc? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "newGroves", labelEn: "Establishing new groves or woodland areas", labelFr: "Établir de nouveaux bosquets ou zones boisées" },
                          { id: "revitalizing", labelEn: "Revitalizing/restoring existing tree stands", labelFr: "Revitaliser/restaurer les peuplements d'arbres existants" },
                          { id: "replacing", labelEn: "Replacing dying or dead trees", labelFr: "Remplacer les arbres mourants ou morts" },
                          { id: "biodiversity", labelEn: "Increasing biodiversity", labelFr: "Augmenter la biodiversité" },
                          { id: "wildlife", labelEn: "Enhancing wildlife habitat", labelFr: "Améliorer l'habitat faunique" },
                          { id: "cooling", labelEn: "Cooling and shade provision", labelFr: "Refroidissement et fourniture d'ombre" },
                          { id: "stormwater", labelEn: "Stormwater management", labelFr: "Gestion des eaux pluviales" },
                          { id: "aesthetic", labelEn: "Creating visual/aesthetic improvements", labelFr: "Créer des améliorations visuelles/esthétiques" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={parkPurpose.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setParkPurpose([...parkPurpose, opt.id]);
                                } else {
                                  setParkPurpose(parkPurpose.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Health, community - What is the estimated level of park visitation?", "Santé, communauté - Quel est le niveau estimé de fréquentation du parc?")}
                      </label>
                      <select
                        value={parkVisitation}
                        onChange={e => setParkVisitation(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="high">{t("High use (busy throughout the day/week)", "Utilisation élevée (occupé tout au long de la journée/semaine)")}</option>
                        <option value="moderate">{t("Moderate use (regular visitors)", "Utilisation modérée (visiteurs réguliers)")}</option>
                        <option value="low">{t("Low use (occasional visitors)", "Utilisation faible (visiteurs occasionnels)")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Ecological connectivity - Is the planting area connected to other natural habitats or green spaces?", "Connectivité écologique - La zone de plantation est-elle connectée à d'autres habitats naturels ou espaces verts?")}
                      </label>
                      <select
                        value={parkEcologicalConnectivity}
                        onChange={e => setParkEcologicalConnectivity(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="adjacent">{t("Yes - directly adjacent to forest, ravine, or natural area", "Oui - directement adjacent à une forêt, un ravin ou une zone naturelle")}</option>
                        <option value="within100m">{t("Yes - within 100m of other green spaces", "Oui - dans un rayon de 100 m d'autres espaces verts")}</option>
                        <option value="somewhat">{t("Somewhat - isolated but part of broader green network", "Quelque peu - isolé mais faisant partie d'un réseau vert plus large")}</option>
                        <option value="no">{t("No - surrounded by urban development", "Non - entouré de développement urbain")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Combined interventions - Is this tree planting project combined with other habitat or ecological improvements? (Check all that apply)", "Interventions combinées - Ce projet de plantation d'arbres est-il combiné à d'autres améliorations d'habitat ou écologiques? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "none", labelEn: "No additional measures - trees only", labelFr: "Aucune mesure supplémentaire - arbres seulement" },
                          { id: "shrubs", labelEn: "Yes - adding shrub layer plantings", labelFr: "Oui - ajout de plantations de couche arbustive" },
                          { id: "groundcover", labelEn: "Yes - establishing native groundcover or wildflowers", labelFr: "Oui - établissement de couvre-sol indigène ou de fleurs sauvages" },
                          { id: "wildlife", labelEn: "Yes - creating wildlife habitat features (snags, brush piles, nest boxes)", labelFr: "Oui - création de caractéristiques d'habitat faunique (chicots, tas de broussailles, nichoirs)" },
                          { id: "invasive", labelEn: "Yes - removing invasive species", labelFr: "Oui - élimination des espèces envahissantes" },
                          { id: "soil", labelEn: "Yes - improving soil conditions", labelFr: "Oui - amélioration des conditions du sol" },
                          { id: "water", labelEn: "Yes - enhancing water features (ponds, streams, wetlands)", labelFr: "Oui - amélioration des caractéristiques de l'eau (étangs, ruisseaux, zones humides)" },
                          { id: "pollinator", labelEn: "Yes - installing pollinator gardens", labelFr: "Oui - installation de jardins pour pollinisateurs" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={parkCombinedInterventions.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setParkCombinedInterventions([...parkCombinedInterventions, opt.id]);
                                } else {
                                  setParkCombinedInterventions(parkCombinedInterventions.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
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

              {/* Riparian Planting Questions */}
              {supportedActivities.includes("riparian") && (
                <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {t("Riparian Planting in Flood-Prone Areas", "Plantation riveraine en zones inondables")}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Length of riparian corridor - What is the total length of riparian corridor being planted? (m or km)", "Longueur du corridor riverain - Quelle est la longueur totale du corridor riverain planté? (m ou km)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={riparianLengthM ?? ""}
                        onChange={e =>
                          setRiparianLengthM(
                            e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Native species - What percentage of the species are native riparian species?", "Espèces indigènes - Quel pourcentage des espèces sont des espèces riveraines indigènes?")}
                      </label>
                      <select
                        value={riparianNativeSpeciesPercent}
                        onChange={e => setRiparianNativeSpeciesPercent(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="100">{t("All native riparian species (100%)", "Toutes les espèces riveraines indigènes (100%)")}</option>
                        <option value="75-99">{t("Mostly native riparian (75-99%)", "Principalement riveraines indigènes (75-99%)")}</option>
                        <option value="25-74">{t("Mix of riparian and upland native (25-74%)", "Mélange de riveraines et d'indigènes des hautes terres (25-74%)")}</option>
                        <option value="less25">{t("Some non-native species included (less than 25% native)", "Quelques espèces non-indigènes incluses (moins de 25% indigènes)")}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Tree size - What is the typical size of trees at planting?", "Taille des arbres - Quelle est la taille typique des arbres à la plantation?")}
                      </label>
                      <select
                        value={riparianTreeSize}
                        onChange={e => setRiparianTreeSize(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="stakes">{t("Live stakes or cuttings (willows, dogwoods)", "Tuteurs vivants ou boutures (saules, cornouillers)")}</option>
                        <option value="seedlings">{t("Seedlings (less than 30cm height)", "Semis (moins de 30 cm de hauteur)")}</option>
                        <option value="whips">{t("Whips/saplings (30cm-1.5m height)", "Baguettes/jeunes plants (30 cm-1,5 m de hauteur)")}</option>
                        <option value="small">{t("Small stock (1.5-2.5m height)", "Petit stock (1,5-2,5 m de hauteur)")}</option>
                        <option value="medium">{t("Medium stock (2.5-4m height)", "Stock moyen (2,5-4 m de hauteur)")}</option>
                        <option value="mixed">{t("Mixed sizes", "Tailles mixtes")}</option>
                      </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Buffer - What is the buffer width from the watercourse?", "Zone tampon - Quelle est la largeur de la zone tampon depuis le cours d'eau?")}
                        </label>
                        <select
                          value={riparianBufferWidth}
                          onChange={e => setRiparianBufferWidth(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="narrow">{t("Narrow (less than 10m from water's edge)", "Étroite (moins de 10 m du bord de l'eau)")}</option>
                          <option value="moderate">{t("Moderate (10-30m from water's edge)", "Modérée (10-30 m du bord de l'eau)")}</option>
                          <option value="wide">{t("Wide (more than 30m from water's edge)", "Large (plus de 30 m du bord de l'eau)")}</option>
                          <option value="variable">{t("Variable width along corridor", "Largeur variable le long du corridor")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Density - What is the planting density?", "Densité - Quelle est la densité de plantation?")}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            min="0"
                            placeholder={t("trees/m", "arbres/m")}
                            value={riparianDensityPerM ?? ""}
                            onChange={e =>
                              setRiparianDensityPerM(
                                e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                              )
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                          />
                          <input
                            type="number"
                            min="0"
                            placeholder={t("trees/ha", "arbres/ha")}
                            value={riparianDensityPerHa ?? ""}
                            onChange={e =>
                              setRiparianDensityPerHa(
                                e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                              )
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Type of water stream - What type of watercourse is being planted?", "Type de cours d'eau - Quel type de cours d'eau est planté?")}
                      </label>
                      <select
                        value={riparianWatercourseType}
                        onChange={e => setRiparianWatercourseType(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="river">{t("River (large, permanent flow)", "Rivière (grande, débit permanent)")}</option>
                        <option value="stream">{t("Stream (medium, permanent or seasonal flow)", "Ruisseau (moyen, débit permanent ou saisonnier)")}</option>
                        <option value="creek">{t("Creek (small, may be intermittent)", "Cours d'eau (petit, peut être intermittent)")}</option>
                        <option value="drainage">{t("Drainage channel or ditch", "Canal de drainage ou fossé")}</option>
                        <option value="lakeshore">{t("Lakeshore or pond edge", "Rive de lac ou bord d'étang")}</option>
                        <option value="wetland">{t("Wetland edge", "Bord de zone humide")}</option>
                        <option value="other">{t("Other", "Autre")}</option>
                      </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Flood - Does this area have a history of flooding?", "Inondation - Cette zone a-t-elle des antécédents d'inondation?")}
                        </label>
                        <select
                          value={riparianFloodHistory}
                          onChange={e => setRiparianFloodHistory(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="frequent">{t("Yes - frequent flooding (annually or more)", "Oui - inondations fréquentes (annuellement ou plus)")}</option>
                          <option value="occasional">{t("Yes - occasional flooding (every few years)", "Oui - inondations occasionnelles (tous les quelques années)")}</option>
                          <option value="rare">{t("Yes - rare but significant flood events", "Oui - événements d'inondation rares mais importants")}</option>
                          <option value="no">{t("No significant flooding history", "Aucun antécédent d'inondation significatif")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Risk properties - Are there properties or infrastructure at risk from flooding in this area?", "Propriétés à risque - Y a-t-il des propriétés ou des infrastructures à risque d'inondation dans cette zone?")}
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { id: "residential", labelEn: "Yes - residential properties", labelFr: "Oui - propriétés résidentielles" },
                            { id: "commercial", labelEn: "Yes - commercial/industrial properties", labelFr: "Oui - propriétés commerciales/industrielles" },
                            { id: "infrastructure", labelEn: "Yes - critical infrastructure (roads, bridges, utilities)", labelFr: "Oui - infrastructure critique (routes, ponts, services publics)" },
                            { id: "agricultural", labelEn: "Yes - agricultural land", labelFr: "Oui - terres agricoles" },
                            { id: "natural", labelEn: "No - primarily natural areas", labelFr: "Non - principalement des zones naturelles" },
                            { id: "unknown", labelEn: "Don't know", labelFr: "Je ne sais pas" }
                          ].map(opt => (
                            <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={riparianRiskProperties.includes(opt.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setRiparianRiskProperties([...riparianRiskProperties, opt.id]);
                                  } else {
                                    setRiparianRiskProperties(riparianRiskProperties.filter(x => x !== opt.id));
                                  }
                                }}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                              />
                              <span className="text-[11px] text-slate-700">
                                {language === "fr" ? opt.labelFr : opt.labelEn}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Soil type - What is the primary soil type in the planting area?", "Type de sol - Quel est le type de sol principal dans la zone de plantation?")}
                        </label>
                        <select
                          value={riparianSoilType}
                          onChange={e => setRiparianSoilType(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="sandy">{t("Sandy (well-drained, prone to erosion)", "Sableux (bien drainé, sujet à l'érosion)")}</option>
                          <option value="loam">{t("Loam (balanced texture)", "Limon (texture équilibrée)")}</option>
                          <option value="clay">{t("Clay (poorly drained, stable when vegetated)", "Argileux (mal drainé, stable lorsqu'il est végétalisé)")}</option>
                          <option value="organic">{t("Organic/mucky (wetland soils)", "Organique/boueux (sols de zone humide)")}</option>
                          <option value="rocky">{t("Rocky or gravelly", "Rocailleux ou graveleux")}</option>
                          <option value="mixed">{t("Mix of soil types", "Mélange de types de sol")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Erosion - What is the current level of erosion in the planting area?", "Érosion - Quel est le niveau actuel d'érosion dans la zone de plantation?")}
                        </label>
                        <select
                          value={riparianErosion}
                          onChange={e => setRiparianErosion(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="severe">{t("Severe erosion - active bank failure or gullying", "Érosion sévère - échec actif des berges ou ravinement")}</option>
                          <option value="moderate">{t("Moderate erosion - visible but stable", "Érosion modérée - visible mais stable")}</option>
                          <option value="minor">{t("Minor erosion - some evidence of soil loss", "Érosion mineure - quelques preuves de perte de sol")}</option>
                          <option value="stable">{t("Stable - no significant erosion", "Stable - aucune érosion significative")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Combined interventions - Is this riparian planting project combined with other restoration or flood management measures? (Check all that apply)", "Interventions combinées - Ce projet de plantation riveraine est-il combiné à d'autres mesures de restauration ou de gestion des inondations? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "none", labelEn: "No additional measures - trees only", labelFr: "Aucune mesure supplémentaire - arbres seulement" },
                          { id: "stabilization", labelEn: "Yes - stream bank stabilization (bioengineering, rock, etc.)", labelFr: "Oui - stabilisation des berges (génie biologique, roche, etc.)" },
                          { id: "invasive", labelEn: "Yes - removing invasive species", labelFr: "Oui - élimination des espèces envahissantes" },
                          { id: "shrubs", labelEn: "Yes - adding shrub and groundcover layers", labelFr: "Oui - ajout de couches d'arbustes et de couvre-sol" },
                          { id: "floodplain", labelEn: "Yes - floodplain restoration or reconnection", labelFr: "Oui - restauration ou reconnexion de la plaine inondable" },
                          { id: "instream", labelEn: "Yes - in-stream habitat improvements (large woody debris, pools)", labelFr: "Oui - améliorations de l'habitat en cours d'eau (gros débris ligneux, bassins)" },
                          { id: "stormwater", labelEn: "Yes - stormwater management upstream", labelFr: "Oui - gestion des eaux pluviales en amont" },
                          { id: "fencing", labelEn: "Yes - livestock exclusion fencing", labelFr: "Oui - clôture d'exclusion du bétail" },
                          { id: "wetland", labelEn: "Yes - wetland creation or enhancement", labelFr: "Oui - création ou amélioration de zones humides" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={riparianCombinedInterventions.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setRiparianCombinedInterventions([...riparianCombinedInterventions, opt.id]);
                                } else {
                                  setRiparianCombinedInterventions(riparianCombinedInterventions.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Forest Restoration Questions */}
              {supportedActivities.includes("forestRestorationActivity") && (
                <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {t("Forest Restoration and Reforestation", "Restauration forestière et reboisement")}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the total area being restored or reforested? (hectares)", "Quelle est la superficie totale restaurée ou reboisée? (hectares)")}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={forestRestorationAreaHa2 ?? ""}
                          onChange={e =>
                            setForestRestorationAreaHa2(
                              e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("How many trees will be planted in total?", "Combien d'arbres seront plantés au total?")}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={numberOfTrees}
                            onChange={e =>
                              setNumberOfTrees(Math.max(0, Number(e.target.value) || 0))
                            }
                            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                          />
                          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={forestNaturalRegeneration}
                              onChange={e => setForestNaturalRegeneration(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {t("Natural regeneration", "Régénération naturelle")}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the planting density? (trees/ha)", "Quelle est la densité de plantation? (arbres/ha)")}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={forestPlantingDensity ?? ""}
                            onChange={e =>
                              setForestPlantingDensity(
                                e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0)
                              )
                            }
                            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                          />
                          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={forestVariableDensity}
                              onChange={e => setForestVariableDensity(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {t("Variable", "Variable")}
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What percentage of species match the local native forest type?", "Quel pourcentage des espèces correspondent au type de forêt indigène local?")}
                        </label>
                        <select
                          value={forestNativeMatchPercent}
                          onChange={e => setForestNativeMatchPercent(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="100">{t("All native to local forest type (100%)", "Toutes indigènes au type de forêt local (100%)")}</option>
                          <option value="75-99">{t("Mostly native (75-99%)", "Principalement indigènes (75-99%)")}</option>
                          <option value="25-74">{t("Mix of native and other adapted species (25-74%)", "Mélange d'indigènes et d'autres espèces adaptées (25-74%)")}</option>
                          <option value="less25">{t("Some non-native species included (less than 25% native)", "Quelques espèces non-indigènes incluses (moins de 25% indigènes)")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("What is the typical size of trees at planting?", "Quelle est la taille typique des arbres à la plantation?")}
                      </label>
                      <select
                        value={forestTreeSize}
                        onChange={e => setForestTreeSize(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="seeds">{t("Seeds (direct seeding)", "Graines (ensemencement direct)")}</option>
                        <option value="seedlings">{t("Seedlings (less than 30cm height)", "Semis (moins de 30 cm de hauteur)")}</option>
                        <option value="bareRoot">{t("Bare root transplants (30cm-1m height)", "Transplants à racines nues (30 cm-1 m de hauteur)")}</option>
                        <option value="container">{t("Container stock (various sizes)", "Stock en conteneur (diverses tailles)")}</option>
                        <option value="large">{t("Larger transplants (more than 1m height)", "Transplants plus grands (plus de 1 m de hauteur)")}</option>
                        <option value="mixed">{t("Mixed sizes", "Tailles mixtes")}</option>
                        <option value="natural">{t("Natural regeneration only", "Régénération naturelle uniquement")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("What is the primary restoration approach? (Check all that apply)", "Quelle est l'approche principale de restauration? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "active", labelEn: "Active tree planting", labelFr: "Plantation active d'arbres" },
                          { id: "seeding", labelEn: "Direct seeding", labelFr: "Ensemencement direct" },
                          { id: "natural", labelEn: "Supporting natural regeneration (no planting)", labelFr: "Soutenir la régénération naturelle (pas de plantation)" },
                          { id: "assisted", labelEn: "Assisted natural regeneration (removing barriers + some planting)", labelFr: "Régénération naturelle assistée (élimination des obstacles + quelques plantations)" },
                          { id: "mixed", labelEn: "Mix of approaches across site", labelFr: "Mélange d'approches sur le site" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={forestRestorationApproach.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForestRestorationApproach([...forestRestorationApproach, opt.id]);
                                } else {
                                  setForestRestorationApproach(forestRestorationApproach.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("What type of disturbance affected this forest area? (Check all that apply)", "Quel type de perturbation a affecté cette zone forestière? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "pests", labelEn: "Insect pest outbreak (e.g., mountain pine beetle, emerald ash borer)", labelFr: "Épidémie de ravageurs (p. ex., dendroctone du pin ponderosa, agrile du frêne)" },
                          { id: "disease", labelEn: "Disease (e.g., Dutch elm, sudden oak death)", labelFr: "Maladie (p. ex., maladie hollandaise de l'orme, mort subite du chêne)" },
                          { id: "wildfire", labelEn: "Wildfire", labelFr: "Feu de forêt" },
                          { id: "logging", labelEn: "Timber harvest/logging", labelFr: "Récolte de bois/exploitation forestière" },
                          { id: "clearing", labelEn: "Land clearing for agriculture or development", labelFr: "Défrichement pour l'agriculture ou le développement" },
                          { id: "storm", labelEn: "Storm damage (wind, ice)", labelFr: "Dommages causés par les tempêtes (vent, glace)" },
                          { id: "multiple", labelEn: "Multiple disturbances", labelFr: "Perturbations multiples" },
                          { id: "other", labelEn: "Other", labelFr: "Autre" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={forestDisturbanceType.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForestDisturbanceType([...forestDisturbanceType, opt.id]);
                                } else {
                                  setForestDisturbanceType(forestDisturbanceType.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What was the severity of the disturbance?", "Quelle était la gravité de la perturbation?")}
                        </label>
                        <select
                          value={forestDisturbanceSeverity}
                          onChange={e => setForestDisturbanceSeverity(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="complete">{t("Complete loss - no trees remaining", "Perte complète - aucun arbre restant")}</option>
                          <option value="severe">{t("Severe - more than 75% tree mortality", "Sévère - plus de 75% de mortalité des arbres")}</option>
                          <option value="moderate">{t("Moderate - 25-75% tree mortality", "Modérée - 25-75% de mortalité des arbres")}</option>
                          <option value="light">{t("Light - less than 25% tree mortality", "Légère - moins de 25% de mortalité des arbres")}</option>
                          <option value="variable">{t("Variable across site", "Variable sur le site")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("How long ago did the disturbance occur?", "Il y a combien de temps la perturbation s'est-elle produite?")}
                        </label>
                        <select
                          value={forestDisturbanceTime}
                          onChange={e => setForestDisturbanceTime(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="withinYear">{t("Within the past year", "Au cours de la dernière année")}</option>
                          <option value="1-5">{t("1-5 years ago", "Il y a 1-5 ans")}</option>
                          <option value="5-10">{t("5-10 years ago", "Il y a 5-10 ans")}</option>
                          <option value="10-20">{t("10-20 years ago", "Il y a 10-20 ans")}</option>
                          <option value="more20">{t("More than 20 years ago", "Il y a plus de 20 ans")}</option>
                          <option value="multiple">{t("Multiple disturbances at different times", "Perturbations multiples à des moments différents")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Are there remaining seed sources near or within the restoration area?", "Y a-t-il des sources de graines restantes près ou dans la zone de restauration?")}
                        </label>
                        <select
                          value={forestSeedSources}
                          onChange={e => setForestSeedSources(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="abundant">{t("Yes - abundant mature trees nearby (within 100m)", "Oui - nombreux arbres matures à proximité (dans un rayon de 100 m)")}</option>
                          <option value="some">{t("Yes - some seed sources present (100-500m away)", "Oui - quelques sources de graines présentes (100-500 m)")}</option>
                          <option value="limited">{t("Limited - distant seed sources (more than 500m)", "Limité - sources de graines distantes (plus de 500 m)")}</option>
                          <option value="no">{t("No - isolated from seed sources", "Non - isolé des sources de graines")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the current condition of natural regeneration on site?", "Quelle est l'état actuel de la régénération naturelle sur le site?")}
                        </label>
                        <select
                          value={forestNaturalRegenCondition}
                          onChange={e => setForestNaturalRegenCondition(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="good">{t("Good natural regeneration occurring", "Bonne régénération naturelle en cours")}</option>
                          <option value="some">{t("Some natural regeneration but insufficient", "Quelque régénération naturelle mais insuffisante")}</option>
                          <option value="limited">{t("Very limited natural regeneration", "Régénération naturelle très limitée")}</option>
                          <option value="no">{t("No natural regeneration observed", "Aucune régénération naturelle observée")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the soil condition in the restoration area?", "Quelle est l'état du sol dans la zone de restauration?")}
                        </label>
                        <select
                          value={forestSoilCondition}
                          onChange={e => setForestSoilCondition(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="good">{t("Good quality - intact organic layer and structure", "Bonne qualité - couche organique et structure intactes")}</option>
                          <option value="moderate">{t("Moderately degraded - some loss of organic matter", "Modérément dégradé - perte de matière organique")}</option>
                          <option value="severe">{t("Severely degraded - compacted or eroded", "Sévèrement dégradé - compacté ou érodé")}</option>
                          <option value="contaminated">{t("Contaminated or disturbed by development", "Contaminé ou perturbé par le développement")}</option>
                          <option value="variable">{t("Variable across site", "Variable sur le site")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the level of invasive species presence?", "Quel est le niveau de présence d'espèces envahissantes?")}
                        </label>
                        <select
                          value={forestInvasiveSpecies}
                          onChange={e => setForestInvasiveSpecies(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="severe">{t("Severe - invasive species dominating site", "Sévère - espèces envahissantes dominant le site")}</option>
                          <option value="moderate">{t("Moderate - invasive species present and spreading", "Modérée - espèces envahissantes présentes et en expansion")}</option>
                          <option value="low">{t("Low - some invasive species but manageable", "Faible - quelques espèces envahissantes mais gérables")}</option>
                          <option value="none">{t("None - no significant invasive species", "Aucune - aucune espèce envahissante significative")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("What is the current vegetation cover on the site?", "Quelle est la couverture végétale actuelle sur le site?")}
                      </label>
                      <select
                        value={forestVegetationCover}
                        onChange={e => setForestVegetationCover(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="bare">{t("Bare or mostly bare ground", "Sol nu ou principalement nu")}</option>
                        <option value="grasses">{t("Grasses and herbs dominating", "Herbes et plantes herbacées dominantes")}</option>
                        <option value="shrubs">{t("Shrubs and early successional species", "Arbustes et espèces de succession précoce")}</option>
                        <option value="mixed">{t("Mix of vegetation types", "Mélange de types de végétation")}</option>
                        <option value="invasive">{t("Invasive species dominating", "Espèces envahissantes dominantes")}</option>
                        <option value="remnants">{t("Some surviving forest remnants", "Quelques vestiges de forêt survivants")}</option>
                      </select>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("How close is the restoration area to intact forest patches?", "À quelle distance la zone de restauration se trouve-t-elle des parcelles de forêt intactes?")}
                        </label>
                        <select
                          value={forestProximityToForest}
                          onChange={e => setForestProximityToForest(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="adjacent">{t("Directly adjacent to intact forest", "Directement adjacent à une forêt intacte")}</option>
                          <option value="within100m">{t("Within 100m of intact forest", "Dans un rayon de 100 m d'une forêt intacte")}</option>
                          <option value="within500m">{t("Within 500m of intact forest", "Dans un rayon de 500 m d'une forêt intacte")}</option>
                          <option value="within1-5km">{t("Within 1-5 km of intact forest", "Dans un rayon de 1-5 km d'une forêt intacte")}</option>
                          <option value="more5km">{t("More than 5 km from intact forest", "Plus de 5 km d'une forêt intacte")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the size of nearby intact forest patches?", "Quelle est la taille des parcelles de forêt intactes à proximité?")}
                        </label>
                        <select
                          value={forestNearbyForestSize}
                          onChange={e => setForestNearbyForestSize(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="large">{t("Large intact forest (more than 100 hectares)", "Grande forêt intacte (plus de 100 hectares)")}</option>
                          <option value="medium">{t("Medium forest patches (10-100 hectares)", "Parcelles de forêt moyennes (10-100 hectares)")}</option>
                          <option value="small">{t("Small forest patches (less than 10 hectares)", "Petites parcelles de forêt (moins de 10 hectares)")}</option>
                          <option value="scattered">{t("Only scattered trees, no forest patches", "Seulement des arbres dispersés, pas de parcelles de forêt")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What is the accessibility of the site for maintenance and monitoring?", "Quelle est l'accessibilité du site pour l'entretien et le suivi?")}
                        </label>
                        <select
                          value={forestAccessibility}
                          onChange={e => setForestAccessibility(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="easy">{t("Easy access - near roads, flat terrain", "Accès facile - près des routes, terrain plat")}</option>
                          <option value="moderate">{t("Moderate access - some distance or rough terrain", "Accès modéré - quelque distance ou terrain accidenté")}</option>
                          <option value="difficult">{t("Difficult access - remote or steep terrain", "Accès difficile - terrain éloigné ou escarpé")}</option>
                          <option value="veryDifficult">{t("Very difficult access - requires special equipment", "Accès très difficile - nécessite un équipement spécial")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("What type of forest ecosystem are you restoring?", "Quel type d'écosystème forestier restaurez-vous?")}
                        </label>
                        <select
                          value={forestEcosystemType}
                          onChange={e => setForestEcosystemType(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="boreal">{t("Boreal forest (northern coniferous)", "Forêt boréale (conifères du nord)")}</option>
                          <option value="temperateDeciduous">{t("Temperate deciduous forest", "Forêt décidue tempérée")}</option>
                          <option value="mixedTemperate">{t("Mixed temperate forest", "Forêt tempérée mixte")}</option>
                          <option value="coastal">{t("Coastal rainforest", "Forêt pluviale côtière")}</option>
                          <option value="mountain">{t("Mountain/montane forest", "Forêt de montagne/montagnarde")}</option>
                          <option value="other">{t("Other", "Autre")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("Are you pursuing or planning to pursue carbon credits for this project?", "Poursuivez-vous ou prévoyez-vous de poursuivre des crédits carbone pour ce projet?")}
                        </label>
                        <select
                          value={forestCarbonCredits}
                          onChange={e => setForestCarbonCredits(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="yes">{t("Yes - carbon credits are a primary objective", "Oui - les crédits carbone sont un objectif principal")}</option>
                          <option value="considering">{t("Considering it - may pursue in the future", "Envisageant - peut poursuivre à l'avenir")}</option>
                          <option value="no">{t("No - not pursuing carbon credits", "Non - ne poursuit pas de crédits carbone")}</option>
                          <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          {t("If pursuing carbon credits, do you have baseline carbon measurements?", "Si vous poursuivez des crédits carbone, avez-vous des mesures de carbone de référence?")}
                        </label>
                        <select
                          value={forestBaselineCarbon}
                          onChange={e => setForestBaselineCarbon(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">{t("Select...", "Sélectionner...")}</option>
                          <option value="na">{t("Not applicable - not pursuing carbon credits", "Non applicable - ne poursuit pas de crédits carbone")}</option>
                          <option value="yes">{t("Yes - baseline assessment completed", "Oui - évaluation de référence terminée")}</option>
                          <option value="planning">{t("No - but planning to establish baseline", "Non - mais prévoit d'établir une référence")}</option>
                          <option value="no">{t("No - and not planning baseline assessment", "Non - et ne prévoit pas d'évaluation de référence")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Is this forest restoration project combined with other ecological improvements? (Check all that apply)", "Ce projet de restauration forestière est-il combiné à d'autres améliorations écologiques? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "none", labelEn: "No additional measures - trees only", labelFr: "Aucune mesure supplémentaire - arbres seulement" },
                          { id: "invasive", labelEn: "Yes - removing invasive species", labelFr: "Oui - élimination des espèces envahissantes" },
                          { id: "soil", labelEn: "Yes - soil amendments or improvements", labelFr: "Oui - amendements ou améliorations du sol" },
                          { id: "wildlife", labelEn: "Yes - wildlife habitat features (snags, coarse woody debris)", labelFr: "Oui - caractéristiques d'habitat faunique (chicots, gros débris ligneux)" },
                          { id: "water", labelEn: "Yes - restoring water features (streams, wetlands)", labelFr: "Oui - restauration des caractéristiques de l'eau (ruisseaux, zones humides)" },
                          { id: "corridors", labelEn: "Yes - creating wildlife corridors", labelFr: "Oui - création de corridors fauniques" },
                          { id: "fire", labelEn: "Yes - prescribed burning or fire management", labelFr: "Oui - brûlage dirigé ou gestion des incendies" },
                          { id: "protecting", labelEn: "Yes - protecting remaining mature trees", labelFr: "Oui - protection des arbres matures restants" },
                          { id: "herbivory", labelEn: "Yes - controlling herbivory (fencing, tree shelters)", labelFr: "Oui - contrôle de l'herbivorie (clôtures, abris d'arbres)" },
                          { id: "other", labelEn: "Other restoration measures", labelFr: "Autres mesures de restauration" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={forestCombinedInterventions.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForestCombinedInterventions([...forestCombinedInterventions, opt.id]);
                                } else {
                                  setForestCombinedInterventions(forestCombinedInterventions.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700">
                        {t("What are the primary objectives of this restoration project? (Check all that apply)", "Quels sont les objectifs principaux de ce projet de restauration? (Cochez tout ce qui s'applique)")}
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: "biodiversity", labelEn: "Biodiversity and habitat restoration", labelFr: "Restauration de la biodiversité et de l'habitat" },
                          { id: "carbon", labelEn: "Carbon sequestration and climate mitigation", labelFr: "Séquestration du carbone et atténuation du climat" },
                          { id: "timber", labelEn: "Timber production (future harvest)", labelFr: "Production de bois (récolte future)" },
                          { id: "watershed", labelEn: "Watershed protection and water quality", labelFr: "Protection du bassin versant et qualité de l'eau" },
                          { id: "erosion", labelEn: "Erosion control and soil stabilization", labelFr: "Contrôle de l'érosion et stabilisation du sol" },
                          { id: "recreation", labelEn: "Recreation and education opportunities", labelFr: "Opportunités de loisirs et d'éducation" },
                          { id: "cultural", labelEn: "Cultural or spiritual significance", labelFr: "Signification culturelle ou spirituelle" },
                          { id: "wildfire", labelEn: "Wildfire fuel management", labelFr: "Gestion du combustible d'incendie" },
                          { id: "economic", labelEn: "Economic benefits (jobs, wood products)", labelFr: "Avantages économiques (emplois, produits du bois)" },
                          { id: "other", labelEn: "Other", labelFr: "Autre" }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={forestObjectives.includes(opt.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForestObjectives([...forestObjectives, opt.id]);
                                } else {
                                  setForestObjectives(forestObjectives.filter(x => x !== opt.id));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-[11px] text-slate-700">
                              {language === "fr" ? opt.labelFr : opt.labelEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("What is the expected timeline for forest establishment?", "Quel est le calendrier prévu pour l'établissement de la forêt?")}
                      </label>
                      <select
                        value={forestTimeline}
                        onChange={e => setForestTimeline(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                      >
                        <option value="">{t("Select...", "Sélectionner...")}</option>
                        <option value="short">{t("Short-term (5-10 years to establishment)", "Court terme (5-10 ans jusqu'à l'établissement)")}</option>
                        <option value="medium">{t("Medium-term (10-20 years to establishment)", "Moyen terme (10-20 ans jusqu'à l'établissement)")}</option>
                        <option value="long">{t("Long-term (20+ years to establishment)", "Long terme (20+ ans jusqu'à l'établissement)")}</option>
                        <option value="multigenerational">{t("Multi-generational timeline", "Calendrier multi-générationnel")}</option>
                        <option value="unknown">{t("Don't know", "Je ne sais pas")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="space-y-6">
              {benefitCategoriesByGroup.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-3">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                    {language === "fr" ? group.groupFr : group.groupEn}
                  </h5>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.benefits.map(cat => {
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
                </div>
              ))}
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


"use client";

import { useState, useEffect } from "react";
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

type GcccPlantingSiteType =
  | "streetPlanting"
  | "parkPlanting"
  | "naturalAreasPlanting"
  | "otherPlantingAreas";

type GcccLandUseType =
  | "transportationCorridors"
  | "recreationalAreas"
  | "conservationAreas"
  | "institutionalAreas"
  | "residentialAreas"
  | "otherLandUse";

function deriveGcccTags(params: {
  projectTypology: ProjectTypology | null;
  supportedActivities: SupportedActivity[];
  projectAreaContext: string;
  localizedSiteContext: string;
}): { plantingSiteTypes: GcccPlantingSiteType[]; landUseTypes: GcccLandUseType[] } {
  const { projectTypology, supportedActivities, projectAreaContext, localizedSiteContext } =
    params;

  const plantingSiteTypes = new Set<GcccPlantingSiteType>();
  const landUseTypes = new Set<GcccLandUseType>();

  // Planting site types (GCCC 1.x)
  if (supportedActivities.includes("streetTrees")) {
    plantingSiteTypes.add("streetPlanting");
  }
  if (supportedActivities.includes("parkTrees")) {
    plantingSiteTypes.add("parkPlanting");
  }
  if (
    supportedActivities.includes("forestRestorationActivity") ||
    supportedActivities.includes("riparian") ||
    projectTypology === "forestRestoration"
  ) {
    plantingSiteTypes.add("naturalAreasPlanting");
  }
  if (
    supportedActivities.includes("urbanLowCanopy") ||
    (plantingSiteTypes.size === 0 && projectTypology === "communityWideUrbanPlanting")
  ) {
    plantingSiteTypes.add("otherPlantingAreas");
  }

  // Land use types (GCCC 2.x)
  // Transportation corridors
  if (
    supportedActivities.includes("streetTrees") ||
    localizedSiteContext === "corridor" ||
    projectAreaContext === "industrial"
  ) {
    landUseTypes.add("transportationCorridors");
  }

  // Recreational areas
  if (
    supportedActivities.includes("parkTrees") ||
    localizedSiteContext === "park"
  ) {
    landUseTypes.add("recreationalAreas");
  }

  // Conservation areas
  if (
    supportedActivities.includes("forestRestorationActivity") ||
    supportedActivities.includes("riparian") ||
    projectTypology === "forestRestoration"
  ) {
    landUseTypes.add("conservationAreas");
  }

  // Institutional areas
  if (localizedSiteContext === "school") {
    landUseTypes.add("institutionalAreas");
  }

  // Residential areas
  if (
    projectAreaContext === "urbanNeighbourhood" ||
    projectAreaContext === "suburban" ||
    projectAreaContext === "rural" ||
    supportedActivities.includes("urbanLowCanopy")
  ) {
    landUseTypes.add("residentialAreas");
  }

  // Fallback to other if nothing matched
  if (landUseTypes.size === 0) {
    landUseTypes.add("otherLandUse");
  }

  return {
    plantingSiteTypes: Array.from(plantingSiteTypes),
    landUseTypes: Array.from(landUseTypes)
  };
}

const canadianMunicipalities: {
  name: string;
  province: string;
  region: Region;
  population: number;
  areaKm2: number;
}[] = [
  // Approximate values based on Statistics Canada profiles (for demo purposes)
  { name: "Halifax", province: "NS", region: "atlantic", population: 439819, areaKm2: 5490.4 },
  { name: "Charlottetown", province: "PE", region: "atlantic", population: 38509, areaKm2: 44.3 },
  { name: "St. John's", province: "NL", region: "atlantic", population: 110525, areaKm2: 446.0 },
  { name: "Moncton", province: "NB", region: "atlantic", population: 79471, areaKm2: 142.0 },
  { name: "Québec City", province: "QC", region: "quebec", population: 549459, areaKm2: 485.8 },
  { name: "Montréal", province: "QC", region: "quebec", population: 1780000, areaKm2: 431.5 },
  { name: "Gatineau", province: "QC", region: "quebec", population: 291041, areaKm2: 342.8 },
  { name: "Toronto", province: "ON", region: "ontario", population: 2794356, areaKm2: 630.2 },
  { name: "Ottawa", province: "ON", region: "ontario", population: 1017449, areaKm2: 2790.3 },
  { name: "Hamilton", province: "ON", region: "ontario", population: 569353, areaKm2: 1117.3 },
  { name: "Winnipeg", province: "MB", region: "prairies", population: 749607, areaKm2: 464.1 },
  { name: "Saskatoon", province: "SK", region: "prairies", population: 266141, areaKm2: 228.1 },
  { name: "Calgary", province: "AB", region: "prairies", population: 1306784, areaKm2: 825.3 },
  { name: "Edmonton", province: "AB", region: "prairies", population: 1010899, areaKm2: 767.9 },
  { name: "Vancouver", province: "BC", region: "bc", population: 662248, areaKm2: 114.7 },
  { name: "Victoria", province: "BC", region: "bc", population: 91967, areaKm2: 19.5 },
  { name: "Whitehorse", province: "YT", region: "territories", population: 28698, areaKm2: 416.6 },
  { name: "Yellowknife", province: "NT", region: "territories", population: 20477, areaKm2: 136.2 },
  { name: "Iqaluit", province: "NU", region: "territories", population: 7740, areaKm2: 52.5 }
];

const provinceLabels: Record<
  string,
  {
    en: string;
    fr: string;
  }
> = {
  NL: { en: "Newfoundland and Labrador", fr: "Terre-Neuve-et-Labrador" },
  PE: { en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" },
  NS: { en: "Nova Scotia", fr: "Nouvelle-Écosse" },
  NB: { en: "New Brunswick", fr: "Nouveau-Brunswick" },
  QC: { en: "Quebec", fr: "Québec" },
  ON: { en: "Ontario", fr: "Ontario" },
  MB: { en: "Manitoba", fr: "Manitoba" },
  SK: { en: "Saskatchewan", fr: "Saskatchewan" },
  AB: { en: "Alberta", fr: "Alberta" },
  BC: { en: "British Columbia", fr: "Colombie-Britannique" },
  YT: { en: "Yukon", fr: "Yukon" },
  NT: { en: "Northwest Territories", fr: "Territoires du Nord-Ouest" },
  NU: { en: "Nunavut", fr: "Nunavut" }
};

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
      { id: "culturalValues", labelEn: "Cultural & Indigenous Values", labelFr: "Valeurs culturelles et autochtones" },
      {
        id: "safetySecurity",
        labelEn: "Safety & traffic calming",
        labelFr: "Sécurité et modération de la circulation"
      }
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

interface ContextParams {
  // Category 1: Climate & Environment
  annualRainfallMm: number;
  avgAnnualTempC: number;
  heatDaysPerYear: number;
  growingSeasonDays: number;
  baselineAqi: number;

  // Category 2: Demographics & Social
  municipalPopulation: number;
  medianIncome: number;
  age65PlusPct: number;
  age0To14Pct: number;
  workingAgePct: number;

  // Category 3: Economic Parameters
  avgResidentialPrice: number;
  avgCommercialPrice: number;
  electricityPrice: number;
  gasPrice: number;
  waterRate: number;
  avgHourlyWage: number;

  // Category 4: Infrastructure & Urban Form
  municipalAreaKm2: number;
  imperviousCoveragePct: number;
  avgStreetWidthM: number;
  parkSpacePerCapitaM2: number;

  // Category 5: Environmental Baseline
  municipalEmissionsTonnes: number;
  pm25UgM3: number;
  stormwaterRunoffMillionM3: number;
  heatIslandIntensityC: number;
  floodEventsPerDecade: number;

  // Category 6: Recreation & Tourism
  annualParkVisitors: number;
  tourismSpendingMillion: number;
  recreationValuePerVisit: number;

  // Category 7: Carbon Market Parameters
  carbonCreditPrice: number;
  socialCostOfCarbon: number;
}

export function CalculatorSteps({ language }: CalculatorStepsProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Scroll to top when step changes (e.g. after pressing Next)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const [projectName, setProjectName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const [showMunicipalitySuggestions, setShowMunicipalitySuggestions] =
    useState(false);
  const [municipalityIsCustom, setMunicipalityIsCustom] = useState(false);
  const [region, setRegion] = useState<Region>("ontario");
  const [municipalitySize, setMunicipalitySize] =
    useState<MunicipalitySize>("medium");
  const [populationServed, setPopulationServed] = useState(50000);
  const [householdsServed, setHouseholdsServed] = useState(20000);
  const [numberOfTrees, setNumberOfTrees] = useState(500);
  const [projectAreaHa, setProjectAreaHa] = useState(2);
  const [year, setYear] = useState(new Date().getFullYear());
  const [projectIncludesShrubs, setProjectIncludesShrubs] = useState(false);
  const [numberOfShrubs, setNumberOfShrubs] = useState<number | null>(null);

  // Tree planting details
  const [deciduousPercent, setDeciduousPercent] = useState(60);
  const [evergreenPercent, setEvergreenPercent] = useState(40);
  const [improvedGreenSpaceHa, setImprovedGreenSpaceHa] = useState(0);
  const [newTreesInFootpath, setNewTreesInFootpath] = useState(0);
  const [hasSustainableWaterSystems, setHasSustainableWaterSystems] = useState(false);
  const [sustainableWaterSystemTypes, setSustainableWaterSystemTypes] = useState<string[]>([]);

  // Project typology & activities
  const [projectTypology, setProjectTypology] =
    useState<ProjectTypology | null>(null);
  const [supportedActivities, setSupportedActivities] = useState<
    SupportedActivity[]
  >([]);

  // Optional contextual parameters (lower priority / advanced)
  const [showAdvancedContext, setShowAdvancedContext] = useState(false);
  const [showBenefitContext, setShowBenefitContext] = useState(false);
  const [populationDensity, setPopulationDensity] = useState(3200); // people / km²
  const [baselineCanopy, setBaselineCanopy] = useState(18); // %
  const [heatVulnerability, setHeatVulnerability] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [floodRisk, setFloodRisk] = useState<"low" | "medium" | "high">("medium");
  const [contextParams, setContextParams] = useState<ContextParams>({
    // Category 1: Climate & Environment
    annualRainfallMm: 845,
    avgAnnualTempC: 8.5,
    heatDaysPerYear: 12,
    growingSeasonDays: 180,
    baselineAqi: 42,

    // Category 2: Demographics & Social
    municipalPopulation: 85000,
    medianIncome: 78500,
    age65PlusPct: 16.8,
    age0To14Pct: 15.2,
    workingAgePct: 68.0,

    // Category 3: Economic Parameters
    avgResidentialPrice: 485000,
    avgCommercialPrice: 825000,
    electricityPrice: 0.125,
    gasPrice: 0.185,
    waterRate: 2.15,
    avgHourlyWage: 28.5,

    // Category 4: Infrastructure & Urban Form
    municipalAreaKm2: 142,
    imperviousCoveragePct: 38,
    avgStreetWidthM: 11.5,
    parkSpacePerCapitaM2: 12.5,

    // Category 5: Environmental Baseline
    municipalEmissionsTonnes: 285000,
    pm25UgM3: 6.8,
    stormwaterRunoffMillionM3: 3.2,
    heatIslandIntensityC: 2.8,
    floodEventsPerDecade: 2,

    // Category 6: Recreation & Tourism
    annualParkVisitors: 325000,
    tourismSpendingMillion: 42.5,
    recreationValuePerVisit: 15.0,

    // Category 7: Carbon Market Parameters
    carbonCreditPrice: 65,
    socialCostOfCarbon: 284
  });

  // Local context of planting area
  const [projectAreaContext, setProjectAreaContext] = useState<string>("");

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
    heatDaysPerYear: 15, // days >30°C
    typicalMaxSummerTempC: 35 // °C
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
  const [equityFocusLevel, setEquityFocusLevel] = useState<
    "none" | "consideration" | "primary"
  >("none");
  const [priorityGroups, setPriorityGroups] = useState<string[]>([]);
  const [priorityOther, setPriorityOther] = useState("");

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

  // Stakeholder panels on results view
  const [stakeholderType, setStakeholderType] = useState<string>("");
  const [stakeholderTitle, setStakeholderTitle] = useState<string>("");
  const [stakeholderEntries, setStakeholderEntries] = useState<
    { type: string; title: string }[]
  >([]);

  // Turf vs tree comparison modal
  const [showTurfComparison, setShowTurfComparison] = useState(false);
  const [treeSharePercent, setTreeSharePercent] = useState(100);

  const [results, setResults] = useState<BenefitResults | null>(null);

  // Simple local save / restore of core inputs so work isn't lost when navigating away
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tree-benefits-calculator-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.step) setStep(parsed.step);
      if (parsed.projectName) setProjectName(parsed.projectName);
      if (parsed.municipality) {
        setMunicipality(parsed.municipality);
        setMunicipalityQuery(parsed.municipality);
      }
      if (parsed.region) setRegion(parsed.region);
      if (parsed.municipalitySize) setMunicipalitySize(parsed.municipalitySize);
      if (typeof parsed.populationServed === "number")
        setPopulationServed(parsed.populationServed);
      if (typeof parsed.householdsServed === "number")
        setHouseholdsServed(parsed.householdsServed);
      if (typeof parsed.numberOfTrees === "number")
        setNumberOfTrees(parsed.numberOfTrees);
      if (typeof parsed.projectAreaHa === "number")
        setProjectAreaHa(parsed.projectAreaHa);
      if (typeof parsed.year === "number") setYear(parsed.year);
      if (typeof parsed.projectIncludesShrubs === "boolean")
        setProjectIncludesShrubs(parsed.projectIncludesShrubs);
      if (typeof parsed.numberOfShrubs === "number")
        setNumberOfShrubs(parsed.numberOfShrubs);
      if (Array.isArray(parsed.selectedBenefits))
        setSelectedBenefits(parsed.selectedBenefits);
      if (parsed.projectDescription)
        setProjectDescription(parsed.projectDescription);
      if (typeof parsed.projectCapitalCost === "number")
        setProjectCapitalCost(parsed.projectCapitalCost);
      if (typeof parsed.projectAnnualCost === "number")
        setProjectAnnualCost(parsed.projectAnnualCost);
      if (parsed.equityFocusLevel)
        setEquityFocusLevel(parsed.equityFocusLevel);
      if (Array.isArray(parsed.priorityGroups))
        setPriorityGroups(parsed.priorityGroups);
    } catch {
      // ignore restore errors in demo
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      step,
      projectName,
      municipality,
      region,
      municipalitySize,
      populationServed,
      householdsServed,
      numberOfTrees,
      projectAreaHa,
      year,
      projectIncludesShrubs,
      numberOfShrubs,
      selectedBenefits,
      projectDescription,
      projectCapitalCost,
      projectAnnualCost,
      equityFocusLevel,
      priorityGroups
    };
    try {
      window.localStorage.setItem(
        "tree-benefits-calculator-v1",
        JSON.stringify(payload)
      );
    } catch {
      // ignore save errors in demo
    }
  }, [
    step,
    projectName,
    municipality,
    region,
    municipalitySize,
    populationServed,
    householdsServed,
    numberOfTrees,
    projectAreaHa,
    year,
    projectIncludesShrubs,
    numberOfShrubs,
    selectedBenefits,
    projectDescription,
    projectCapitalCost,
    projectAnnualCost,
    equityFocusLevel,
    priorityGroups
  ]);

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

  const estimatePopulationServedFromContext = () => {
    // Base population by affected community size
    let base =
      municipalitySize === "small"
        ? 8000
        : municipalitySize === "medium"
        ? 25000
        : 60000;

    // Adjust for local context type
    let contextFactor = 1;
    switch (projectAreaContext) {
      case "urbanCore":
        contextFactor = 1.3;
        break;
      case "urbanNeighbourhood":
        contextFactor = 1.1;
        break;
      case "suburban":
        contextFactor = 0.9;
        break;
      case "peripheral":
        contextFactor = 0.7;
        break;
      case "rural":
        contextFactor = 0.5;
        break;
      case "industrial":
        contextFactor = 0.6;
        break;
      default:
        contextFactor = 1;
    }

    // Light regional tweak based on typical Canadian densities
    const regionFactor =
      region === "ontario"
        ? 1.1
        : region === "quebec"
        ? 1.05
        : region === "bc"
        ? 1.0
        : region === "prairies"
        ? 0.9
        : region === "atlantic"
        ? 0.95
        : 0.7; // territories

    const estimateRaw = base * contextFactor * regionFactor;
    const estimate = Math.max(100, Math.min(Math.round(estimateRaw), 250000));

    setPopulationServed(estimate);
    // Back-of-envelope household estimate for downstream per-household metrics
    setHouseholdsServed(Math.max(10, Math.round(estimate / 2.6)));
  };

  const renderStepProgress = (currentStep: number) => {
    const total = 5;
    const dots = Array.from({ length: total }, (_, idx) =>
      idx + 1 <= currentStep ? "●" : "○"
    ).join(" ");
    return (
      <div
        className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-600 select-none cursor-default"
        role="status"
        aria-label={language === "fr" ? `Étape ${currentStep} sur ${total}` : `Step ${currentStep} of ${total}`}
      >
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {language === "fr" ? "Progression" : "Progress"}
        </span>
        <span className="text-base tracking-[0.25em] font-medium text-slate-600" aria-hidden>
          {dots}
        </span>
        <span className="text-sm font-medium text-slate-700">
          {language === "fr"
            ? `Étape ${currentStep} sur ${total}`
            : `Step ${currentStep} of ${total}`}
        </span>
      </div>
    );
  };

  const matchedMunicipality = municipality
    ? canadianMunicipalities.find(
        m => normalizeMunicipalityName(m.name) === normalizeMunicipalityName(municipality)
      )
    : null;

  const projectLocationLabel =
    municipality && matchedMunicipality
      ? `${municipality}, ${
          (language === "fr"
            ? provinceLabels[matchedMunicipality.province]?.fr
            : provinceLabels[matchedMunicipality.province]?.en) ??
          matchedMunicipality.province
        }`
      : municipality || (language === "fr" ? "votre collectivité" : "your community");

  const headerTitle =
    step === 5 && results
      ? language === "fr"
        ? "Rapport des bénéfices du projet"
        : "Project Benefits Report"
      : language === "fr"
      ? "Configuration du projet"
      : "Project setup";

  const headerSubtitle =
    step === 5 && results
      ? language === "fr"
        ? `Votre projet de plantation d’arbres à ${projectLocationLabel}`
        : `Your tree planting project in ${projectLocationLabel}`
      : language === "fr"
      ? "5 étapes pour estimer les bénéfices de votre projet."
      : "5 steps to estimate your project benefits.";

  const handleToggleBenefit = (id: BenefitCategory) => {
    setSelectedBenefits(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleCalculate = () => {
    const totalTreesForCalculation =
      projectIncludesShrubs && numberOfShrubs
        ? numberOfTrees + numberOfShrubs
        : numberOfTrees;

    const res = calculateBenefits({
      region,
      municipalitySize,
      populationServed,
      householdsServed,
      numberOfTrees: totalTreesForCalculation,
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
            <h2 className="text-lg font-semibold text-slate-900">{headerTitle}</h2>
            <p className="text-xs text-slate-600">{headerSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
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
            {step === 5 && results && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition"
              >
                {t("Edit inputs", "Modifier les entrées")}
              </button>
            )}
          </div>
        </header>

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {t("Project basics", "Informations de base sur le projet")}
            </h3>
            <p className="text-xs text-slate-600">
              {t(
                "Start by providing basic project details and location. This allows the calculator to use region-specific data for more accurate benefit estimates.",
                "Commencez par fournir les détails de base du projet et le lieu. Le calculateur pourra ainsi utiliser des données propres à la région pour des estimations de bénéfices plus précises."
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
                        setContextParams(prev => ({
                          ...prev,
                          municipalPopulation: 85000,
                          municipalAreaKm2: 142
                        }));
                        return;
                      }
                      const inferred = inferRegionFromMunicipality(value);
                      if (inferred) {
                        setRegion(inferred);
                        setMunicipalityIsCustom(false);
                        const match = canadianMunicipalities.find(
                          m =>
                            normalizeMunicipalityName(m.name) ===
                            normalizeMunicipalityName(value)
                        );
                        if (match) {
                          setContextParams(prev => ({
                            ...prev,
                            municipalPopulation: match.population,
                            municipalAreaKm2: match.areaKm2
                          }));
                        }
                      } else {
                        setMunicipalityIsCustom(true);
                      }
                    }}
                    onFocus={() => setShowMunicipalitySuggestions(true)}
                    placeholder={t(
                      "Start typing to search Canadian municipalities",
                      "Commencez à taper pour rechercher des municipalités canadiennes"
                    )}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    aria-autocomplete="list"
                    aria-expanded={municipalityQuery.length > 1 && showMunicipalitySuggestions}
                  />
                  {municipalityQuery.length > 1 && showMunicipalitySuggestions && (
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
                              setContextParams(prev => ({
                                ...prev,
                                municipalPopulation: m.population,
                                municipalAreaKm2: m.areaKm2
                              }));
                              setShowMunicipalitySuggestions(false);
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
                        "Used to set climate and carbon defaults automatically by region. This demo uses a sample of Canadian municipalities; a full version would include a more complete list and finer geography.",
                        "Utilisé pour définir automatiquement les paramètres climatiques et de carbone par région. Cette démo utilise un échantillon de municipalités canadiennes; une version complète inclurait une liste plus exhaustive et une géographie plus fine."
                      )}
                </p>
                {matchedMunicipality && !municipalityIsCustom && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {language === "fr"
                      ? `Profil StatCan (approx.) : ${
                          provinceLabels[matchedMunicipality.province]?.fr ??
                          matchedMunicipality.province
                        }, population ${matchedMunicipality.population.toLocaleString("fr-CA")} hab., superficie ${matchedMunicipality.areaKm2.toLocaleString(
                          "fr-CA",
                          { maximumFractionDigits: 1 }
                        )} km².`
                      : `StatsCan profile (approx.): ${
                          provinceLabels[matchedMunicipality.province]?.en ??
                          matchedMunicipality.province
                        }, population ${matchedMunicipality.population.toLocaleString(
                          "en-CA"
                        )}, area ${matchedMunicipality.areaKm2.toLocaleString("en-CA", {
                          maximumFractionDigits: 1
                        })} km².`}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "What best describes the context of your tree planting project area?",
                    "Quel contexte décrit le mieux la zone de votre projet de plantation d’arbres?"
                  )}
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      id: "urbanCore",
                      labelEn:
                        "Urban core (downtown, high-density commercial/residential)",
                      labelFr:
                        "Centre urbain (centre-ville, secteurs commerciaux/résidentiels à haute densité)"
                    },
                    {
                      id: "urbanNeighbourhood",
                      labelEn: "Urban neighbourhood (established residential areas)",
                      labelFr:
                        "Quartier urbain (zones résidentielles établies)"
                    },
                    {
                      id: "suburban",
                      labelEn:
                        "Suburban (lower-density residential, car-oriented)",
                      labelFr:
                        "Banlieue (résidentiel à plus faible densité, axé sur l’auto)"
                    },
                    {
                      id: "peripheral",
                      labelEn:
                        "Peripheral/exurban (edge of municipality, transitioning to rural)",
                      labelFr:
                        "Périphérie/exurbain (périphérie municipale, transition vers le rural)"
                    },
                    {
                      id: "rural",
                      labelEn:
                        "Rural community (low density, agricultural surroundings)",
                      labelFr:
                        "Communauté rurale (faible densité, environnement agricole)"
                    },
                    {
                      id: "industrial",
                      labelEn: "Industrial area (primarily industrial/commercial)",
                      labelFr:
                        "Zone industrielle (principalement industrielle/commerciale)"
                    }
                  ].map(option => {
                    const selected = projectAreaContext === option.id;
                    const label =
                      language === "fr" ? option.labelFr : option.labelEn;
                    const bracketIdx = label.indexOf(" (");
                    const primary =
                      bracketIdx >= 0 ? label.slice(0, bracketIdx) : label;
                    const rest =
                      bracketIdx >= 0 ? label.slice(bracketIdx) : null;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setProjectAreaContext(prev =>
                            prev === option.id ? "" : option.id
                          )
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-left text-[11px] transition ${
                          selected
                            ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm"
                            : "border-slate-300 bg-white text-slate-700 hover:border-primary-400 hover:bg-primary-50/40"
                        }`}
                      >
                        {rest ? (
                          <>
                            <span className="font-semibold">{primary}</span>
                            {rest}
                          </>
                        ) : (
                          label
                        )}
                      </button>
                    );
                  })}
                </div>
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
                    {t("Small", "Petit")}
                  </option>
                  <option value="medium">
                    {t("Medium", "Moyen")}
                  </option>
                  <option value="large">
                    {t("Large", "Grand")}
                  </option>
                </select>
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Small: <10K residents, Medium: 10–100K, Large: >100K (approximate).",
                    "Petit : <10 k résident·es, Moyen : 10–100 k, Grand : >100 k (approx.)."
                  )}
                </p>
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
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "For projects planting over multiple years, use the year when the last trees will be planted.",
                    "Pour les projets plantant sur plusieurs années, indiquez l’année où les derniers arbres seront plantés."
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  {t(
                    "Population served (approx. pop living within 500m buffer)",
                    "Population desservie (population vivant dans un rayon de 500 m, approx.)"
                  )}
                </label>
                <div className="flex gap-2">
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
                  <button
                    type="button"
                    onClick={estimatePopulationServedFromContext}
                    className="whitespace-nowrap rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 transition"
                  >
                    {t("Auto-calculate", "Calculer automatiquement")}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {t(
                    "Estimate the number of people living within 500m of your project area. If you're unsure, click “Auto-calculate” to generate an estimate based on your community size, context and region.",
                    "Estimez le nombre de personnes vivant à moins de 500 m de votre zone de projet. Si vous n’êtes pas certain·e, cliquez sur « Calculer automatiquement » pour générer une estimation basée sur la taille de la communauté, le contexte du site et la région."
                  )}
                </p>
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
                <div className="space-y-4 pt-1 text-[11px]">
                  {/* Category 1: Climate & Environment */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800">
                      {t("Climate & environment", "Climat et environnement")}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t("Annual rainfall (mm/year)", "Précipitations annuelles (mm/an)")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.annualRainfallMm}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              annualRainfallMm: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t(
                            "Average annual temperature (°C)",
                            "Température annuelle moyenne (°C)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.avgAnnualTempC}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              avgAnnualTempC: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t(
                            "Heat days per year (>30°C)",
                            "Jours de chaleur par an (>30°C)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.heatDaysPerYear}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              heatDaysPerYear: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t(
                            "Growing season length (days)",
                            "Durée de la saison de croissance (jours)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.growingSeasonDays}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              growingSeasonDays: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
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
                        <label className="font-medium text-slate-700">
                          {t("Air Quality Index (baseline)", "Indice de qualité de l’air (base)")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.baselineAqi}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              baselineAqi: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Demographics & Social */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800">
                      {t("Demographics & social", "Démographie et social")}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t("Municipal population", "Population municipale")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.municipalPopulation}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              municipalPopulation: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
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
                        <label className="font-medium text-slate-700">
                          {t(
                            "Median household income (CAD/year)",
                            "Revenu médian des ménages (CAD/an)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.medianIncome}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              medianIncome: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t("Age 65+ population (%)", "Population de 65 ans et plus (%)")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.age65PlusPct}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              age65PlusPct: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t("Age 0–14 population (%)", "Population de 0–14 ans (%)")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.age0To14Pct}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              age0To14Pct: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t(
                            "Working age population (15–64) (%)",
                            "Population en âge de travailler (15–64 ans) (%)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.workingAgePct}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              workingAgePct: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category 4: Infrastructure & urban form */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800">
                      {t("Infrastructure & urban form", "Infrastructures et forme urbaine")}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t("Total municipal area (km²)", "Superficie municipale totale (km²)")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.municipalAreaKm2}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              municipalAreaKm2: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t(
                            "Impervious surface coverage (%)",
                            "Couverture de surfaces imperméables (%)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.imperviousCoveragePct}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              imperviousCoveragePct: Number(e.target.value) || 0
                            }))
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t("Average street width (m)", "Largeur moyenne des rues (m)")}
                        </label>
                        <input
                          type="number"
                          value={contextParams.avgStreetWidthM}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              avgStreetWidthM: Number(e.target.value) || 0
                            }))
                          }
                          step="0.1"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">
                          {t(
                            "Park space per capita (m²/person)",
                            "Espace de parc par habitant (m²/personne)"
                          )}
                        </label>
                        <input
                          type="number"
                          value={contextParams.parkSpacePerCapitaM2}
                          onChange={e =>
                            setContextParams(prev => ({
                              ...prev,
                              parkSpacePerCapitaM2: Number(e.target.value) || 0
                            }))
                          }
                          step="0.1"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                      </div>
                    </div>
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

            {/* Section 1: Project type (Select one) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {t("Project type (Select one)", "Type de projet (Choisir un)")}
              </h4>
              <div className="space-y-1">
                <label className="flex items-start gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="project-type"
                    value="communityWideUrbanPlanting"
                    checked={projectTypology === "communityWideUrbanPlanting"}
                    onChange={() => setProjectTypology("communityWideUrbanPlanting")}
                    className="mt-1 h-4 w-4 border-slate-400 text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    <span className="font-medium">{t("Community-wide urban planting", "Plantation urbaine à l'échelle de la collectivité")}</span>
                    <span className="block text-[11px] text-slate-600 italic">{t("Projects spanning multiple neighborhoods or full municipality", "Projets couvrant plusieurs quartiers ou une municipalité entière")}</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="project-type"
                    value="forestRestoration"
                    checked={projectTypology === "forestRestoration"}
                    onChange={() => setProjectTypology("forestRestoration")}
                    className="mt-1 h-4 w-4 border-slate-400 text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    <span className="font-medium">{t("Forest restoration in naturalized areas", "Restauration forestière dans des secteurs naturalisés")}</span>
                    <span className="block text-[11px] text-slate-600 italic">{t("Rehabilitation of naturalized or semi-natural areas", "Réhabilitation de zones naturalisées ou semi-naturelles")}</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="project-type"
                    value="localizedPlanting"
                    checked={projectTypology === "localizedPlanting"}
                    onChange={() => setProjectTypology("localizedPlanting")}
                    className="mt-1 h-4 w-4 border-slate-400 text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    <span className="font-medium">{t("Localized planting projects", "Projets de plantation localisés")}</span>
                    <span className="block text-[11px] text-slate-600 italic">{t("Site-specific projects such as a corridor, park, or street", "Projets ciblant un site précis comme un corridor, un parc ou une rue")}</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Section 2: Specific planting activities (Select all that apply) */}
            {/* Supported activities */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {t("Specific planting activities (Select all that apply)", "Activités de plantation (Sélectionner tout ce qui s'applique)")}
              </h4>
              <p className="text-[11px] text-slate-600">
                {t(
                  "Select all activities that apply to your project. If your project includes multiple types of planting, you can select more than one.",
                  "Sélectionnez toutes les activités qui s'appliquent à votre projet. Si votre projet comprend plusieurs types de plantation, vous pouvez en choisir plusieurs."
                )}
              </p>
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
                    illustration: woodlandIllustration
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
                    "Number of trees planted",
                    "Nombre d'arbres plantés"
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  value={numberOfTrees}
                  onChange={e =>
                    setNumberOfTrees(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "Use your best estimate – the tool will scale results. If you also plant woody shrubs, you can record them separately below; in this demo they are added to the tree total for benefit calculations.",
                    "Utilisez votre meilleure estimation – l’outil ajustera les résultats. Si vous plantez aussi des arbustes ligneux, vous pouvez les saisir séparément ci‑dessous; dans cette démo, ils sont ajoutés au total d’arbres pour les calculs de bénéfices."
                  )}
                </p>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={projectIncludesShrubs}
                    onChange={e => setProjectIncludesShrubs(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-400 text-primary-600 focus:ring-primary-500"
                  />
                  {t(
                    "The project includes planting of shrubs?",
                    "Le projet inclut-il la plantation d'arbustes?"
                  )}
                </label>
                {projectIncludesShrubs && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      {t("Number of woody shrubs", "Nombre d'arbustes ligneux")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={numberOfShrubs ?? ""}
                      onChange={e =>
                        setNumberOfShrubs(
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      placeholder={t("Enter count", "Entrez le nombre")}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                  </div>
                )}
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
                <p className="text-[11px] text-slate-500 italic">
                  {t(
                    "For community-wide projects, use the approximate area where trees are actually planted (not the whole municipality).",
                    "Pour les projets à l’échelle de la collectivité, utilisez la superficie approximative où les arbres sont effectivement plantés (et non toute la municipalité)."
                  )}
                </p>
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

              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-700">
                  {t(
                    "Does your project include sustainable water systems for irrigation or drainage?",
                    "Votre projet comprend-il des systèmes d'eau durables pour l'irrigation ou le drainage?"
                  )}
                </p>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sustainable-water"
                      checked={!hasSustainableWaterSystems}
                      onChange={() => {
                        setHasSustainableWaterSystems(false);
                        setSustainableWaterSystemTypes([]);
                      }}
                      className="mt-0.5 h-4 w-4 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t("No", "Non")}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sustainable-water"
                      checked={hasSustainableWaterSystems}
                      onChange={() => setHasSustainableWaterSystems(true)}
                      className="mt-0.5 h-4 w-4 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700">
                      {t(
                        "Yes, the project includes rainwater harvesting, bioswales, or other sustainable water management.",
                        "Oui, le projet comprend la récupération des eaux pluviales, des bioswales ou une autre gestion durable de l'eau."
                      )}
                    </span>
                  </label>
                </div>
                {hasSustainableWaterSystems && (
                  <div className="ml-6 mt-3 space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {t(
                        "Water management system types (select all that apply – examples):",
                        "Types de système de gestion de l'eau (sélectionnez tout ce qui s’applique – exemples) :"
                      )}
                    </label>
                    <div className="space-y-1.5 text-sm text-slate-700">
                      {[
                        {
                          id: "bioswales",
                          labelEn: "Bioswales / vegetated swales",
                          labelFr: "Bioswales / fossés végétalisés"
                        },
                        {
                          id: "rainGardens",
                          labelEn: "Rain gardens",
                          labelFr: "Jardins pluviaux"
                        },
                        {
                          id: "filterStrips",
                          labelEn: "Filter strips",
                          labelFr: "Bandes filtrantes"
                        },
                        {
                          id: "retentionDetention",
                          labelEn: "Retention or detention ponds",
                          labelFr: "Bassins de rétention ou de détention"
                        }
                      ].map(option => {
                        const selected = sustainableWaterSystemTypes.includes(option.id);
                        const label =
                          language === "fr" ? option.labelFr : option.labelEn;
                        return (
                          <label
                            key={option.id}
                            className="flex items-start gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                setSustainableWaterSystemTypes(prev =>
                                  prev.includes(option.id)
                                    ? prev.filter(id => id !== option.id)
                                    : [...prev, option.id]
                                )
                              }
                              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-400 text-primary-600 focus:ring-primary-500"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      {t(
                        "These examples help describe how trees interact with green infrastructure; they are optional and do not change the calculations yet.",
                        "Ces exemples aident à décrire la façon dont les arbres interagissent avec l’infrastructure verte; ils sont optionnels et ne modifient pas encore les calculs."
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Typology-specific contextual questions */}
            <div className="mt-4 space-y-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] text-slate-600">
                {t(
                  "These optional questions help describe project context in plain language you can reuse in applications and reports. They are for reporting only and do not change the calculations yet.",
                  "Ces questions optionnelles aident à décrire le contexte du projet dans un langage simple que vous pouvez réutiliser dans vos demandes et rapports. Elles servent au rapport seulement et ne modifient pas encore les calculs."
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
                "Add optional project details for the report, then describe who is most affected and which benefit story you want to emphasize.",
                "Ajoutez des détails de projet optionnels pour le rapport, puis décrivez qui est le plus touché et quels bénéfices mettre de l’avant."
              )}
            </p>

            {/* Project narrative & costs (optional) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {t("Project narrative & costs (optional)", "Récit du projet et coûts (optionnel)")}
              </h4>
              <p className="text-xs text-slate-600">
                {t(
                  "Add project details to be included in the final report. These details strengthen the narrative but aren't required for benefit calculations.",
                  "Ajoutez des détails du projet à inclure dans le rapport final. Ces détails renforcent le récit mais ne sont pas requis pour les calculs de bénéfices."
                )}
              </p>
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
                  <p className="text-[11px] text-slate-500 italic">
                    {t(
                      "Enter a typical yearly amount for ongoing maintenance, watering and monitoring (not the total over the full lifespan).",
                      "Indiquez un montant annuel typique pour l’entretien, l’arrosage et le suivi (et non le total sur toute la durée de vie)."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Community impact & equity */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                {t(
                  "Community impact & equity focus",
                  "Impact communautaire et accent sur l’équité"
                )}
              </h4>

              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-slate-700">
                  {t(
                    "Does your project intentionally address barriers or inequities?",
                    "Votre projet vise-t-il intentionnellement à réduire des obstacles ou des inégalités?"
                  )}
                </p>
                <div className="space-y-1">
                  <label className="flex items-start gap-2 text-[11px] text-slate-700">
                    <input
                      type="radio"
                      name="equity-focus"
                      value="none"
                      checked={equityFocusLevel === "none"}
                      onChange={() => setEquityFocusLevel("none")}
                      className="mt-0.5 h-3 w-3 border-slate-400 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t("No", "Non")}</span>
                  </label>
                  <label className="flex items-start gap-2 text-[11px] text-slate-700">
                    <input
                      type="radio"
                      name="equity-focus"
                      value="consideration"
                      checked={equityFocusLevel === "consideration"}
                      onChange={() => setEquityFocusLevel("consideration")}
                      className="mt-0.5 h-3 w-3 border-slate-400 text-primary-600 focus:ring-primary-500"
                    />
                    <span>
                      {t(
                        "Yes – equity is a consideration",
                        "Oui – l’équité est une considération importante"
                      )}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-[11px] text-slate-700">
                    <input
                      type="radio"
                      name="equity-focus"
                      value="primary"
                      checked={equityFocusLevel === "primary"}
                      onChange={() => setEquityFocusLevel("primary")}
                      className="mt-0.5 h-3 w-3 border-slate-400 text-primary-600 focus:ring-primary-500"
                    />
                    <span>
                      {t(
                        "Yes – equity is a primary project goal",
                        "Oui – l’équité est un objectif principal du projet"
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {equityFocusLevel !== "none" && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-700">
                    {t(
                      "Priority populations served (select all that apply)",
                      "Populations prioritaires touchées (sélectionnez tout ce qui s’applique)"
                    )}
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {[
                      t("2SLGBTQ+ people", "Personnes 2SLGBTQ+"),
                      t("Francophones", "Francophones"),
                      t("Immigrants and newcomers", "Immigrant·es et nouveaux arrivant·es"),
                      t("Indigenous Peoples", "Peuples autochtones"),
                      t("Older adults", "Personnes aînées"),
                      t("People with disabilities", "Personnes en situation de handicap"),
                      t("People with low income", "Personnes à faible revenu"),
                      t("Racialized people", "Personnes racisées"),
                      t("Rural residents", "Résident·es des milieux ruraux"),
                      t("Women", "Femmes"),
                      t("Youth", "Jeunes")
                    ].map(label => {
                      const selected = priorityGroups.includes(label);
                      return (
                        <label
                          key={label}
                          className="flex items-start gap-2 text-[11px] text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              setPriorityGroups(prev =>
                                prev.includes(label)
                                  ? prev.filter(g => g !== label)
                                  : [...prev, label]
                              )
                            }
                            className="mt-0.5 h-3 w-3 border-slate-400 text-primary-600 focus:ring-primary-500"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
                        {t("Other:", "Autre :")}
                      </label>
                      <input
                        type="text"
                        value={priorityOther}
                        onChange={e => setPriorityOther(e.target.value)}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder={t(
                          "Describe another priority population (optional)",
                          "Décrivez une autre population prioritaire (facultatif)"
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
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

            {/* Benefit context assumptions – optional, above benefit inputs */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {t(
                      "Context assumptions for benefits (optional)",
                      "Hypothèses de contexte pour les bénéfices (optionnel)"
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t(
                      "Local data that refines carbon, stormwater, heat, air quality and economic benefit estimates.",
                      "Données locales qui affinent les estimations de bénéfices carbone, eaux pluviales, chaleur, qualité de l'air et économiques."
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBenefitContext(prev => !prev)}
                  className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {showBenefitContext
                    ? t("Hide", "Masquer")
                    : t("Show", "Afficher")}
                </button>
              </div>
              {showBenefitContext && (
                <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 text-[11px]">
                  <div>
                    <h4 className="mb-2 font-semibold text-slate-800">
                      {t("Economic parameters", "Paramètres économiques")}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Residential price (CAD)", "Prix résidentiel (CAD)")}</label>
                        <input type="number" value={contextParams.avgResidentialPrice} onChange={e => setContextParams(prev => ({ ...prev, avgResidentialPrice: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Commercial price (CAD)", "Prix commercial (CAD)")}</label>
                        <input type="number" value={contextParams.avgCommercialPrice} onChange={e => setContextParams(prev => ({ ...prev, avgCommercialPrice: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Electricity (CAD/kWh)", "Électricité (CAD/kWh)")}</label>
                        <input type="number" step="0.001" value={contextParams.electricityPrice} onChange={e => setContextParams(prev => ({ ...prev, electricityPrice: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Gas (CAD/m³)", "Gaz (CAD/m³)")}</label>
                        <input type="number" step="0.001" value={contextParams.gasPrice} onChange={e => setContextParams(prev => ({ ...prev, gasPrice: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Water rate (CAD/m³)", "Tarif eau (CAD/m³)")}</label>
                        <input type="number" step="0.01" value={contextParams.waterRate} onChange={e => setContextParams(prev => ({ ...prev, waterRate: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Hourly wage (CAD)", "Salaire horaire (CAD)")}</label>
                        <input type="number" step="0.01" value={contextParams.avgHourlyWage} onChange={e => setContextParams(prev => ({ ...prev, avgHourlyWage: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-slate-800">
                      {t("Environmental baseline", "Situation environnementale de référence")}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Municipal CO₂ (t/year)", "CO₂ municipal (t/an)")}</label>
                        <input type="number" value={contextParams.municipalEmissionsTonnes} onChange={e => setContextParams(prev => ({ ...prev, municipalEmissionsTonnes: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("PM2.5 (µg/m³)", "PM2.5 (µg/m³)")}</label>
                        <input type="number" step="0.1" value={contextParams.pm25UgM3} onChange={e => setContextParams(prev => ({ ...prev, pm25UgM3: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Stormwater runoff (M m³/yr)", "Ruissellement (M m³/an)")}</label>
                        <input type="number" step="0.1" value={contextParams.stormwaterRunoffMillionM3} onChange={e => setContextParams(prev => ({ ...prev, stormwaterRunoffMillionM3: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Heat island (°C)", "Îlot de chaleur (°C)")}</label>
                        <input type="number" step="0.1" value={contextParams.heatIslandIntensityC} onChange={e => setContextParams(prev => ({ ...prev, heatIslandIntensityC: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Flood events/decade", "Inondations/décennie")}</label>
                        <input type="number" value={contextParams.floodEventsPerDecade} onChange={e => setContextParams(prev => ({ ...prev, floodEventsPerDecade: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Heat vulnerability", "Vulnérabilité à la chaleur")}</label>
                        <select value={heatVulnerability} onChange={e => setHeatVulnerability(e.target.value as "low" | "medium" | "high")} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500">
                          <option value="low">{t("Low", "Faible")}</option>
                          <option value="medium">{t("Medium", "Moyenne")}</option>
                          <option value="high">{t("High", "Élevée")}</option>
                        </select>
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Flood / stormwater risk", "Risque inondation / eaux pluviales")}</label>
                        <select value={floodRisk} onChange={e => setFloodRisk(e.target.value as "low" | "medium" | "high")} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500">
                          <option value="low">{t("Low", "Faible")}</option>
                          <option value="medium">{t("Medium", "Moyenne")}</option>
                          <option value="high">{t("High", "Élevé")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-800">
                    {t("Carbon market", "Marché du carbone")}
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-2">
                    {t(
                      "Only relevant where a carbon market or internal carbon price exists. In other contexts, you can leave these defaults as-is.",
                      "Pertinent uniquement lorsqu’un marché du carbone ou un prix interne du carbone existe. Dans les autres contextes, vous pouvez laisser ces valeurs par défaut."
                    )}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Carbon credit price (CAD/tCO₂e)", "Prix crédit carbone (CAD/tCO₂e)")}</label>
                        <input type="number" value={contextParams.carbonCreditPrice} onChange={e => setContextParams(prev => ({ ...prev, carbonCreditPrice: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Social cost of carbon (CAD/tCO₂e)", "Coût social du carbone (CAD/tCO₂e)")}</label>
                        <input type="number" value={contextParams.socialCostOfCarbon} onChange={e => setContextParams(prev => ({ ...prev, socialCostOfCarbon: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-slate-800">
                      {t("Recreation & tourism", "Loisirs et tourisme")}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Park visitors/year", "Visiteurs parcs/an")}</label>
                        <input type="number" value={contextParams.annualParkVisitors} onChange={e => setContextParams(prev => ({ ...prev, annualParkVisitors: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Tourism spending (M CAD/yr)", "Dépenses tourisme (M CAD/an)")}</label>
                        <input type="number" step="0.1" value={contextParams.tourismSpendingMillion} onChange={e => setContextParams(prev => ({ ...prev, tourismSpendingMillion: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                      <div className="space-y-0.5">
                        <label className="font-medium text-slate-700">{t("Value per visit (CAD)", "Valeur par visite (CAD)")}</label>
                        <input type="number" step="0.01" value={contextParams.recreationValuePerVisit} onChange={e => setContextParams(prev => ({ ...prev, recreationValuePerVisit: Number(e.target.value) || 0 }))} className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                          "What is the typical level of pedestrian activity in the main planting area (streets, paths, parks, campuses, etc.)?",
                          "Quel est le niveau habituel d’activité piétonne dans la principale zone de plantation (rues, sentiers, parcs, campus, etc.)?"
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
                        {t("Average number of heat days per year (>30°C):", "Nombre moyen de jours de chaleur par an (>30 °C) :")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={heatDetails.heatDaysPerYear}
                        onChange={e =>
                          setHeatDetails(prev => ({
                            ...prev,
                            heatDaysPerYear: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        {t("Typical maximum summer temperature (°C):", "Température maximale estivale typique (°C) :")}
                      </label>
                      <input
                        type="number"
                        value={heatDetails.typicalMaxSummerTempC}
                        onChange={e =>
                          setHeatDetails(prev => ({
                            ...prev,
                            typicalMaxSummerTempC: Number(e.target.value) || 0
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
            <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 text-white p-4 md:p-5 shadow-md flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-900/50 border border-white/30 text-sm">
                  !
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm md:text-base font-semibold uppercase tracking-wide">
                    {t("Grant-ready snapshot (demo)", "Récapitulatif prêt pour une demande (démo)")}
                  </h3>
                  <p className="text-[11px] md:text-xs text-primary-50/90">
                    {t(
                      "Use this page to tell a concise story about who benefits, how the site is changing and what risks are reduced. Values are simplified annual estimates for a representative year of maturity.",
                      "Utilisez cette page pour raconter en quelques lignes qui bénéficie, comment le site change et quels risques sont réduits. Les valeurs sont des estimations annuelles simplifiées pour une année de maturité représentative."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Project overview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                {t("Project overview", "Aperçu du projet")}
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
                    {t("📍 Location", "📍 Lieu")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {projectLocationLabel}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("🌳 Trees planted", "🌳 Arbres plantés")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {numberOfTrees.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("📐 Project area", "📐 Superficie du projet")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {projectAreaHa.toFixed(1)} {t("Ha", "Ha")}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium mb-1">
                    {t("📅 Completion year", "📅 Année d’achèvement")}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {year}
                  </div>
                </div>
              </div>

              {/* GCCC mapping summary for FCM / reporting */}
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white/70 p-3">
                {(() => {
                  const { plantingSiteTypes, landUseTypes } = deriveGcccTags({
                    projectTypology,
                    supportedActivities,
                    projectAreaContext,
                    localizedSiteContext
                  });
                  return (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 mb-1">
                        {t(
                          "Mapped to GCCC categories (for reporting)",
                          "Correspondance avec les catégories GCCC (pour le rapport)"
                        )}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-slate-700">
                        <div>
                          <div className="font-medium">
                            {t("Planting site type(s)", "Type(s) de site de plantation")}
                          </div>
                          <p className="mt-0.5">
                            {plantingSiteTypes.length === 0
                              ? t("Not classified in demo", "Non classé dans la démo")
                              : plantingSiteTypes
                                  .map(type =>
                                    t(
                                      type === "streetPlanting"
                                        ? "Street planting"
                                        : type === "parkPlanting"
                                        ? "Park planting"
                                        : type === "naturalAreasPlanting"
                                        ? "Natural areas planting"
                                        : "Other planting areas",
                                      type === "streetPlanting"
                                        ? "Plantation de rue"
                                        : type === "parkPlanting"
                                        ? "Plantation en parc"
                                        : type === "naturalAreasPlanting"
                                        ? "Plantation en milieux naturels"
                                        : "Autres zones de plantation"
                                    )
                                  )
                                  .join(", ")}
                          </p>
                        </div>
                        <div>
                          <div className="font-medium">
                            {t("Land use type(s)", "Type(s) d’usage du sol")}
                          </div>
                          <p className="mt-0.5">
                            {landUseTypes
                              .map(type =>
                                t(
                                  type === "transportationCorridors"
                                    ? "Transportation corridors"
                                    : type === "recreationalAreas"
                                    ? "Recreational areas"
                                    : type === "conservationAreas"
                                    ? "Conservation areas"
                                    : type === "institutionalAreas"
                                    ? "Institutional areas"
                                    : type === "residentialAreas"
                                    ? "Residential areas"
                                    : "Other",
                                  type === "transportationCorridors"
                                    ? "Corridors de transport"
                                    : type === "recreationalAreas"
                                    ? "Espaces récréatifs"
                                    : type === "conservationAreas"
                                    ? "Zones de conservation"
                                    : type === "institutionalAreas"
                                    ? "Zones institutionnelles"
                                    : type === "residentialAreas"
                                    ? "Zones résidentielles"
                                    : "Autre"
                                )
                              )
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Project map (placeholder visual) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  {t("Project map", "Carte du projet")}
                </h4>
                <span className="text-[10px] text-slate-500">
                  {t("Illustrative map preview", "Aperçu cartographique illustratif")}
                </span>
              </div>
              <div className="relative h-40 w-full rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden border border-slate-200">
                <div className="absolute inset-3 rounded-lg border-2 border-emerald-500/70 border-dashed" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                  <span className="text-2xl">📍</span>
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-sm">
                    {projectLocationLabel}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {projectAreaHa.toFixed(1)} {t("Ha project footprint (approx.)", "Ha d’emprise du projet (approx.)")}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-600">
                {t(
                  "Future versions will use an interactive map centred on your project location with the planting area highlighted.",
                  "Les prochaines versions utiliseront une carte interactive centrée sur le lieu de votre projet avec la zone de plantation surlignée."
                )}
              </p>
            </div>

            {/* Data & methodology – demo */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                {t("Data & methodology (demo)", "Données et méthodologie (démo)")}
              </h4>
              <p className="text-[11px] text-slate-700 mb-2">
                {t(
                  "Results are generated using simplified Canadian default assumptions for tree carbon, stormwater and health benefits. They are designed for order-of-magnitude exploration, not for official reporting or carbon crediting.",
                  "Les résultats sont générés à partir d’hypothèses canadiennes simplifiées concernant les bénéfices en carbone, eaux pluviales et santé. Ils servent à explorer des ordres de grandeur, et non à la reddition de comptes officielle ni à la création de crédits carbone."
                )}
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
                <li>
                  {t(
                    "Per-tree and per-hectare multipliers are constant across the lifespan of the project in this prototype.",
                    "Les multiplicateurs par arbre et par hectare sont constants sur la durée de vie du projet dans ce prototype."
                  )}
                </li>
                <li>
                  {t(
                    "Regional factors adjust results by broad Canadian regions, not by municipality-level measurements.",
                    "Des facteurs régionaux ajustent les résultats par grandes régions canadiennes, et non à l’échelle précise de la municipalité."
                  )}
                </li>
                <li>
                  {t(
                    "Equity and access metrics are illustrative proxies only and do not yet incorporate detailed demographic data.",
                    "Les indicateurs d’équité et d’accessibilité sont des proxys illustratifs et n’intègrent pas encore de données démographiques détaillées."
                  )}
                </li>
              </ul>
              <button
                type="button"
                onClick={() =>
                  window.open("https://greenmunicipalfund.ca/trees", "_blank")
                }
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-[11px] font-medium text-primary-800 hover:bg-primary-100 transition"
              >
                {t(
                  "Learn more about GCCC context",
                  "En savoir plus sur le contexte de GCCC"
                )}
              </button>
            </div>

            {(projectDescription || projectCapitalCost !== null || projectAnnualCost !== null) && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {t("Project description", "Description du projet")}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    {t("Edit story & costs", "Modifier le récit et les coûts")}
                  </button>
                </div>

                {projectDescription ? (
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {projectDescription}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    {t(
                      "No project description has been added yet.",
                      "Aucune description de projet n’a encore été ajoutée."
                    )}
                  </p>
                )}

                {(projectCapitalCost !== null || projectAnnualCost !== null) && (
                  <p className="mt-3 text-[11px] text-slate-700">
                    💰{" "}
                    <span className="font-semibold">
                      {t("Estimated costs", "Coûts estimés")}
                    </span>
                    {": "}
                    {projectCapitalCost !== null && (
                      <>
                        {t("Capital investment", "Investissement en capital")}: $
                        {projectCapitalCost.toLocaleString(undefined, {
                          maximumFractionDigits: 0
                        })}
                      </>
                    )}
                    {projectCapitalCost !== null && projectAnnualCost !== null && " | "}
                    {projectAnnualCost !== null && (
                      <>
                        {t("Annual maintenance", "Entretien annuel")}: $
                        {projectAnnualCost.toLocaleString(undefined, {
                          maximumFractionDigits: 0
                        })}
                      </>
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {selectedBenefits.includes("carbon") && (
                <div className="rounded-xl border border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      {t("Carbon", "Carbone")}
                    </h4>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary-200 bg-white text-[11px] text-primary-800 hover:bg-primary-50"
                      onClick={() =>
                        window.alert(
                          t(
                            "Carbon estimates combine approximate sequestration per tree with regional adjustment factors. They are designed for comparing options and building a narrative, not for carbon crediting.",
                            "Les estimations de carbone combinent une séquestration approximative par arbre avec des facteurs d’ajustement régionaux. Elles servent à comparer des options et à soutenir le récit, et non à la création de crédits carbone."
                          )
                        )
                      }
                    >
                      ℹ️
                    </button>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {results.total.carbonTonnes.toFixed(1)} tCO₂e{" "}
                    {t("per year (approx.)", "par an (approx.)")}
                  </p>
                  <p className="text-sm text-slate-800 mt-1 font-medium">
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
                      "Based on Canadian social carbon value assumptions used to provide an indicative order-of-magnitude impact.",
                      "Basé sur une valeur sociale du carbone au Canada afin de fournir un ordre de grandeur indicatif de l’impact."
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("stormwater") && (
                <div className="rounded-xl border border-secondary-300 bg-gradient-to-br from-secondary-50 to-secondary-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      {t("Stormwater & flooding", "Eaux pluviales et inondations")}
                    </h4>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-secondary-200 bg-white text-[11px] text-secondary-800 hover:bg-secondary-50"
                      onClick={() =>
                        window.alert(
                          t(
                            "Stormwater benefits approximate the additional rainfall intercepted and slowed by trees compared to hard surfaces.",
                            "Les bénéfices en matière d’eaux pluviales représentent la pluie interceptée et ralentie par les arbres par rapport aux surfaces imperméables."
                          )
                        )
                      }
                    >
                      ℹ️
                    </button>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {results.total.stormwaterLitres.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    L
                  </p>
                  <p className="text-sm text-slate-800 mt-1 font-medium">
                    ≈ $
                    {results.total.stormwaterValue.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    {t(
                      "avoided infrastructure",
                      "infrastructure évitée (approx.)"
                    )}
                  </p>
                  {projectAreaHa > 0 && (
                    <p className="mt-1 text-[11px] text-slate-600">
                      {t(
                        "≈ ",
                        "≈ "
                      )}
                      {(
                        (results.total.stormwaterLitres / 1000) /
                        (projectAreaHa * 10)
                      ).toFixed(1)}{" "}
                      {t(
                        "mm of rainfall retained over the planted area (approx.).",
                        "mm de pluie retenue sur la zone plantée (approx.)."
                      )}
                    </p>
                  )}
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
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      {t("Health & well-being", "Santé et bien-être")}
                    </h4>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-accent-200 bg-white text-[11px] text-accent-800 hover:bg-accent-50"
                      onClick={() =>
                        window.alert(
                          t(
                            "This estimate is based on peer-reviewed research linking tree canopy to measurable health outcomes like reduced emergency room visits, fewer respiratory issues, and improved mental health. The dollar value represents avoided healthcare costs and productivity gains.",
                            "Cette estimation repose sur des recherches évaluées par les pairs qui lient la canopée urbaine à des résultats de santé mesurables comme la réduction des visites à l’urgence, la diminution des problèmes respiratoires et l’amélioration du bien‑être mental. La valeur monétaire représente des coûts de santé évités et des gains de productivité."
                          )
                        )
                      }
                    >
                      ℹ️
                    </button>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    $
                    {results.total.healthSavings.toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}{" "}
                    {t("per year (proxy)", "par an (proxy)")}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {t(
                      "Estimated value of reduced respiratory illness, heat-related health issues, and improved mental wellbeing based on Canadian research.",
                      "Valeur estimée de la réduction des maladies respiratoires, des problèmes de santé liés à la chaleur et de l’amélioration du bien‑être mental, basée sur la recherche canadienne."
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "https://fcm.ca",
                        "_blank",
                      )
                    }
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-accent-200 bg-white px-3 py-1.5 text-[11px] font-medium text-accent-800 hover:bg-accent-50 transition"
                  >
                    {t(
                      "Learn more in GMF health resources",
                      "En savoir plus avec les ressources de la FGM sur la santé"
                    )}
                  </button>
                </div>
              )}

              {selectedBenefits.includes("propertyValue") && (
                <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      {t("Property value", "Valeur foncière")}
                    </h4>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-[11px] text-amber-900 hover:bg-amber-50"
                      onClick={() =>
                        window.alert(
                          t(
                            "Property value uplift is based on typical percentage increases observed near greener streets and parks.",
                            "La hausse de la valeur foncière est basée sur des augmentations typiques observées à proximité de rues et de parcs plus verts."
                          )
                        )
                      }
                    >
                      ℹ️
                    </button>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
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
                      "Highly simplified, indicative uplift in adjacent property value – for communications only, not for assessing displacement or gentrification risk.",
                      "Hausse très simplifiée et indicative de la valeur des propriétés adjacentes – à utiliser pour la communication seulement, et non pour évaluer les risques de déplacement ou de gentrification."
                    )}
                  </p>
                </div>
              )}

              {selectedBenefits.includes("heat") && (
                <div className="rounded-xl border border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      {t("Urban heat", "Îlots de chaleur urbains")}
                    </h4>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-orange-200 bg-white text-[11px] text-orange-800 hover:bg-orange-50"
                      onClick={() =>
                        window.alert(
                          t(
                            "Cooling estimates approximate local temperature reductions where canopy is added, relative to surrounding hard surfaces.",
                            "Les estimations de refroidissement représentent la réduction locale des températures là où la canopée est ajoutée, par rapport aux surfaces environnantes imperméables."
                          )
                        )
                      }
                    >
                      ℹ️
                    </button>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    −
                    {results.total.heatIslandReductionDegC.toFixed(2)}°C
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {t(
                      "Cooling effect over the planted area and its immediate surroundings.",
                      "Effet rafraîchissant sur la zone plantée et ses abords immédiats."
                    )}
                  </p>
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-700 mb-1">
                      {t("Impact scale", "Échelle d’impact")}
                    </p>
                    <div className="relative h-2 rounded-full bg-orange-100 overflow-hidden">
                      <div className="absolute inset-y-0 left-1/3 w-px bg-white/70" />
                      <div className="absolute inset-y-0 left-2/3 w-px bg-white/70" />
                      <div
                        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-orange-500 shadow"
                        style={{
                          left:
                            Math.abs(results.total.heatIslandReductionDegC) < 0.2
                              ? "16%"
                              : Math.abs(results.total.heatIslandReductionDegC) < 0.6
                              ? "50%"
                              : "84%"
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

            {/* Project benefits summary – table + charts (full width) */}
            <div className="mt-4 grid gap-6 grid-cols-1 w-full">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm w-full">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                  {t("Project benefits summary", "Résumé des bénéfices du projet")}
                </h4>
                {valueMix ? (
                  <div className="space-y-5 text-sm">
                    {(() => {
                      const vm = valueMix!;
                      const rows = [
                        {
                          key: "carbon",
                          group: t("Climate / carbon", "Climat / carbone"),
                          functionLabel: t(
                            "Carbon storage & avoided emissions",
                            "Stockage de carbone et émissions évitées"
                          ),
                          value: vm.carbon,
                          color: "#0f766e"
                        },
                        {
                          key: "stormwater",
                          group: t(
                            "Water & flood management",
                            "Gestion de l’eau et des inondations"
                          ),
                          functionLabel: t(
                            "Stormwater retention & flood alleviation",
                            "Rétention des eaux pluviales et réduction des inondations"
                          ),
                          value: vm.stormwater,
                          color: "#0369a1"
                        },
                        {
                          key: "health",
                          group: t(
                            "Health & community",
                            "Santé et communauté"
                          ),
                          functionLabel: t(
                            "Health, well-being & exposure reduction",
                            "Santé, bien‑être et réduction des expositions"
                          ),
                          value: vm.health,
                          color: "#c026d3"
                        },
                        {
                          key: "property",
                          group: t(
                            "Property & economic",
                            "Foncière et économique"
                          ),
                          functionLabel: t(
                            "Property value & local economic uplift",
                            "Valeur foncière et retombées économiques locales"
                          ),
                          value: vm.property,
                          color: "#d97706"
                        }
                      ];
                      const total = vm.total || 1;

                      // Build gradient for simple pie chart (conic)
                      let acc = 0;
                      const pieGradient = rows
                        .map(row => {
                          const start = (acc / total) * 360;
                          acc += row.value;
                          const end = (acc / total) * 360;
                          return `${row.color} ${start}deg ${end}deg`;
                        })
                        .join(", ");

                      return (
                        <>
                          {/* Table view (inspired by external methodology dashboards) */}
                          <div className="overflow-x-auto w-full">
                            <table className="min-w-full border border-slate-200 text-sm">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                    {t("Benefit group", "Groupe de bénéfices")}
                                  </th>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                    {t("Tree function", "Fonction des arbres")}
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                    {t("Annual value (CAD/yr)", "Valeur annuelle (CAD/an)")}
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                    {t("Share of total", "Part du total")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map(row => {
                                  const pct = (row.value / total) * 100;
                                  return (
                                    <tr key={row.key} className="border-t border-slate-200">
                                      <td className="px-4 py-2.5 align-top text-slate-800">
                                        {row.group}
                                      </td>
                                      <td className="px-4 py-2.5 align-top text-slate-600">
                                        {row.functionLabel}
                                      </td>
                                      <td className="px-4 py-2.5 align-top text-slate-900 text-right font-medium">
                                        $
                                        {row.value.toLocaleString(undefined, {
                                          maximumFractionDigits: 0
                                        })}
                                      </td>
                                      <td className="px-4 py-2.5 align-top text-slate-600 text-right">
                                        {Math.round(pct)}%
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr className="border-t-2 border-slate-300 bg-slate-50/80">
                                  <td className="px-4 py-2.5 text-slate-900 font-semibold">
                                    {t("Total", "Total")}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {t(
                                      "All quantified ecosystem services",
                                      "Tous les services écosystémiques quantifiés"
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-900 font-semibold text-right">
                                    $
                                    {total.toLocaleString(undefined, {
                                      maximumFractionDigits: 0
                                    })}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600 text-right">
                                    100%
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Bar + pie visualisation of tree functions' contribution – full width, larger */}
                          <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr,1fr] items-start w-full">
                            <div className="space-y-3 w-full">
                              <div className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                                {t(
                                  "Bar chart – contribution by function",
                                  "Diagramme à barres – contribution par fonction"
                                )}
                              </div>
                              <div className="space-y-3">
                                {rows.map(row => {
                                  const pct = Math.round((row.value / total) * 100);
                                  const barWidth = Math.max(pct, 4);
                                  return (
                                    <div key={row.key} className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-700 font-medium">{row.group}</span>
                                        <span className="text-slate-500">{pct}%</span>
                                      </div>
                                      <div className="h-5 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                          className="h-5 rounded-full"
                                          style={{
                                            width: `${barWidth}%`,
                                            backgroundColor: row.color
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-3 flex flex-col items-center w-full">
                              <div className="text-sm font-semibold uppercase tracking-wide text-slate-600 self-start">
                                {t(
                                  "Pie chart – share of total value",
                                  "Diagramme circulaire – part du total"
                                )}
                              </div>
                              <div
                                className="h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44 rounded-full border border-slate-200 shadow-inner flex-shrink-0"
                                style={{
                                  backgroundImage: `conic-gradient(${pieGradient})`
                                }}
                                aria-hidden="true"
                              />
                              <div className="grid grid-cols-2 gap-2 w-full text-sm">
                                {rows.map(row => (
                                  <div key={row.key} className="flex items-center gap-2">
                                    <span
                                      className="inline-block h-3 w-3 rounded-full border border-slate-300 flex-shrink-0"
                                      style={{ backgroundColor: row.color }}
                                    />
                                    <span className="text-slate-600">
                                      {row.group}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-slate-500">
                            {t(
                              "Tree functions and proxies are grouped into climate/carbon, water & flood management, health & community and property & economic uplift. These are simplified annual estimates for a representative year of maturity, not full-lifespan totals.",
                              "Les fonctions des arbres et leurs proxys sont regroupées en climat/carbone, gestion de l’eau et des inondations, santé et communauté, et hausse foncière et économique. Il s’agit d’estimations annuelles simplifiées pour une année représentative de maturité, et non de totaux sur toute la durée de vie."
                            )}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {t(
                      "Run a calculation to see how benefits are distributed across categories.",
                      "Lancez un calcul pour voir comment les bénéfices se répartissent entre les catégories."
                    )}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm w-full">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                  {t("Benefit groups comparison", "Comparaison des groupes de bénéfices")}
                </h4>
                {groupScores ? (
                  <div className="space-y-4 text-sm">
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
                            <div className="flex justify-between mb-1.5 text-sm">
                              <span className="text-slate-700 font-medium">
                                {group.label}
                              </span>
                              <span className="text-slate-500">{strength}</span>
                            </div>
                            <div className="h-5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-5 rounded-full ${group.color}`}
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    <p className="mt-3 text-xs text-slate-500">
                      {t(
                        "Relative strength of each group is scaled to the strongest impact in your project.",
                        "L’intensité relative de chaque groupe est mise à l’échelle par rapport à l’impact le plus fort de votre projet."
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {t(
                      "Run a calculation to compare climate, water, health and biodiversity contributions.",
                      "Lancez un calcul pour comparer les contributions climat, eau, santé et biodiversité."
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Additional impact perspectives – optional panels to add to report */}
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] text-slate-700">
                    +
                  </span>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-1">
                      {t("Compared to turf grass or pavement", "Comparaison avec le gazon ou le pavage")}
                    </h4>
                    <p className="text-[11px] text-slate-700 mb-2">
                      {t(
                        "Explore how benefits change if the same area stayed as turf grass or hard surface instead of being planted with trees.",
                        "Explorez comment les bénéfices changent si la même superficie reste en gazon ou en surface dure plutôt qu’en plantation d’arbres."
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowTurfComparison(true)}
                      className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!results || !turfScenario}
                    >
                      {t(
                        "View comparison with other land covers",
                        "Voir la comparaison avec d’autres types de couverture du sol"
                      )}
                    </button>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {t(
                        "Uses simplified assumptions about how turf and paved surfaces perform for carbon, water, health and heat.",
                        "S’appuie sur des hypothèses simplifiées de performance du gazon et des surfaces pavées en carbone, eau, santé et chaleur."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] text-slate-700">
                    +
                  </span>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-1">
                      {t("Groups benefiting", "Groupes bénéficiaires")}
                    </h4>
                    <p className="text-[11px] text-slate-700 mb-2">
                      {t(
                        "Capture which groups benefit most and add a short title you can reuse in reports and exports.",
                        "Indiquez quels groupes bénéficient le plus et ajoutez un court titre réutilisable dans vos rapports et exports."
                      )}
                    </p>
                    <div className="grid gap-2 md:grid-cols-[1.2fr,1.5fr] items-start mb-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-slate-700">
                          {t("Group type", "Type de groupe")}
                        </label>
                        <select
                          value={stakeholderType}
                          onChange={e => setStakeholderType(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        >
                          <option value="">
                            {t("Select a type…", "Sélectionnez un type…")}
                          </option>
                          <option value="nearbyResidents">
                            {t("Residents near the site", "Résident·es près du site")}
                          </option>
                          <option value="activeTravel">
                            {t(
                              "People walking, rolling & cycling",
                              "Piétons, cyclistes et usagers en mobilité réduite"
                            )}
                          </option>
                          <option value="municipalTeams">
                            {t(
                              "Municipal operations & infrastructure teams",
                              "Services municipaux et équipes d’infrastructure"
                            )}
                          </option>
                          <option value="schools">
                            {t("Schools & students", "Écoles et élèves")}
                          </option>
                          <option value="businesses">
                            {t("Local businesses", "Entreprises locales")}
                          </option>
                          <option value="communityGroups">
                            {t("Community and equity groups", "Groupes communautaires et d’équité")}
                          </option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-slate-700">
                          {t(
                            "Short group title (max 80 characters)",
                            "Court titre pour le groupe (80 caractères max.)"
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={stakeholderTitle}
                            maxLength={80}
                            onChange={e => setStakeholderTitle(e.target.value)}
                            className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                            placeholder={t(
                              "Example: Seniors in nearby apartment towers",
                              "Ex. : Aîné·es des immeubles à proximité"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!stakeholderType || !stakeholderTitle.trim()) return;
                              setStakeholderEntries(prev => [
                                ...prev,
                                {
                                  type: stakeholderType,
                                  title: stakeholderTitle.trim()
                                }
                              ]);
                              setStakeholderTitle("");
                            }}
                            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!stakeholderType || !stakeholderTitle.trim()}
                          >
                            {t("Add", "Ajouter")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {stakeholderEntries.length === 0 && (
                        <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700">
                          {t(
                            "No groups added yet – use the form above to capture them.",
                            "Aucun groupe ajouté pour l’instant – utilisez le formulaire ci‑dessus pour les saisir."
                          )}
                        </span>
                      )}
                      {stakeholderEntries.map((entry, idx) => (
                        <span
                          key={`${entry.type}-${idx}-${entry.title}`}
                          className="rounded-full bg-primary-50 border border-primary-200 px-2 py-1 text-primary-800"
                        >
                          {entry.title}
                        </span>
                      ))}
                      {priorityGroups.length > 0 && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1 text-emerald-800">
                          {t("Priority groups you selected", "Groupes prioritaires sélectionnés")}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      {t(
                        "These groups do not change the calculations; they appear in the printable report and structured exports.",
                        "Ces groupes ne modifient pas les calculs; ils apparaissent dans le rapport imprimable et les exports structurés."
                      )}
                    </p>
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


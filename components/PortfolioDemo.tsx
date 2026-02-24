"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { calculateBenefits } from "@/lib/benefitCalculator";

type Language = "en" | "fr";

interface PortfolioDemoProps {
  language: Language;
}

type RegionKey =
  | "atlantic"
  | "quebec"
  | "ontario"
  | "prairies"
  | "bc"
  | "territories";

type Typology = "urban-forest" | "riparian" | "street-trees" | "park-restoration" | "green-infrastructure";
type Stage = "planning" | "approved" | "planting" | "monitoring" | "completed";

interface MockProject {
  id: string;
  name: string;
  municipality: string;
  province: string;
  region: RegionKey;
  size: "small" | "medium" | "large";
  typology: Typology;
  stage: Stage;
  year: number;
  trees: number;
  areaHa: number;
  carbonTonnes: number;
  stormwaterLitres: number;
  lat: number;
  lng: number;
}

const mockProjects: MockProject[] = [
  {
    id: "p1",
    name: "Downtown Heat Relief Canopy",
    municipality: "Halifax",
    province: "NS",
    region: "atlantic",
    size: "medium",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 750,
    areaHa: 12,
    carbonTonnes: 15,
    stormwaterLitres: 2200000,
    lat: 44.6488,
    lng: -63.5752
  },
  {
    id: "p2",
    name: "Green Streets Pilot",
    municipality: "Montreal",
    province: "QC",
    region: "quebec",
    size: "large",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 1200,
    areaHa: 18,
    carbonTonnes: 24,
    stormwaterLitres: 3800000,
    lat: 45.5017,
    lng: -73.5673
  },
  {
    id: "p3",
    name: "Riparian Buffer Restoration",
    municipality: "Saskatoon",
    province: "SK",
    region: "prairies",
    size: "medium",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 600,
    areaHa: 20,
    carbonTonnes: 12,
    stormwaterLitres: 1900000,
    lat: 52.1332,
    lng: -106.6700
  },
  {
    id: "p4",
    name: "Neighborhood Climate Forest",
    municipality: "Vancouver",
    province: "BC",
    region: "bc",
    size: "large",
    typology: "urban-forest",
    stage: "completed",
    year: 2025,
    trees: 1500,
    areaHa: 16,
    carbonTonnes: 30,
    stormwaterLitres: 4500000,
    lat: 49.2827,
    lng: -123.1207
  },
  {
    id: "p5",
    name: "Main Street Tree Retrofit",
    municipality: "Charlottetown",
    province: "PE",
    region: "atlantic",
    size: "small",
    typology: "street-trees",
    stage: "planting",
    year: 2024,
    trees: 120,
    areaHa: 3,
    carbonTonnes: 3,
    stormwaterLitres: 450000,
    lat: 46.2382,
    lng: -63.1311
  },
  {
    id: "p6",
    name: "Riverside Park Enhancement",
    municipality: "Toronto",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "park-restoration",
    stage: "approved",
    year: 2025,
    trees: 2000,
    areaHa: 25,
    carbonTonnes: 40,
    stormwaterLitres: 6000000,
    lat: 43.6532,
    lng: -79.3832
  },
  {
    id: "p7",
    name: "Community Green Corridor",
    municipality: "Calgary",
    province: "AB",
    region: "prairies",
    size: "medium",
    typology: "green-infrastructure",
    stage: "planning",
    year: 2025,
    trees: 850,
    areaHa: 14,
    carbonTonnes: 17,
    stormwaterLitres: 2500000,
    lat: 51.0447,
    lng: -114.0719
  },
  {
    id: "p8",
    name: "Wetland Edge Restoration",
    municipality: "Winnipeg",
    province: "MB",
    region: "prairies",
    size: "medium",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 450,
    areaHa: 10,
    carbonTonnes: 9,
    stormwaterLitres: 1400000,
    lat: 49.8951,
    lng: -97.1384
  },
  {
    id: "p9",
    name: "Indigenous Community Forest",
    municipality: "Whitehorse",
    province: "YT",
    region: "territories",
    size: "small",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 200,
    areaHa: 8,
    carbonTonnes: 4,
    stormwaterLitres: 600000,
    lat: 60.7212,
    lng: -135.0568
  },
  {
    id: "p10",
    name: "Boulevard Canopy Expansion",
    municipality: "Ottawa",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "street-trees",
    stage: "completed",
    year: 2024,
    trees: 1800,
    areaHa: 22,
    carbonTonnes: 36,
    stormwaterLitres: 5400000,
    lat: 45.4215,
    lng: -75.6972
  },
  {
    id: "p11",
    name: "Coastal Buffer Zone",
    municipality: "St. John's",
    province: "NL",
    region: "atlantic",
    size: "small",
    typology: "riparian",
    stage: "approved",
    year: 2025,
    trees: 180,
    areaHa: 6,
    carbonTonnes: 4,
    stormwaterLitres: 550000,
    lat: 47.5615,
    lng: -52.7126
  },
  {
    id: "p12",
    name: "Urban Heat Island Mitigation",
    municipality: "Edmonton",
    province: "AB",
    region: "prairies",
    size: "large",
    typology: "green-infrastructure",
    stage: "planning",
    year: 2025,
    trees: 1600,
    areaHa: 21,
    carbonTonnes: 32,
    stormwaterLitres: 4800000,
    lat: 53.5461,
    lng: -113.4938
  },
  {
    id: "p13",
    name: "River Walk Greenway",
    municipality: "Moncton",
    province: "NB",
    region: "atlantic",
    size: "medium",
    typology: "riparian",
    stage: "planting",
    year: 2025,
    trees: 520,
    areaHa: 11,
    carbonTonnes: 10,
    stormwaterLitres: 1560000,
    lat: 46.0878,
    lng: -64.7782
  },
  {
    id: "p14",
    name: "Old Port Shade Initiative",
    municipality: "Quebec City",
    province: "QC",
    region: "quebec",
    size: "large",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 950,
    areaHa: 14,
    carbonTonnes: 20,
    stormwaterLitres: 2850000,
    lat: 46.8139,
    lng: -71.2082
  },
  {
    id: "p15",
    name: "West End Urban Forest",
    municipality: "Victoria",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "urban-forest",
    stage: "completed",
    year: 2024,
    trees: 680,
    areaHa: 9,
    carbonTonnes: 14,
    stormwaterLitres: 2040000,
    lat: 48.4284,
    lng: -123.3656
  },
  {
    id: "p16",
    name: "Trans-Canada Green Corridor",
    municipality: "Regina",
    province: "SK",
    region: "prairies",
    size: "medium",
    typology: "green-infrastructure",
    stage: "monitoring",
    year: 2024,
    trees: 420,
    areaHa: 8,
    carbonTonnes: 8,
    stormwaterLitres: 1260000,
    lat: 50.4452,
    lng: -104.6189
  },
  {
    id: "p17",
    name: "Downtown Hamilton Canopy",
    municipality: "Hamilton",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 1100,
    areaHa: 17,
    carbonTonnes: 22,
    stormwaterLitres: 3300000,
    lat: 43.2557,
    lng: -79.8711
  },
  {
    id: "p18",
    name: "Bay of Fundy Buffer",
    municipality: "Saint John",
    province: "NB",
    region: "atlantic",
    size: "small",
    typology: "riparian",
    stage: "planning",
    year: 2025,
    trees: 280,
    areaHa: 7,
    carbonTonnes: 6,
    stormwaterLitres: 840000,
    lat: 45.2733,
    lng: -66.0633
  },
  {
    id: "p19",
    name: "Gatineau Park Edge Restoration",
    municipality: "Gatineau",
    province: "QC",
    region: "quebec",
    size: "medium",
    typology: "park-restoration",
    stage: "approved",
    year: 2025,
    trees: 780,
    areaHa: 15,
    carbonTonnes: 16,
    stormwaterLitres: 2340000,
    lat: 45.4765,
    lng: -75.7013
  },
  {
    id: "p20",
    name: "Okanagan Shade & Stormwater",
    municipality: "Kelowna",
    province: "BC",
    region: "bc",
    size: "large",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 1300,
    areaHa: 19,
    carbonTonnes: 26,
    stormwaterLitres: 3900000,
    lat: 49.8880,
    lng: -119.4960
  },
  {
    id: "p21",
    name: "North Saskatchewan Riparian",
    municipality: "Edmonton",
    province: "AB",
    region: "prairies",
    size: "large",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 890,
    areaHa: 24,
    carbonTonnes: 18,
    stormwaterLitres: 2670000,
    lat: 53.5461,
    lng: -113.4938
  },
  {
    id: "p22",
    name: "Yellowknife Community Forest",
    municipality: "Yellowknife",
    province: "NT",
    region: "territories",
    size: "small",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 240,
    areaHa: 5,
    carbonTonnes: 5,
    stormwaterLitres: 720000,
    lat: 62.4540,
    lng: -114.3718
  },
  {
    id: "p23",
    name: "London Civic Greens",
    municipality: "London",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "park-restoration",
    stage: "completed",
    year: 2024,
    trees: 1400,
    areaHa: 20,
    carbonTonnes: 28,
    stormwaterLitres: 4200000,
    lat: 42.9849,
    lng: -81.2453
  },
  {
    id: "p24",
    name: "Fredericton Treeway",
    municipality: "Fredericton",
    province: "NB",
    region: "atlantic",
    size: "small",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 190,
    areaHa: 4,
    carbonTonnes: 4,
    stormwaterLitres: 570000,
    lat: 45.9636,
    lng: -66.6431
  },
  {
    id: "p25",
    name: "Sherbrooke Green Streets",
    municipality: "Sherbrooke",
    province: "QC",
    region: "quebec",
    size: "medium",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 580,
    areaHa: 10,
    carbonTonnes: 12,
    stormwaterLitres: 1740000,
    lat: 45.4009,
    lng: -71.8824
  },
  {
    id: "p26",
    name: "Iqaluit Northern Greening",
    municipality: "Iqaluit",
    province: "NU",
    region: "territories",
    size: "small",
    typology: "urban-forest",
    stage: "planning",
    year: 2025,
    trees: 90,
    areaHa: 3,
    carbonTonnes: 2,
    stormwaterLitres: 270000,
    lat: 63.7467,
    lng: -68.5170
  },
  {
    id: "p27",
    name: "Kitchener Innovation District Canopy",
    municipality: "Kitchener",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 620,
    areaHa: 11,
    carbonTonnes: 12,
    stormwaterLitres: 1860000,
    lat: 43.4516,
    lng: -80.4925
  },
  {
    id: "p28",
    name: "Red River Floodplain Planting",
    municipality: "Winnipeg",
    province: "MB",
    region: "prairies",
    size: "large",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 1050,
    areaHa: 22,
    carbonTonnes: 21,
    stormwaterLitres: 3150000,
    lat: 49.8951,
    lng: -97.1384
  },
  {
    id: "p29",
    name: "Nanaimo Waterfront Park",
    municipality: "Nanaimo",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "park-restoration",
    stage: "completed",
    year: 2024,
    trees: 470,
    areaHa: 8,
    carbonTonnes: 9,
    stormwaterLitres: 1410000,
    lat: 49.1659,
    lng: -123.9401
  },
  {
    id: "p30",
    name: "Dartmouth Lakes Green Network",
    municipality: "Dartmouth",
    province: "NS",
    region: "atlantic",
    size: "medium",
    typology: "green-infrastructure",
    stage: "planting",
    year: 2025,
    trees: 540,
    areaHa: 12,
    carbonTonnes: 11,
    stormwaterLitres: 1620000,
    lat: 44.6653,
    lng: -63.5672
  },
  {
    id: "p31",
    name: "Trois-Rivières Urban Oasis",
    municipality: "Trois-Rivières",
    province: "QC",
    region: "quebec",
    size: "medium",
    typology: "urban-forest",
    stage: "approved",
    year: 2025,
    trees: 410,
    areaHa: 9,
    carbonTonnes: 8,
    stormwaterLitres: 1230000,
    lat: 46.3432,
    lng: -72.5763
  },
  {
    id: "p32",
    name: "Lethbridge Coulee Restoration",
    municipality: "Lethbridge",
    province: "AB",
    region: "prairies",
    size: "medium",
    typology: "riparian",
    stage: "planning",
    year: 2025,
    trees: 380,
    areaHa: 13,
    carbonTonnes: 8,
    stormwaterLitres: 1140000,
    lat: 49.6935,
    lng: -112.8418
  }
];

const regionLabels: Record<
  RegionKey,
  { en: string; fr: string; color: string }
> = {
  atlantic: {
    en: "Atlantic",
    fr: "Atlantique",
    color: "from-cyan-500 to-sky-500"
  },
  quebec: {
    en: "Quebec",
    fr: "Québec",
    color: "from-emerald-500 to-teal-500"
  },
  ontario: {
    en: "Ontario",
    fr: "Ontario",
    color: "from-lime-500 to-emerald-500"
  },
  prairies: {
    en: "Prairies",
    fr: "Prairies",
    color: "from-amber-400 to-yellow-400"
  },
  bc: {
    en: "British Columbia",
    fr: "Colombie-Britannique",
    color: "from-sky-500 to-indigo-500"
  },
  territories: {
    en: "Territories",
    fr: "Territoires",
    color: "from-slate-300 to-slate-400"
  }
};

const typologyMeta: Record<Typology, { en: string; fr: string; icon: string }> = {
  "urban-forest": {
    en: "Community-wide urban planting",
    fr: "Plantation urbaine à l’échelle de la collectivité",
    icon: "🌳"
  },
  riparian: {
    en: "Riparian planting in flood-prone areas",
    fr: "Plantation riveraine en zones inondables",
    icon: "🌊"
  },
  "street-trees": {
    en: "Street tree planting",
    fr: "Plantation d’arbres de rue",
    icon: "🚶‍♂️"
  },
  "park-restoration": {
    en: "Park tree planting",
    fr: "Plantation d’arbres dans les parcs",
    icon: "🏞️"
  },
  "green-infrastructure": {
    en: "Urban low-canopy neighbourhoods",
    fr: "Quartiers urbains à faible canopée",
    icon: "🌿"
  }
};

const stageLabels: Record<Stage, { en: string; fr: string }> = {
  "planning": { en: "Planning", fr: "Planification" },
  "approved": { en: "Approved", fr: "Approuvé" },
  "planting": { en: "Planting", fr: "Plantation" },
  "monitoring": { en: "Monitoring", fr: "Surveillance" },
  "completed": { en: "Completed", fr: "Terminé" }
};

export function PortfolioDemo({ language }: PortfolioDemoProps) {
  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  const [view, setView] = useState<"portfolio" | "project" | "portfolioBenefits">(
    "portfolio"
  );
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | "all">("all");
  const [selectedTypology, setSelectedTypology] = useState<Typology | "all">("all");
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large" | "all">("all");
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null);
  const [activeMapLayer, setActiveMapLayer] = useState<"temperature" | "canopy" | "indigenous" | null>(null);
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -95,
    latitude: 55,
    zoom: 3.5
  });

  const [stakeholderNames, setStakeholderNames] = useState<string[]>([]);
  const [newStakeholderName, setNewStakeholderName] = useState("");

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => {
      if (selectedRegion !== "all" && p.region !== selectedRegion) return false;
      if (selectedTypology !== "all" && p.typology !== selectedTypology) return false;
      if (selectedSize !== "all" && p.size !== selectedSize) return false;
      return true;
    });
  }, [selectedRegion, selectedTypology, selectedSize]);

  const totalProjects = filteredProjects.length;
  const totalTrees = filteredProjects.reduce((sum, p) => sum + p.trees, 0);
  const totalCarbon = filteredProjects.reduce((sum, p) => sum + p.carbonTonnes, 0);
  const totalStormwater = filteredProjects.reduce(
    (sum, p) => sum + p.stormwaterLitres,
    0
  );
  const totalAreaHa = filteredProjects.reduce((sum, p) => sum + (p.areaHa || 0), 0);

  const averageTreesPerProject =
    totalProjects === 0 ? 0 : Math.round(totalTrees / totalProjects);

  const communityImpactIndicator =
    totalProjects === 0
      ? t("No data", "Aucune donnée")
      : averageTreesPerProject > 1500
      ? t("very strong", "très fort")
      : averageTreesPerProject > 700
      ? t("strong", "fort")
      : averageTreesPerProject > 300
      ? t("moderate", "modéré")
      : t("emerging", "émergent");

  const downloadPortfolioCsv = () => {
    if (filteredProjects.length === 0) return;
    const header = [
      "id",
      "name",
      "municipality",
      "province",
      "region",
      "size",
      "typology",
      "stage",
      "year",
      "trees",
      "carbonTonnes",
      "stormwaterLitres"
    ];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name,
      p.municipality,
      p.province,
      p.region,
      p.size,
      p.typology,
      p.stage,
      String(p.year),
      String(p.trees),
      String(p.carbonTonnes),
      String(p.stormwaterLitres)
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "portfolio-projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manage map layers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    
    // Wait for map to be loaded
    if (!map.loaded()) {
      const onLoad = () => {
        updateLayers();
      };
      map.on("load", onLoad);
      return () => {
        map.off("load", onLoad);
      };
    }

    updateLayers();

    function updateLayers() {
      // Remove existing overlay layers
      const existingLayers = ["temperature-layer", "canopy-layer", "indigenous-layer"];
      const existingSources = ["temperature-source", "canopy-source", "indigenous-source"];
      
      existingLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });
      
      existingSources.forEach(sourceId => {
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });

      if (!activeMapLayer) return;

      let sourceId: string;
      let layerId: string;
      let data: any;

      if (activeMapLayer === "temperature") {
        sourceId = "temperature-source";
        layerId = "temperature-layer";
        // Create placeholder temperature data with regional variation
        // Different regions have different temperature values (in Celsius)
        data = {
          type: "FeatureCollection" as const,
          features: [
            // Northern regions (cold)
            {
              type: "Feature" as const,
              properties: { temperature: 5 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-141, 60],
                  [-100, 60],
                  [-100, 84],
                  [-141, 84],
                  [-141, 60]
                ]]
              }
            },
            // Central regions (moderate)
            {
              type: "Feature" as const,
              properties: { temperature: 15 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-110, 49],
                  [-85, 49],
                  [-85, 60],
                  [-110, 60],
                  [-110, 49]
                ]]
              }
            },
            // Southern regions (warm)
            {
              type: "Feature" as const,
              properties: { temperature: 22 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-125, 41],
                  [-60, 41],
                  [-60, 49],
                  [-125, 49],
                  [-125, 41]
                ]]
              }
            },
            // Eastern regions (moderate-warm)
            {
              type: "Feature" as const,
              properties: { temperature: 18 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-85, 41],
                  [-52, 41],
                  [-52, 55],
                  [-85, 55],
                  [-85, 41]
                ]]
              }
            },
            // Western regions (cool-moderate)
            {
              type: "Feature" as const,
              properties: { temperature: 12 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-141, 49],
                  [-110, 49],
                  [-110, 60],
                  [-141, 60],
                  [-141, 49]
                ]]
              }
            }
          ]
        };
      } else if (activeMapLayer === "canopy") {
        sourceId = "canopy-source";
        layerId = "canopy-layer";
        // Create placeholder canopy cover data with regional variation
        // Different regions have different canopy percentages
        data = {
          type: "FeatureCollection" as const,
          features: [
            // High canopy regions (urban forests)
            {
              type: "Feature" as const,
              properties: { canopy: 55 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-125, 49],
                  [-110, 49],
                  [-110, 55],
                  [-125, 55],
                  [-125, 49]
                ]]
              }
            },
            // Medium-high canopy
            {
              type: "Feature" as const,
              properties: { canopy: 40 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-85, 45],
                  [-70, 45],
                  [-70, 50],
                  [-85, 50],
                  [-85, 45]
                ]]
              }
            },
            // Medium canopy
            {
              type: "Feature" as const,
              properties: { canopy: 30 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-110, 49],
                  [-85, 49],
                  [-85, 55],
                  [-110, 55],
                  [-110, 49]
                ]]
              }
            },
            // Low-medium canopy
            {
              type: "Feature" as const,
              properties: { canopy: 20 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-110, 55],
                  [-95, 55],
                  [-95, 60],
                  [-110, 60],
                  [-110, 55]
                ]]
              }
            },
            // Low canopy (prairies, northern)
            {
              type: "Feature" as const,
              properties: { canopy: 10 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-110, 49],
                  [-100, 49],
                  [-100, 55],
                  [-110, 55],
                  [-110, 49]
                ]]
              }
            },
            // Very low canopy (northern/arctic)
            {
              type: "Feature" as const,
              properties: { canopy: 5 },
              geometry: {
                type: "Polygon" as const,
                coordinates: [[
                  [-141, 60],
                  [-100, 60],
                  [-100, 84],
                  [-141, 84],
                  [-141, 60]
                ]]
              }
            }
          ]
        };
      } else {
        sourceId = "indigenous-source";
        layerId = "indigenous-layer";
        // Create placeholder points for indigenous communities
        data = {
          type: "FeatureCollection" as const,
          features: [
            { type: "Feature" as const, properties: { count: 3 }, geometry: { type: "Point" as const, coordinates: [-95, 55] } },
            { type: "Feature" as const, properties: { count: 5 }, geometry: { type: "Point" as const, coordinates: [-110, 60] } },
            { type: "Feature" as const, properties: { count: 2 }, geometry: { type: "Point" as const, coordinates: [-100, 50] } },
            { type: "Feature" as const, properties: { count: 4 }, geometry: { type: "Point" as const, coordinates: [-85, 50] } },
            { type: "Feature" as const, properties: { count: 6 }, geometry: { type: "Point" as const, coordinates: [-120, 55] } },
            { type: "Feature" as const, properties: { count: 3 }, geometry: { type: "Point" as const, coordinates: [-75, 45] } }
          ]
        };
      }

      // Add source
      map.addSource(sourceId, {
        type: "geojson",
        data: data
      });

      // Add layer based on type
      if (activeMapLayer === "temperature") {
        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "temperature"],
              0, "#2166ac",   // Dark blue (cold)
              5, "#4393c3",   // Medium blue
              10, "#92c5de",  // Light blue
              15, "#d1e5f0",  // Very light blue
              20, "#fddbc7",  // Light orange
              25, "#f4a582",  // Medium orange
              30, "#d6604d",  // Red-orange (warm)
              35, "#b2182b"   // Dark red (hot)
            ],
            "fill-opacity": 0.6
          }
        });
      } else if (activeMapLayer === "canopy") {
        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "canopy"],
              0, "#f7f7f7",   // Very light gray (no canopy)
              5, "#e8f5e9",   // Very light green
              10, "#c8e6c9",  // Light green
              20, "#a5d6a7",  // Medium-light green
              30, "#81c784",  // Medium green
              40, "#66bb6a",  // Medium-dark green
              50, "#4caf50",  // Dark green
              60, "#388e3c",  // Very dark green (high canopy)
              70, "#2e7d32"   // Darkest green (very high canopy)
            ],
            "fill-opacity": 0.5
          }
        });
      } else if (activeMapLayer === "indigenous") {
        map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "count"],
              0, 6,
              10, 20
            ],
            "circle-color": "#8b5cf6",
            "circle-opacity": 0.7,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff"
          }
        });
      }
    }
  }, [activeMapLayer]);

  // Project detail view
  if (view === "project" && selectedProject) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-6 space-y-5">
        <button
          type="button"
          onClick={() => setView("portfolio")}
          className="text-xs text-slate-600 hover:text-slate-900"
        >
          ←{" "}
          {t(
            "Back to portfolio overview",
            "Retour à la vue d'ensemble du portefeuille"
          )}
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-base md:text-lg font-semibold text-slate-900">
                {selectedProject.name}
              </h1>
              <p className="text-xs text-slate-600">
                {selectedProject.municipality}, {selectedProject.province} ·{" "}
                {selectedProject.year}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-primary-50 border border-primary-200 px-2 py-1 text-primary-800 font-medium">
                {language === "fr"
                  ? regionLabels[selectedProject.region].fr
                  : regionLabels[selectedProject.region].en}
              </span>
              <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700 font-medium flex items-center gap-1">
                <span>{typologyMeta[selectedProject.typology].icon}</span>
                <span>
                  {language === "fr"
                    ? typologyMeta[selectedProject.typology].fr
                    : typologyMeta[selectedProject.typology].en}
                </span>
              </span>
              <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700 font-medium">
                {language === "fr"
                  ? stageLabels[selectedProject.stage].fr
                  : stageLabels[selectedProject.stage].en}
              </span>
              <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700 font-medium capitalize">
                {selectedProject.size === "small"
                  ? t("Small community", "Petite collectivité")
                  : selectedProject.size === "medium"
                  ? t("Medium community", "Collectivité moyenne")
                  : t("Large community", "Grande collectivité")}
              </span>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                {t("Trees", "Arbres")}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {selectedProject.trees.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-wide text-primary-800 font-medium">
                {t("Carbon (tCO₂e/yr)", "Carbone (tCO₂e/an)")}
              </div>
              <div className="mt-1 text-lg font-bold text-primary-900">
                {selectedProject.carbonTonnes.toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
            <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-wide text-secondary-800 font-medium">
                {t("Stormwater (L/yr)", "Eaux pluviales (L/an)")}
              </div>
              <div className="mt-1 text-lg font-bold text-secondary-900">
                {(selectedProject.stormwaterLitres / 1_000_000).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 1 }
                )}{" "}
                M
              </div>
            </div>
          </div>

          {/* Benefits & impacts (aligned with project setup / calculator) */}
          {(() => {
            const projectResults = calculateBenefits({
              region: selectedProject.region,
              municipalitySize: selectedProject.size,
              populationServed: 10000,
              householdsServed: 4000,
              numberOfTrees: selectedProject.trees,
              projectAreaHa: selectedProject.areaHa,
              year: selectedProject.year
            });
            return (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {t("Benefits & impacts", "Bénéfices et impacts")}
                </h2>
                <p className="text-[11px] text-slate-600 mb-4">
                  {t(
                    "Estimated benefits for this project, using the same methodology as the calculator. Values are indicative for reporting and stakeholder communication.",
                    "Bénéfices estimés pour ce projet, selon la même méthodologie que le calculateur. Les valeurs sont indicatives pour les rapports et la communication avec les parties prenantes."
                  )}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-primary-200 bg-primary-50/80 p-3 shadow-sm">
                    <h3 className="text-[11px] font-semibold text-primary-800 uppercase tracking-wide mb-1">
                      {t("Climate / carbon", "Climat / carbone")}
                    </h3>
                    <p className="text-base font-bold text-primary-900">
                      {projectResults.total.carbonTonnes.toFixed(1)} tCO₂e / {t("yr", "an")}
                    </p>
                    <p className="text-[11px] text-primary-800 mt-0.5">
                      ≈ ${projectResults.total.carbonValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                      {t("carbon value", "valeur carbone")}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {t(
                        "Based on Canadian social carbon value assumptions.",
                        "Basé sur les hypothèses de valeur sociale du carbone au Canada."
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-secondary-200 bg-secondary-50/80 p-3 shadow-sm">
                    <h3 className="text-[11px] font-semibold text-secondary-800 uppercase tracking-wide mb-1">
                      {t("Stormwater / flooding", "Eaux pluviales / inondations")}
                    </h3>
                    <p className="text-base font-bold text-secondary-900">
                      {(projectResults.total.stormwaterLitres / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
                      M L {t("intercepted", "interceptés")}
                    </p>
                    <p className="text-[11px] text-secondary-800 mt-0.5">
                      ≈ ${projectResults.total.stormwaterValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                      {t("avoided infrastructure", "infrastructure évitée")}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {t(
                        "Rainfall intercepted and slowed by trees vs hard surfaces.",
                        "Pluie interceptée et ralentie par les arbres par rapport aux surfaces imperméables."
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-accent-200 bg-accent-50/80 p-3 shadow-sm">
                    <h3 className="text-[11px] font-semibold text-accent-800 uppercase tracking-wide mb-1">
                      {t("Health & wellbeing", "Santé et bien-être")}
                    </h3>
                    <p className="text-base font-bold text-accent-900">
                      ${projectResults.total.healthSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                      / {t("yr (proxy)", "an (proxy)")}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {t(
                        "Estimated value of reduced illness and improved mental wellbeing.",
                        "Valeur estimée de la réduction des maladies et de l'amélioration du bien-être mental."
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 shadow-sm">
                    <h3 className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide mb-1">
                      {t("Property value", "Valeur foncière")}
                    </h3>
                    <p className="text-base font-bold text-amber-900">
                      ${projectResults.total.propertyValueIncrease.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {t(
                        "Indicative uplift in adjacent property value.",
                        "Hausse indicative de la valeur des propriétés adjacentes."
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-3 shadow-sm">
                    <h3 className="text-[11px] font-semibold text-orange-800 uppercase tracking-wide mb-1">
                      {t("Urban heat", "Îlots de chaleur urbains")}
                    </h3>
                    <p className="text-base font-bold text-orange-900">
                      −{projectResults.total.heatIslandReductionDegC.toFixed(2)}°C
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {t(
                        "Cooling effect over the project footprint.",
                        "Effet rafraîchissant sur l'emprise du projet."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Project Images Gallery */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
              {t("Project gallery", "Galerie du projet")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-green-100 to-green-200 border border-green-300 flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {t("Planting", "Plantation")}
                  </div>
                </div>
              </div>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">🌳</div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {t("Growth", "Croissance")}
                  </div>
                </div>
              </div>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 border border-teal-300 flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {t("Community", "Communauté")}
                  </div>
                </div>
              </div>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {t("Impact", "Impact")}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {t(
                "Placeholder images. In production, these would show actual project photos uploaded by municipalities.",
                "Images de remplacement. En production, celles-ci afficheraient les photos réelles du projet téléchargées par les municipalités."
              )}
            </p>
          </div>

          {/* Project Location Map */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm" style={{ height: "300px" }}>
            <Map
              longitude={selectedProject.lng}
              latitude={selectedProject.lat}
              zoom={12}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/light-v11"
            >
              <Marker
                longitude={selectedProject.lng}
                latitude={selectedProject.lat}
                anchor="bottom"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🌲</span>
                </div>
              </Marker>
            </Map>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.3fr,1fr] items-start">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                {t("Project story", "Récit du projet")}
              </h2>
              <p className="text-xs text-slate-700">
                {t(
                  "Use this space to capture a 3–4 sentence narrative about who benefits, how the site is changing, and what risks are being reduced.",
                  "Utilisez cet espace pour saisir un récit de 3–4 phrases sur les bénéficiaires, la transformation du site et les risques réduits."
                )}
              </p>
              <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-1">
                <li>
                  {t(
                    "Highlight small-community impact by referencing per-capita and per-household metrics.",
                    "Soulignez l'impact pour les petites collectivités en faisant référence aux indicateurs par habitant et par ménage."
                  )}
                </li>
                <li>
                  {t(
                    "Connect physical benefits (trees, stormwater, cooling) to equity and health outcomes.",
                    "Reliez les bénéfices physiques (arbres, eaux pluviales, refroidissement) aux résultats en matière d'équité et de santé."
                  )}
                </li>
              </ul>

              {/* Project Updates Section */}
              <div className="pt-3 border-t border-slate-300">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {t("Project updates", "Mises à jour du projet")}
                </h3>
                <div className="space-y-2">
                  {[selectedProject.year, selectedProject.year + 2, selectedProject.year + 4].map((updateYear, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-900">
                          {t("Update", "Mise à jour")} {updateYear}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {idx === 0
                            ? t("Baseline", "Ligne de base")
                            : idx === 1
                            ? t("+2 years", "+2 ans")
                            : t("+4 years", "+4 ans")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-2">
                        {t(
                          "Project progress update and impact metrics will be captured here every 2 years.",
                          "La mise à jour de l'avancement du projet et les indicateurs d'impact seront saisis ici tous les 2 ans."
                        )}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-[10px] text-primary-600 hover:text-primary-800 font-medium"
                        >
                          📄 {t("View report", "Voir le rapport")}
                        </button>
                        <button
                          type="button"
                          className="text-[10px] text-primary-600 hover:text-primary-800 font-medium"
                        >
                          📥 {t("Download PDF", "Télécharger PDF")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                {t("How this view is used", "Utilisation de cette vue")}
              </h3>
              <p className="text-[11px] text-slate-600">
                {t(
                  "In a full build, this page can be auto-populated from the application form, with editable narrative blocks, project photos and exportable PDFs.",
                  "Dans une version complète, cette page peut être alimentée automatiquement à partir du formulaire de demande, avec des blocs narratifs modifiables, des photos de projet et des PDF exportables."
                )}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Portfolio benefits mock page
  if (view === "portfolioBenefits") {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-6 space-y-5">
        <button
          type="button"
          onClick={() => setView("portfolio")}
          className="text-xs text-slate-600 hover:text-slate-900"
        >
          ←{" "}
          {t(
            "Back to portfolio overview",
            "Retour à la vue d'ensemble du portefeuille"
          )}
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-base md:text-lg font-semibold text-slate-900">
                {t("Portfolio benefits", "Bénéfices du portefeuille")}
              </h1>
              <p className="text-xs text-slate-600">
                {t(
                  "Using the current filters, this view summarizes climate, water and health benefits across the portfolio.",
                  "Avec les filtres actuels, cette vue résume les bénéfices climatiques, hydriques et de santé pour l’ensemble du portefeuille."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadPortfolioCsv}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition"
              >
                📊 {t("Export portfolio (CSV)", "Exporter le portefeuille (CSV)")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition"
              >
                🧾 {t("Export as PDF", "Exporter en PDF")}
              </button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-primary-900 uppercase tracking-wide mb-2">
                {t("Climate / carbon", "Climat / carbone")}
              </h2>
              <p className="text-lg font-bold text-primary-900">
                {totalCarbon.toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}{" "}
                tCO₂e / {t("yr", "an")}
              </p>
              <p className="text-[11px] text-primary-900 mt-1">
                {t(
                  "Aggregated annual carbon benefit across all filtered projects.",
                  "Bénéfice annuel en carbone agrégé pour tous les projets filtrés."
                )}
              </p>
            </div>
            <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-secondary-900 uppercase tracking-wide mb-2">
                {t("Stormwater / flooding", "Eaux pluviales / inondations")}
              </h2>
              <p className="text-lg font-bold text-secondary-900">
                {(totalStormwater / 1_000_000).toLocaleString(undefined, {
                  maximumFractionDigits: 1
                })}{" "}
                M {t("L intercepted", "L interceptés")}
              </p>
              <p className="text-[11px] text-secondary-900 mt-1">
                {t(
                  "Relative avoided runoff that could be compared to grey infrastructure.",
                  "Ruissellement évité pouvant être comparé à l'infrastructure grise."
                )}
              </p>
            </div>
            <div className="rounded-xl border border-accent-200 bg-accent-50 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-accent-900 uppercase tracking-wide mb-2">
                {t("Health / equity (proxy)", "Santé / équité (proxy)")}
              </h2>
              <p className="text-lg font-bold text-accent-900">
                {totalTrees.toLocaleString()}{" "}
                {t(
                  "trees near homes & routes",
                  "arbres près des habitations et des parcours"
                )}
              </p>
              <p className="text-[11px] text-accent-900 mt-1">
                {t(
                  "Indicative count of trees contributing to shade, cooling and walkability.",
                  "Nombre indicatif d’arbres contribuant à l’ombre, au refroidissement et à la marchabilité."
                )}
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              {t("Using this in reports", "Utilisation dans les rapports")}
            </h3>
            <p className="text-[11px] text-slate-600">
              {t(
                "In a production version, this page can drive funder reports, with export to PowerBI or PDF and drill-down into regional or typology-based views.",
                "Dans une version de production, cette page peut alimenter les rapports aux bailleurs de fonds, avec export vers PowerBI ou PDF et exploration par région ou typologie."
              )}
            </p>
            <button
              type="button"
              onClick={() => window.open("#methodology", "_blank")}
              className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-100 transition"
            >
              {t("Read more about portfolio methodology", "En savoir plus sur la méthodologie du portefeuille")}
            </button>
          </section>

          {/* Portfolio inputs summary & charts */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              {t("Portfolio inputs summary", "Résumé des intrants du portefeuille")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                  {t("Total trees", "Total des arbres")}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {totalTrees.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                  {t("Total project area (Ha)", "Superficie totale des projets (Ha)")}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {totalAreaHa.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
                  {t("Average trees per project", "Nombre moyen d’arbres par projet")}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {totalProjects === 0 ? 0 : Math.round(totalTrees / totalProjects)}
                </div>
              </div>
            </div>

            {/* Simple charts: trees by typology & by region */}
            <div className="grid gap-4 md:grid-cols-2 text-[11px]">
              <div>
                <h4 className="mb-2 font-semibold text-slate-800">
                  {t("Trees by typology", "Arbres par typologie")}
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(typologyMeta).map(([key, meta]) => {
                    const totalForTypology = filteredProjects
                      .filter(p => p.typology === key)
                      .reduce((sum, p) => sum + p.trees, 0);
                    if (totalForTypology === 0) return null;
                    const share = totalTrees === 0 ? 0 : (totalForTypology / totalTrees) * 100;
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-0.5">
                          <span className="flex items-center gap-1 text-slate-700">
                            <span>{meta.icon}</span>
                            <span>{language === "fr" ? meta.fr : meta.en}</span>
                          </span>
                          <span className="text-slate-500">
                            {totalForTypology.toLocaleString()} ({share.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-primary-500"
                            style={{ width: `${Math.max(8, share)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <p className="text-slate-500">
                      {t("No projects in this portfolio view.", "Aucun projet dans cette vue de portefeuille.")}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-slate-800">
                  {t("Trees by region", "Arbres par région")}
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(regionLabels).map(([key, label]) => {
                    const totalForRegion = filteredProjects
                      .filter(p => p.region === key)
                      .reduce((sum, p) => sum + p.trees, 0);
                    if (totalForRegion === 0) return null;
                    const share = totalTrees === 0 ? 0 : (totalForRegion / totalTrees) * 100;
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-slate-700">
                            {language === "fr" ? label.fr : label.en}
                          </span>
                          <span className="text-slate-500">
                            {totalForRegion.toLocaleString()} ({share.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-secondary-500"
                            style={{ width: `${Math.max(8, share)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <p className="text-slate-500">
                      {t("No projects in this portfolio view.", "Aucun projet dans cette vue de portefeuille.")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Project list & comparative data */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <header className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  {t("Projects in this portfolio view", "Projets dans cette vue de portefeuille")}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {t(
                    "Ranked by number of trees to help compare relative contribution.",
                    "Classés par nombre d’arbres pour comparer la contribution relative."
                  )}
                </p>
              </div>
              <div className="text-[11px] text-slate-500">
                {totalProjects} {t("projects", "projets")}
              </div>
            </header>
            <div className="max-h-64 overflow-auto pr-1 text-[11px]">
              {filteredProjects.length === 0 ? (
                <p className="text-slate-500">
                  {t("No projects in this portfolio view.", "Aucun projet dans cette vue de portefeuille.")}
                </p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-[10px] text-slate-500 border-b border-slate-200">
                      <th className="py-1 pr-2 font-medium">{t("Project", "Projet")}</th>
                      <th className="py-1 pr-2 font-medium">{t("Location", "Localisation")}</th>
                      <th className="py-1 pr-2 font-medium text-right">{t("Trees", "Arbres")}</th>
                      <th className="py-1 pr-2 font-medium text-right">{t("Area (Ha)", "Superficie (Ha)")}</th>
                      <th className="py-1 pr-2 font-medium text-right">{t("Share of trees", "Part des arbres")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects
                      .slice()
                      .sort((a, b) => b.trees - a.trees)
                      .map(p => {
                        const share = totalTrees === 0 ? 0 : (p.trees / totalTrees) * 100;
                        return (
                          <tr key={p.id} className="border-b border-slate-100 last:border-0">
                            <td className="py-1 pr-2 text-slate-900">
                              {p.name}
                            </td>
                            <td className="py-1 pr-2 text-slate-600">
                              {p.municipality}, {p.province}
                            </td>
                            <td className="py-1 pr-2 text-right text-slate-900">
                              {p.trees.toLocaleString()}
                            </td>
                            <td className="py-1 pr-2 text-right text-slate-900">
                              {p.areaHa.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </td>
                            <td className="py-1 pr-2 text-right text-slate-900">
                              {share.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Stakeholder benefits "map" */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                {t("Stakeholders benefiting", "Parties prenantes bénéficiaires")}
              </h3>
              <p className="text-[11px] text-slate-700 mb-2">
                {t(
                  "Use this as a stakeholder map for the current portfolio filters, and add specific groups where relevant.",
                  "Utilisez cette vue comme carte des parties prenantes pour les filtres de portefeuille actuels et ajoutez des groupes spécifiques au besoin."
                )}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] mb-3">
                <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                  {t("Residents near project sites", "Résident·es près des sites de projet")}
                </span>
                <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                  {t("People walking, rolling & cycling", "Piétons, cyclistes et usagers en mobilité réduite")}
                </span>
                <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                  {t("Municipal operations & infrastructure teams", "Services municipaux et équipes d’infrastructure")}
                </span>
                <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-800">
                  {t("Equity-deserving communities (where targeted)", "Communautés en quête d’équité (lorsqu’elles sont ciblées)")}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-700">
                  {t(
                    "Add specific stakeholder groups for this portfolio view (optional)",
                    "Ajoutez des groupes de parties prenantes spécifiques pour cette vue de portefeuille (optionnel)"
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStakeholderName}
                    onChange={e => setNewStakeholderName(e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    placeholder={t("e.g. Local school board", "p. ex. Commission scolaire locale")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const value = newStakeholderName.trim();
                      if (!value) return;
                      setStakeholderNames(prev =>
                        prev.includes(value) ? prev : [...prev, value]
                      );
                      setNewStakeholderName("");
                    }}
                    className="rounded-md bg-primary-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-primary-700 transition"
                  >
                    {t("Add", "Ajouter")}
                  </button>
                </div>
                {stakeholderNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {stakeholderNames.map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          setStakeholderNames(prev =>
                            prev.filter(n => n !== name)
                          )
                        }
                        className="group rounded-full bg-primary-50 border border-primary-200 px-2 py-1 text-[11px] text-primary-800 hover:bg-primary-100"
                      >
                        {name}
                        <span className="ml-1 text-[10px] text-primary-500 group-hover:text-primary-800">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                {t("Compared to other land covers", "Comparaison avec d’autres usages du sol")}
              </h3>
              <p className="text-[11px] text-slate-700 mb-1">
                {t(
                  "Across this portfolio, tree canopy typically provides much higher carbon, cooling and stormwater benefits than turf or hard surfaces.",
                  "À l’échelle de ce portefeuille, la canopée arborée offre généralement des bénéfices beaucoup plus élevés en carbone, refroidissement et eaux pluviales que le gazon ou les surfaces imperméables."
                )}
              </p>
              <p className="text-[10px] text-slate-500">
                {t(
                  "Exact ratios depend on local conditions; the calculator view lets you explore a simple turf vs trees comparison at the project level.",
                  "Les rapports exacts dépendent des conditions locales; la vue du calculateur vous permet d’explorer une comparaison simplifiée gazon vs arbres à l’échelle du projet."
                )}
              </p>
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 space-y-5">
      {/* Summary Stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              {t(
                "National portfolio snapshot",
                "Aperçu national du portefeuille"
              )}
            </h2>
            <p className="text-xs text-slate-600">
              {t(
                "Indicative view of how funders and partners could see aggregated benefits across funded projects.",
                "Vue indicative de la façon dont les bailleurs de fonds et partenaires peuvent voir les bénéfices agrégés des projets financés."
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadPortfolioCsv}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition"
            >
              📊 {t("Export portfolio (CSV)", "Exporter le portefeuille (CSV)")}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50 transition"
            >
              🧾 {t("Export as PDF", "Exporter en PDF")}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Projects", "Projets")}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {totalProjects}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Trees", "Arbres")}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {totalTrees.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t(
                "Community impact barometer",
                "Baromètre d'impact communautaire"
              )}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {communityImpactIndicator}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {t(
                "Based on trees per project across current portfolio filters (demo thresholds: emerging <300, moderate 300–700, strong 700–1500, very strong >1500 trees/project).",
                "Basé sur le nombre d’arbres par projet pour les filtres actuels du portefeuille (seuils de démonstration : émergent <300, modéré 300–700, fort 700–1500, très fort >1500 arbres/projet)."
              )}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Stormwater (L/yr)", "Eaux pluviales (L/an)")}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {(totalStormwater / 1_000_000).toLocaleString(undefined, {
                maximumFractionDigits: 1
              })}{" "}
              M
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Equity / access (proxy)", "Équité / accès (proxy)")}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {(() => {
                const equityProjects = filteredProjects.filter(
                  p => p.size === "small" || p.region === "territories"
                ).length;
                return totalProjects === 0
                  ? 0
                  : `${equityProjects.toLocaleString()}`;
              })()}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {t(
                "Indicative count of projects in smaller communities or territories that may improve access for equity-deserving groups (demo rule).",
                "Nombre indicatif de projets dans des petites collectivités ou des territoires pouvant améliorer l’accès pour des groupes en quête d’équité (règle de démonstration)."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
          {t("Filter projects", "Filtrer les projets")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1.5">
              {t("Region", "Région")}
            </label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value as RegionKey | "all")}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              <option value="all">{t("All regions", "Toutes les régions")}</option>
              {Object.entries(regionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {language === "fr" ? label.fr : label.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1.5">
              {t("Typology", "Typologie")}
            </label>
            <select
              value={selectedTypology}
              onChange={e => setSelectedTypology(e.target.value as Typology | "all")}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              <option value="all">{t("All types", "Tous les types")}</option>
              {Object.entries(typologyMeta).map(([key, meta]) => (
                <option key={key} value={key}>
                  {language === "fr" ? meta.fr : meta.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1.5">
              {t("Community size", "Taille de la communauté")}
            </label>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value as typeof selectedSize)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              <option value="all">{t("All sizes", "Toutes les tailles")}</option>
              <option value="small">{t("Small", "Petite")}</option>
              <option value="medium">{t("Medium", "Moyenne")}</option>
              <option value="large">{t("Large", "Grande")}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Map and List Layout */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr] items-start">
        {/* Map */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md relative" style={{ height: "600px" }}>
          {/* Map Layer Controls */}
          <div className="absolute top-3 left-3 z-10 bg-white rounded-lg border border-slate-200 shadow-lg p-2">
            <div className="text-[10px] font-semibold text-slate-700 uppercase tracking-wide mb-2 px-1">
              {t("Map layers", "Couches de carte")}
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveMapLayer(activeMapLayer === "temperature" ? null : "temperature")}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition ${
                  activeMapLayer === "temperature"
                    ? "bg-primary-100 text-primary-900 border border-primary-300"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[9px] text-amber-900 font-semibold">
                    T°
                  </span>
                  {t("Mean temperature", "Température moyenne")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer(activeMapLayer === "canopy" ? null : "canopy")}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition ${
                  activeMapLayer === "canopy"
                    ? "bg-primary-100 text-primary-900 border border-primary-300"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200 text-[9px] text-emerald-900 font-semibold">
                    C
                  </span>
                  {t("Canopy cover", "Couverture de canopée")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer(activeMapLayer === "indigenous" ? null : "indigenous")}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium transition ${
                  activeMapLayer === "indigenous"
                    ? "bg-primary-100 text-primary-900 border border-primary-300"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-200 text-[9px] text-violet-900 font-semibold">
                    I
                  </span>
                  {t("Indigenous communities", "Communautés autochtones")}
                </span>
              </button>
            </div>
            {activeMapLayer && (
              <button
                type="button"
                onClick={() => setActiveMapLayer(null)}
                className="w-full mt-2 px-2 py-1 text-[10px] text-slate-600 hover:text-slate-900"
              >
                {t("Clear layer", "Effacer la couche")}
              </button>
            )}
          </div>
          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/light-v11"
          >
            {filteredProjects.map(p => (
              <Marker
                key={p.id}
                longitude={p.lng}
                latitude={p.lat}
                anchor="bottom"
                onClick={() => {
                  setSelectedProject(p);
                  setView("project");
                }}
              >
                <div className="cursor-pointer">
                  <div className="w-6 h-6 bg-primary-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🌲</span>
                  </div>
                </div>
              </Marker>
            ))}

            {selectedProject && (
              <Popup
                longitude={selectedProject.lng}
                latitude={selectedProject.lat}
                anchor="bottom"
                onClose={() => setSelectedProject(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="p-2 text-xs">
                  <div className="font-semibold text-slate-900 mb-1">
                    {selectedProject.name}
                  </div>
                  <div className="text-slate-600 mb-1">
                    {selectedProject.municipality}, {selectedProject.province}
                  </div>
                  <div className="text-slate-600">
                    🌲 {selectedProject.trees.toLocaleString()} {t("trees", "arbres")}
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>

        {/* Project List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-md h-[600px] flex flex-col">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
            {t("Project list", "Liste de projets")} ({totalProjects})
          </h3>
          <div className="space-y-2 flex-1 overflow-auto pr-2 custom-scrollbar text-xs">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                {t("No projects match the selected filters.", "Aucun projet ne correspond aux filtres sélectionnés.")}
              </div>
            ) : (
              filteredProjects.map(p => (
                <div
                  key={p.id}
                  className={`rounded-xl border px-3 py-2 shadow-sm hover:shadow-md transition cursor-pointer ${
                    selectedProject?.id === p.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                  onClick={() => {
                    setSelectedProject(p);
                    setView("project");
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-slate-900 truncate text-sm md:text-base">
                      {p.name}
                    </div>
                    <span className="rounded-full bg-primary-100 border border-primary-200 px-2 py-0.5 text-[10px] text-primary-700 font-medium flex-shrink-0">
                      {p.year}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-600 flex justify-between">
                    <span>
                      {p.municipality}, {p.province}
                    </span>
                    <span className="capitalize text-slate-600 font-medium">
                      {p.size === "small"
                        ? t("Small", "Petite")
                        : p.size === "medium"
                        ? t("Medium", "Moyenne")
                        : t("Large", "Grande")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-700">
                    <span>
                      🌲 {p.trees.toLocaleString()}{" "}
                      {t("trees", "arbres")}
                    </span>
                    <span>
                      CO₂: {p.carbonTonnes.toLocaleString()} t /{" "}
                      {t("yr", "an")}
                    </span>
                  </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span>{typologyMeta[p.typology].icon}</span>
                  <span>
                    {language === "fr" ? typologyMeta[p.typology].fr : typologyMeta[p.typology].en}
                  </span>
                </span>
                    <span>•</span>
                    <span>
                      {language === "fr" ? stageLabels[p.stage].fr : stageLabels[p.stage].en}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setView("portfolioBenefits")}
              className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-xs font-medium text-white shadow-md shadow-primary-500/40 hover:shadow-lg hover:shadow-primary-500/60 transition"
            >
              {t(
                "View portfolio benefit snapshot",
                "Voir l’aperçu des bénéfices du portefeuille"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Credits / methodology */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
          {t("Data & methodology (demo)", "Données et méthodologie (démo)")}
        </h3>
        <p className="text-[11px] text-slate-700">
          {t(
            "Portfolio metrics are based on mocked projects and simplified assumptions inspired by GMF’s Growing Canada’s Community Canopies resources. They illustrate how FCM could aggregate climate, water, health and equity benefits across projects.",
            "Les indicateurs de portefeuille reposent sur des projets fictifs et des hypothèses simplifiées inspirées des ressources de l’initiative « Cultiver les canopées communautaires du Canada » du FMV. Ils illustrent comment la FCM pourrait agréger les bénéfices climatiques, hydriques, sanitaires et d’équité à l’échelle des projets."
          )}
        </p>
        <p className="text-[11px] text-slate-600">
          {t(
            "For actual funding applications and reporting, please refer to official guidance and tools from the Green Municipal Fund.",
            "Pour les demandes de financement et la reddition de comptes officielles, veuillez vous référer aux outils et lignes directrices du Fonds municipal vert."
          )}
        </p>
      </section>
    </main>
  );
}

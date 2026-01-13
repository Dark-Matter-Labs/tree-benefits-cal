"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
    carbonTonnes: 32,
    stormwaterLitres: 4800000,
    lat: 53.5461,
    lng: -113.4938
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

const typologyLabels: Record<Typology, { en: string; fr: string }> = {
  "urban-forest": { en: "Urban forest", fr: "Forêt urbaine" },
  "riparian": { en: "Riparian buffer", fr: "Zone tampon riveraine" },
  "street-trees": { en: "Street trees", fr: "Arbres de rue" },
  "park-restoration": { en: "Park restoration", fr: "Restauration de parc" },
  "green-infrastructure": { en: "Green infrastructure", fr: "Infrastructure verte" }
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
  const [selectedStage, setSelectedStage] = useState<Stage | "all">("all");
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null);
  const [activeMapLayer, setActiveMapLayer] = useState<"temperature" | "canopy" | "indigenous" | null>(null);
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -95,
    latitude: 55,
    zoom: 3.5
  });

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => {
      if (selectedRegion !== "all" && p.region !== selectedRegion) return false;
      if (selectedTypology !== "all" && p.typology !== selectedTypology) return false;
      if (selectedSize !== "all" && p.size !== selectedSize) return false;
      if (selectedStage !== "all" && p.stage !== selectedStage) return false;
      return true;
    });
  }, [selectedRegion, selectedTypology, selectedSize, selectedStage]);

  const totalProjects = filteredProjects.length;
  const totalTrees = filteredProjects.reduce((sum, p) => sum + p.trees, 0);
  const totalCarbon = filteredProjects.reduce((sum, p) => sum + p.carbonTonnes, 0);
  const totalStormwater = filteredProjects.reduce(
    (sum, p) => sum + p.stormwaterLitres,
    0
  );

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

  // Project detail mock page
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
              <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700 font-medium">
                {language === "fr"
                  ? typologyLabels[selectedProject.typology].fr
                  : typologyLabels[selectedProject.typology].en}
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
                {t("Trees & shrubs", "Arbres et arbustes")}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {selectedProject.trees.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t(
                  "Includes woody shrubs where reported",
                  "Comprend les arbustes ligneux lorsque déclarés"
                )}
              </p>
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
                {t("Project story (demo)", "Récit du projet (démo)")}
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
                {t("Mock layout guidance", "Gabarit fictif")}
              </h3>
              <p className="text-[11px] text-slate-600">
                {t(
                  "In a full build, this page could be auto-populated from the application form, with editable narrative blocks and exportable PDFs.",
                  "Dans une version complète, cette page pourrait être alimentée automatiquement à partir du formulaire de demande, avec des blocs narratifs modifiables et des PDF exportables."
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
          <header className="space-y-1">
            <h1 className="text-base md:text-lg font-semibold text-slate-900">
              {t("Portfolio benefits (demo)", "Bénéfices du portefeuille (démo)")}
            </h1>
            <p className="text-xs text-slate-600">
              {t(
                "Using the current filters, this mock-up shows how FCM could see aggregated benefits by group.",
                "Avec les filtres actuels, cette maquette montre comment le FCM pourrait voir les bénéfices agrégés par groupe."
              )}
            </p>
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              {t("Mock layout guidance", "Gabarit fictif")}
            </h3>
            <p className="text-[11px] text-slate-600">
              {t(
                "In a production version, this page could drive funder reports, with export to PowerBI or PDF and drill-down into regional or typology-based views.",
                "Dans une version de production, cette page pourrait alimenter les rapports aux bailleurs de fonds, avec export vers PowerBI ou PDF et exploration par région ou typologie."
              )}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 space-y-5">
      {/* Summary Stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-md">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          {t(
            "National portfolio snapshot (demo)",
            "Aperçu national du portefeuille (démo)"
          )}
        </h2>
        <p className="text-xs text-slate-600 mb-4">
          {t(
            "Mock view of how FCM could see aggregated impacts across funded projects.",
            "Vue fictive de la façon dont le FCM pourrait voir les impacts agrégés des projets financés."
          )}
        </p>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Projects", "Projets")}
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900">
              {totalProjects}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Trees & shrubs", "Arbres et arbustes")}
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900">
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
            <div className="mt-1 text-lg font-bold text-slate-900">
              {communityImpactIndicator}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {t(
                "Based on trees per project across current portfolio filters.",
                "Basé sur le nombre d’arbres par projet pour les filtres actuels du portefeuille."
              )}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-medium">
              {t("Stormwater (L/yr)", "Eaux pluviales (L/an)")}
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900">
              {(totalStormwater / 1_000_000).toLocaleString(undefined, {
                maximumFractionDigits: 1
              })}{" "}
              M
            </div>
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
              {Object.entries(typologyLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {language === "fr" ? label.fr : label.en}
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

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1.5">
              {t("Stage", "Étape")}
            </label>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value as Stage | "all")}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              <option value="all">{t("All stages", "Toutes les étapes")}</option>
              {Object.entries(stageLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {language === "fr" ? label.fr : label.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map and List Layout */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr] items-start">
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
                🌡️ {t("Mean temperature", "Température moyenne")}
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
                🌳 {t("Canopy cover", "Couverture de canopée")}
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
                🏘️ {t("Indigenous communities", "Communautés autochtones")}
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-md">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
            {t("Project list", "Liste de projets")} ({totalProjects})
          </h3>
          <div className="space-y-2 max-h-[540px] overflow-auto pr-2 custom-scrollbar text-xs">
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
                    <div className="font-medium text-slate-900 truncate">
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
                    <span>
                      {language === "fr" ? typologyLabels[p.typology].fr : typologyLabels[p.typology].en}
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
                "Calculate portfolio benefits (demo)",
                "Calculer les bénéfices du portefeuille (démo)"
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

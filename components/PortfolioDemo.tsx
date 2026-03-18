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
  },
  // ── Ontario (need ~32 more to reach 36 total) ──
  {
    id: "p33",
    name: "Brampton Heritage Tree Walk",
    municipality: "Brampton",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 2800,
    areaHa: 28,
    carbonTonnes: 56,
    stormwaterLitres: 8400000,
    lat: 43.7315,
    lng: -79.7624
  },
  {
    id: "p34",
    name: "Mississauga Lakeshore Canopy",
    municipality: "Mississauga",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 3200,
    areaHa: 35,
    carbonTonnes: 64,
    stormwaterLitres: 9600000,
    lat: 43.5890,
    lng: -79.6441
  },
  {
    id: "p35",
    name: "Barrie Waterfront Green Belt",
    municipality: "Barrie",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 1900,
    areaHa: 24,
    carbonTonnes: 38,
    stormwaterLitres: 5700000,
    lat: 44.3894,
    lng: -79.6903
  },
  {
    id: "p36",
    name: "Guelph Pollinator Corridor",
    municipality: "Guelph",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 1450,
    areaHa: 18,
    carbonTonnes: 29,
    stormwaterLitres: 4350000,
    lat: 43.5448,
    lng: -80.2482
  },
  {
    id: "p37",
    name: "Markham Civic Centre Forest",
    municipality: "Markham",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "urban-forest",
    stage: "completed",
    year: 2023,
    trees: 2100,
    areaHa: 22,
    carbonTonnes: 42,
    stormwaterLitres: 6300000,
    lat: 43.8561,
    lng: -79.3370
  },
  {
    id: "p38",
    name: "Windsor Riverfront Planting",
    municipality: "Windsor",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "riparian",
    stage: "planting",
    year: 2025,
    trees: 1750,
    areaHa: 20,
    carbonTonnes: 35,
    stormwaterLitres: 5250000,
    lat: 42.3149,
    lng: -83.0364
  },
  {
    id: "p39",
    name: "Sudbury Regreening Initiative",
    municipality: "Sudbury",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "urban-forest",
    stage: "monitoring",
    year: 2023,
    trees: 3500,
    areaHa: 45,
    carbonTonnes: 70,
    stormwaterLitres: 10500000,
    lat: 46.4917,
    lng: -80.9930
  },
  {
    id: "p40",
    name: "Thunder Bay Storm Buffer",
    municipality: "Thunder Bay",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 920,
    areaHa: 14,
    carbonTonnes: 18,
    stormwaterLitres: 2760000,
    lat: 48.3809,
    lng: -89.2477
  },
  {
    id: "p41",
    name: "Oshawa Creek Restoration",
    municipality: "Oshawa",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "riparian",
    stage: "planting",
    year: 2024,
    trees: 1350,
    areaHa: 19,
    carbonTonnes: 27,
    stormwaterLitres: 4050000,
    lat: 43.8971,
    lng: -78.8658
  },
  {
    id: "p42",
    name: "Burlington Lakeside Canopy",
    municipality: "Burlington",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 1680,
    areaHa: 16,
    carbonTonnes: 34,
    stormwaterLitres: 5040000,
    lat: 43.3255,
    lng: -79.7990
  },
  {
    id: "p43",
    name: "St. Catharines Urban Shade",
    municipality: "St. Catharines",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 780,
    areaHa: 10,
    carbonTonnes: 16,
    stormwaterLitres: 2340000,
    lat: 43.1594,
    lng: -79.2469
  },
  {
    id: "p44",
    name: "Peterborough Flood Resilience",
    municipality: "Peterborough",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 640,
    areaHa: 15,
    carbonTonnes: 13,
    stormwaterLitres: 1920000,
    lat: 44.3091,
    lng: -78.3197
  },
  {
    id: "p45",
    name: "Niagara Falls Park Renewal",
    municipality: "Niagara Falls",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "park-restoration",
    stage: "completed",
    year: 2023,
    trees: 850,
    areaHa: 12,
    carbonTonnes: 17,
    stormwaterLitres: 2550000,
    lat: 43.0896,
    lng: -79.0849
  },
  {
    id: "p46",
    name: "Cambridge Mill Corridor",
    municipality: "Cambridge",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 560,
    areaHa: 8,
    carbonTonnes: 11,
    stormwaterLitres: 1680000,
    lat: 43.3616,
    lng: -80.3144
  },
  {
    id: "p47",
    name: "Brantford Grand River Buffer",
    municipality: "Brantford",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "riparian",
    stage: "planting",
    year: 2025,
    trees: 710,
    areaHa: 16,
    carbonTonnes: 14,
    stormwaterLitres: 2130000,
    lat: 43.1394,
    lng: -80.2644
  },
  {
    id: "p48",
    name: "Whitby Trails Canopy",
    municipality: "Whitby",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "park-restoration",
    stage: "approved",
    year: 2024,
    trees: 1200,
    areaHa: 14,
    carbonTonnes: 24,
    stormwaterLitres: 3600000,
    lat: 43.8975,
    lng: -78.9429
  },
  {
    id: "p49",
    name: "Vaughan Urban Forest Expansion",
    municipality: "Vaughan",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 2400,
    areaHa: 26,
    carbonTonnes: 48,
    stormwaterLitres: 7200000,
    lat: 43.8361,
    lng: -79.4984
  },
  {
    id: "p50",
    name: "Richmond Hill Green Streets",
    municipality: "Richmond Hill",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 1580,
    areaHa: 15,
    carbonTonnes: 32,
    stormwaterLitres: 4740000,
    lat: 43.8828,
    lng: -79.4403
  },
  {
    id: "p51",
    name: "Sault Ste. Marie Waterfront Greening",
    municipality: "Sault Ste. Marie",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "park-restoration",
    stage: "planning",
    year: 2026,
    trees: 480,
    areaHa: 10,
    carbonTonnes: 10,
    stormwaterLitres: 1440000,
    lat: 46.5219,
    lng: -84.3461
  },
  {
    id: "p52",
    name: "North Bay Climate Forest",
    municipality: "North Bay",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "urban-forest",
    stage: "approved",
    year: 2025,
    trees: 530,
    areaHa: 12,
    carbonTonnes: 11,
    stormwaterLitres: 1590000,
    lat: 46.3091,
    lng: -79.4608
  },
  {
    id: "p53",
    name: "Ajax Stormwater Canopy",
    municipality: "Ajax",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "green-infrastructure",
    stage: "planting",
    year: 2025,
    trees: 690,
    areaHa: 9,
    carbonTonnes: 14,
    stormwaterLitres: 2070000,
    lat: 43.8509,
    lng: -79.0204
  },
  {
    id: "p54",
    name: "Oakville Heritage Grove",
    municipality: "Oakville",
    province: "ON",
    region: "ontario",
    size: "large",
    typology: "park-restoration",
    stage: "completed",
    year: 2024,
    trees: 1100,
    areaHa: 13,
    carbonTonnes: 22,
    stormwaterLitres: 3300000,
    lat: 43.4675,
    lng: -79.6877
  },
  {
    id: "p55",
    name: "Kingston Waterfront Shade Walk",
    municipality: "Kingston",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 620,
    areaHa: 8,
    carbonTonnes: 12,
    stormwaterLitres: 1860000,
    lat: 44.2312,
    lng: -76.4860
  },
  {
    id: "p56",
    name: "Chatham-Kent Agricultural Buffer",
    municipality: "Chatham-Kent",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "riparian",
    stage: "planning",
    year: 2026,
    trees: 450,
    areaHa: 18,
    carbonTonnes: 9,
    stormwaterLitres: 1350000,
    lat: 42.4048,
    lng: -82.1910
  },
  {
    id: "p57",
    name: "Newmarket Civic Canopy",
    municipality: "Newmarket",
    province: "ON",
    region: "ontario",
    size: "medium",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 340,
    areaHa: 5,
    carbonTonnes: 7,
    stormwaterLitres: 1020000,
    lat: 44.0592,
    lng: -79.4613
  },
  {
    id: "p58",
    name: "Halton Hills Green Network",
    municipality: "Halton Hills",
    province: "ON",
    region: "ontario",
    size: "small",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 280,
    areaHa: 7,
    carbonTonnes: 6,
    stormwaterLitres: 840000,
    lat: 43.6310,
    lng: -79.9506
  },
  {
    id: "p59",
    name: "Cobourg Lakeshore Restoration",
    municipality: "Cobourg",
    province: "ON",
    region: "ontario",
    size: "small",
    typology: "riparian",
    stage: "planning",
    year: 2026,
    trees: 210,
    areaHa: 6,
    carbonTonnes: 4,
    stormwaterLitres: 630000,
    lat: 43.9593,
    lng: -78.1677
  },
  {
    id: "p60",
    name: "Orangeville Community Forest",
    municipality: "Orangeville",
    province: "ON",
    region: "ontario",
    size: "small",
    typology: "urban-forest",
    stage: "approved",
    year: 2025,
    trees: 190,
    areaHa: 5,
    carbonTonnes: 4,
    stormwaterLitres: 570000,
    lat: 43.9200,
    lng: -80.0943
  },
  // ── Prairies (need ~17 more to reach 23 total) ──
  {
    id: "p61",
    name: "Saskatoon Meewasin Trail Extension",
    municipality: "Saskatoon",
    province: "SK",
    region: "prairies",
    size: "large",
    typology: "riparian",
    stage: "planting",
    year: 2025,
    trees: 2200,
    areaHa: 30,
    carbonTonnes: 44,
    stormwaterLitres: 6600000,
    lat: 52.1332,
    lng: -106.6700
  },
  {
    id: "p62",
    name: "Medicine Hat Shade Programme",
    municipality: "Medicine Hat",
    province: "AB",
    region: "prairies",
    size: "medium",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 480,
    areaHa: 7,
    carbonTonnes: 10,
    stormwaterLitres: 1440000,
    lat: 50.0405,
    lng: -110.6764
  },
  {
    id: "p63",
    name: "Moose Jaw Creek Planting",
    municipality: "Moose Jaw",
    province: "SK",
    region: "prairies",
    size: "small",
    typology: "riparian",
    stage: "planting",
    year: 2024,
    trees: 310,
    areaHa: 9,
    carbonTonnes: 6,
    stormwaterLitres: 930000,
    lat: 50.3934,
    lng: -105.5519
  },
  {
    id: "p64",
    name: "Brandon Urban Forest",
    municipality: "Brandon",
    province: "MB",
    region: "prairies",
    size: "small",
    typology: "urban-forest",
    stage: "approved",
    year: 2025,
    trees: 260,
    areaHa: 6,
    carbonTonnes: 5,
    stormwaterLitres: 780000,
    lat: 49.8440,
    lng: -99.9539
  },
  {
    id: "p65",
    name: "Calgary Nose Hill Restoration",
    municipality: "Calgary",
    province: "AB",
    region: "prairies",
    size: "large",
    typology: "park-restoration",
    stage: "monitoring",
    year: 2024,
    trees: 3100,
    areaHa: 40,
    carbonTonnes: 62,
    stormwaterLitres: 9300000,
    lat: 51.1097,
    lng: -114.1035
  },
  {
    id: "p66",
    name: "Prince Albert Northern Green Belt",
    municipality: "Prince Albert",
    province: "SK",
    region: "prairies",
    size: "small",
    typology: "urban-forest",
    stage: "planning",
    year: 2026,
    trees: 180,
    areaHa: 5,
    carbonTonnes: 4,
    stormwaterLitres: 540000,
    lat: 53.2034,
    lng: -105.7531
  },
  {
    id: "p67",
    name: "Airdrie Street Canopy Programme",
    municipality: "Airdrie",
    province: "AB",
    region: "prairies",
    size: "medium",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 520,
    areaHa: 6,
    carbonTonnes: 10,
    stormwaterLitres: 1560000,
    lat: 51.2917,
    lng: -114.0144
  },
  {
    id: "p68",
    name: "Edmonton Meadows Greenway",
    municipality: "Edmonton",
    province: "AB",
    region: "prairies",
    size: "large",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 2600,
    areaHa: 32,
    carbonTonnes: 52,
    stormwaterLitres: 7800000,
    lat: 53.5461,
    lng: -113.4938
  },
  {
    id: "p69",
    name: "Winnipeg Elm Replacement Programme",
    municipality: "Winnipeg",
    province: "MB",
    region: "prairies",
    size: "large",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 1800,
    areaHa: 18,
    carbonTonnes: 36,
    stormwaterLitres: 5400000,
    lat: 49.8951,
    lng: -97.1384
  },
  {
    id: "p70",
    name: "Swift Current Climate Shelter Belt",
    municipality: "Swift Current",
    province: "SK",
    region: "prairies",
    size: "small",
    typology: "green-infrastructure",
    stage: "approved",
    year: 2025,
    trees: 150,
    areaHa: 4,
    carbonTonnes: 3,
    stormwaterLitres: 450000,
    lat: 50.2881,
    lng: -107.7937
  },
  {
    id: "p71",
    name: "Red Deer River Valley Greening",
    municipality: "Red Deer",
    province: "AB",
    region: "prairies",
    size: "medium",
    typology: "riparian",
    stage: "monitoring",
    year: 2024,
    trees: 680,
    areaHa: 16,
    carbonTonnes: 14,
    stormwaterLitres: 2040000,
    lat: 52.2690,
    lng: -113.8116
  },
  {
    id: "p72",
    name: "Steinbach Community Planting",
    municipality: "Steinbach",
    province: "MB",
    region: "prairies",
    size: "small",
    typology: "urban-forest",
    stage: "planning",
    year: 2026,
    trees: 130,
    areaHa: 3,
    carbonTonnes: 3,
    stormwaterLitres: 390000,
    lat: 49.5258,
    lng: -96.6839
  },
  {
    id: "p73",
    name: "Lloydminster Border Town Forest",
    municipality: "Lloydminster",
    province: "AB",
    region: "prairies",
    size: "small",
    typology: "park-restoration",
    stage: "approved",
    year: 2025,
    trees: 220,
    areaHa: 5,
    carbonTonnes: 4,
    stormwaterLitres: 660000,
    lat: 53.2783,
    lng: -110.0050
  },
  {
    id: "p74",
    name: "Yorkton Green Corridor",
    municipality: "Yorkton",
    province: "SK",
    region: "prairies",
    size: "small",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 170,
    areaHa: 3,
    carbonTonnes: 3,
    stormwaterLitres: 510000,
    lat: 51.2139,
    lng: -102.4628
  },
  {
    id: "p75",
    name: "Okotoks River Shade Walk",
    municipality: "Okotoks",
    province: "AB",
    region: "prairies",
    size: "small",
    typology: "riparian",
    stage: "approved",
    year: 2025,
    trees: 200,
    areaHa: 6,
    carbonTonnes: 4,
    stormwaterLitres: 600000,
    lat: 50.7266,
    lng: -113.9749
  },
  // ── British Columbia (need ~12 more to reach 16 total) ──
  {
    id: "p76",
    name: "Surrey Green Timbers Expansion",
    municipality: "Surrey",
    province: "BC",
    region: "bc",
    size: "large",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 4200,
    areaHa: 45,
    carbonTonnes: 84,
    stormwaterLitres: 12600000,
    lat: 49.1913,
    lng: -122.8490
  },
  {
    id: "p77",
    name: "Burnaby Stoney Creek Riparian",
    municipality: "Burnaby",
    province: "BC",
    region: "bc",
    size: "large",
    typology: "riparian",
    stage: "approved",
    year: 2025,
    trees: 1600,
    areaHa: 22,
    carbonTonnes: 32,
    stormwaterLitres: 4800000,
    lat: 49.2488,
    lng: -122.9805
  },
  {
    id: "p78",
    name: "Kamloops Heat Resilience Forest",
    municipality: "Kamloops",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "urban-forest",
    stage: "monitoring",
    year: 2024,
    trees: 950,
    areaHa: 14,
    carbonTonnes: 19,
    stormwaterLitres: 2850000,
    lat: 50.6745,
    lng: -120.3273
  },
  {
    id: "p79",
    name: "Prince George Street Trees",
    municipality: "Prince George",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "street-trees",
    stage: "planting",
    year: 2025,
    trees: 620,
    areaHa: 8,
    carbonTonnes: 12,
    stormwaterLitres: 1860000,
    lat: 53.9171,
    lng: -122.7497
  },
  {
    id: "p80",
    name: "Coquitlam Watershed Planting",
    municipality: "Coquitlam",
    province: "BC",
    region: "bc",
    size: "large",
    typology: "riparian",
    stage: "approved",
    year: 2025,
    trees: 1400,
    areaHa: 20,
    carbonTonnes: 28,
    stormwaterLitres: 4200000,
    lat: 49.2838,
    lng: -122.7932
  },
  {
    id: "p81",
    name: "Langley Farm Edge Canopy",
    municipality: "Langley",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "green-infrastructure",
    stage: "planting",
    year: 2025,
    trees: 740,
    areaHa: 12,
    carbonTonnes: 15,
    stormwaterLitres: 2220000,
    lat: 49.1044,
    lng: -122.6609
  },
  {
    id: "p82",
    name: "Abbotsford Flood Plain Resilience",
    municipality: "Abbotsford",
    province: "BC",
    region: "bc",
    size: "large",
    typology: "riparian",
    stage: "monitoring",
    year: 2023,
    trees: 2800,
    areaHa: 38,
    carbonTonnes: 56,
    stormwaterLitres: 8400000,
    lat: 49.0580,
    lng: -122.3296
  },
  {
    id: "p83",
    name: "Chilliwack River Greenway",
    municipality: "Chilliwack",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "park-restoration",
    stage: "approved",
    year: 2025,
    trees: 580,
    areaHa: 10,
    carbonTonnes: 12,
    stormwaterLitres: 1740000,
    lat: 49.1579,
    lng: -121.9514
  },
  {
    id: "p84",
    name: "Courtenay Community Forest",
    municipality: "Courtenay",
    province: "BC",
    region: "bc",
    size: "small",
    typology: "urban-forest",
    stage: "planting",
    year: 2025,
    trees: 350,
    areaHa: 8,
    carbonTonnes: 7,
    stormwaterLitres: 1050000,
    lat: 49.6838,
    lng: -124.9948
  },
  {
    id: "p85",
    name: "Nelson Kootenay Shade Walk",
    municipality: "Nelson",
    province: "BC",
    region: "bc",
    size: "small",
    typology: "street-trees",
    stage: "approved",
    year: 2025,
    trees: 160,
    areaHa: 3,
    carbonTonnes: 3,
    stormwaterLitres: 480000,
    lat: 49.4928,
    lng: -117.2948
  },
  {
    id: "p86",
    name: "Squamish Wildfire Buffer Zone",
    municipality: "Squamish",
    province: "BC",
    region: "bc",
    size: "small",
    typology: "green-infrastructure",
    stage: "planning",
    year: 2026,
    trees: 420,
    areaHa: 11,
    carbonTonnes: 8,
    stormwaterLitres: 1260000,
    lat: 49.7016,
    lng: -123.1558
  },
  // ── Atlantic (need ~1 more to reach 7 from existing 6+1=7, already at 7) ──
  // Already have p1 Halifax, p5 Charlottetown, p11 St. John's, p13 Moncton,
  // p18 Saint John, p24 Fredericton, p30 Dartmouth = 7. Good.

  // ── Quebec (need ~0 more, already at 5) ──
  // p2 Montreal, p14 Quebec City, p19 Gatineau, p25 Sherbrooke, p31 Trois-Rivières = 5. Good.

  // ── Territories — keep existing 3 ──
  // p9 Whitehorse, p22 Yellowknife, p26 Iqaluit = 3.

  // ── Fill to 88 with remaining distribution ──
  {
    id: "p87",
    name: "Maple Ridge Trail Canopy",
    municipality: "Maple Ridge",
    province: "BC",
    region: "bc",
    size: "medium",
    typology: "park-restoration",
    stage: "planting",
    year: 2025,
    trees: 510,
    areaHa: 9,
    carbonTonnes: 10,
    stormwaterLitres: 1530000,
    lat: 49.2193,
    lng: -122.5984
  },
  {
    id: "p88",
    name: "Calgary Bow River Canopy",
    municipality: "Calgary",
    province: "AB",
    region: "prairies",
    size: "large",
    typology: "riparian",
    stage: "approved",
    year: 2025,
    trees: 1950,
    areaHa: 25,
    carbonTonnes: 39,
    stormwaterLitres: 5850000,
    lat: 51.0276,
    lng: -114.0490
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
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "approved" | "pending">("all");
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
  const [expandedBenefitRows, setExpandedBenefitRows] = useState<Set<string>>(new Set());

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => {
      if (selectedRegion !== "all" && p.region !== selectedRegion) return false;
      if (selectedTypology !== "all" && p.typology !== selectedTypology) return false;
      if (selectedSize !== "all" && p.size !== selectedSize) return false;
      if (selectedYear !== "all" && p.year !== selectedYear) return false;
      if (selectedStatus !== "all") {
        if (selectedStatus === "approved" && p.stage === "planning") return false;
        if (selectedStatus === "pending" && p.stage !== "planning") return false;
      }
      return true;
    });
  }, [selectedRegion, selectedTypology, selectedSize, selectedYear, selectedStatus]);

  const totalProjects = filteredProjects.length;
  const totalTrees = filteredProjects.reduce((sum, p) => sum + p.trees, 0);
  const totalCarbon = filteredProjects.reduce((sum, p) => sum + p.carbonTonnes, 0);
  const totalStormwater = filteredProjects.reduce(
    (sum, p) => sum + p.stormwaterLitres,
    0
  );
  const totalAreaHa = filteredProjects.reduce((sum, p) => sum + (p.areaHa || 0), 0);

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
    const projectResults = calculateBenefits({
      region: selectedProject.region,
      municipalitySize: selectedProject.size,
      populationServed: 10000,
      householdsServed: 4000,
      numberOfTrees: selectedProject.trees,
      projectAreaHa: selectedProject.areaHa,
      year: selectedProject.year
    });

    const totalAnnualValue =
      projectResults.total.carbonValue +
      projectResults.total.stormwaterValue +
      projectResults.total.healthSavings +
      projectResults.total.propertyValueIncrease;

    const benefitChainRows = [
      {
        key: "carbon",
        badge: t("Climate / carbon", "Climat / carbone"),
        badgeBg: "#E1F5EE",
        badgeText: "#085041",
        barColor: "#1D9E75",
        econBg: "#E1F5EE",
        fn: t("Carbon sequestration", "Séquestration du carbone"),
        fnDetail: `${projectResults.total.carbonTonnes.toFixed(1)} tCO₂e ${t("removed per year", "retirés par an")}`,
        benefit: t("Reduced atmospheric carbon", "Réduction du carbone atmosphérique"),
        benefitDesc: t("Canadian social cost of carbon", "Coût social canadien du carbone"),
        econLabel: t("Avoided carbon cost", "Coût carbone évité"),
        value: projectResults.total.carbonValue,
        barW: 35,
      },
      {
        key: "water",
        badge: t("Water & flood", "Eau et inondations"),
        badgeBg: "#E6F1FB",
        badgeText: "#0C447C",
        barColor: "#378ADD",
        econBg: "#E6F1FB",
        fn: t("Rainfall interception", "Interception des précipitations"),
        fnDetail: `${(projectResults.total.stormwaterLitres / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M L/yr ${t("intercepted", "interceptés")}`,
        benefit: t("Reduced flood risk", "Risque d'inondation réduit"),
        benefitDesc: t("Avoided grey infrastructure cost", "Coût d'infrastructure grise évité"),
        econLabel: t("Avoided infrastructure cost", "Coût d'infrastructure évité"),
        value: projectResults.total.stormwaterValue,
        barW: 40,
      },
      {
        key: "health",
        badge: t("Health & community", "Santé et communauté"),
        badgeBg: "#EEEDFE",
        badgeText: "#3C3489",
        barColor: "#7F77DD",
        econBg: "#EEEDFE",
        fn: t("Heat reduction & air filtering", "Réduction de la chaleur et filtration de l'air"),
        fnDetail: `−${projectResults.total.heatIslandReductionDegC.toFixed(2)}°C ${t("cooling", "refroidissement")}`,
        benefit: t("Reduced illness & improved well-being", "Réduction des maladies et amélioration du bien-être"),
        benefitDesc: t("Damage costs proxy", "Coûts de dommages (proxy)"),
        econLabel: t("Avoided health costs", "Coûts de santé évités"),
        value: projectResults.total.healthSavings,
        barW: 55,
      },
      {
        key: "property",
        badge: t("Property & economic", "Foncière et économique"),
        badgeBg: "#E1F5EE",
        badgeText: "#085041",
        barColor: "#1D9E75",
        econBg: "#E1F5EE",
        fn: t("Canopy amenity & shade", "Aménité du couvert et ombrage"),
        fnDetail: `${selectedProject.trees} ${t("trees", "arbres")}, ${selectedProject.areaHa} ha`,
        benefit: t("Increased property values", "Hausse de la valeur foncière"),
        benefitDesc: t("Hedonic pricing", "Prix hédoniques"),
        econLabel: t("Property & economic uplift", "Hausse foncière et économique"),
        value: projectResults.total.propertyValueIncrease,
        barW: 70,
      },
    ];

    const summaryRows = benefitChainRows.map((row) => ({
      ...row,
      share: totalAnnualValue > 0 ? Math.round((row.value / totalAnnualValue) * 100) : 0,
    }));

    return (
      <main className="mx-auto max-w-[1000px] px-4 py-5 space-y-4">
        {/* 1. Page header — back + export */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView("portfolio")}
            className="text-xs font-medium hover:underline"
            style={{ color: "#1D9E75" }}
          >
            {t("← Back to portfolio overview", "← Retour à la vue d'ensemble du portefeuille")}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs px-4 py-1.5 rounded-full border font-medium"
            style={{ borderColor: "#1D9E75", color: "#1D9E75", background: "transparent" }}
          >
            {t("Download project PDF", "Télécharger le PDF du projet")}
          </button>
        </div>

        {/* 2. Project header card */}
        <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-medium text-slate-900">
                {selectedProject.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {selectedProject.municipality}, {selectedProject.province} · {selectedProject.year}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className="text-xs font-medium rounded-full"
                style={{ padding: "5px 14px", background: "#E1F5EE", color: "#085041", border: "0.5px solid #9FE1CB" }}
              >
                {language === "fr"
                  ? regionLabels[selectedProject.region].fr
                  : regionLabels[selectedProject.region].en}
              </span>
              <span
                className="text-xs font-medium rounded-full flex items-center gap-1"
                style={{ padding: "5px 14px", background: "var(--color-background-secondary, #f5f5f3)", color: "var(--color-text-secondary, #555)", border: "0.5px solid rgba(0,0,0,0.15)" }}
              >
                <span>{typologyMeta[selectedProject.typology].icon}</span>
                <span>
                  {language === "fr"
                    ? typologyMeta[selectedProject.typology].fr
                    : typologyMeta[selectedProject.typology].en}
                </span>
              </span>
              <span
                className="text-xs font-medium rounded-full"
                style={{ padding: "5px 14px", background: "var(--color-background-secondary, #f5f5f3)", color: "var(--color-text-secondary, #555)", border: "0.5px solid rgba(0,0,0,0.15)" }}
              >
                {language === "fr"
                  ? stageLabels[selectedProject.stage].fr
                  : stageLabels[selectedProject.stage].en}
              </span>
              <span
                className="text-xs font-medium rounded-full capitalize"
                style={{ padding: "5px 14px", background: "var(--color-background-secondary, #f5f5f3)", color: "var(--color-text-secondary, #555)", border: "0.5px solid rgba(0,0,0,0.15)" }}
              >
                {selectedProject.size === "small"
                  ? t("Small community", "Petite collectivité")
                  : selectedProject.size === "medium"
                  ? t("Medium community", "Collectivité moyenne")
                  : t("Large community", "Grande collectivité")}
              </span>
            </div>
          </div>

          {/* 3. Project summary KPI strip */}
          <div className="mt-4">
            <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-2">
              {t("Project summary", "Résumé du projet")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg p-3" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{t("Trees planted", "Arbres plantés")}</p>
                <p className="text-xl font-medium text-slate-900 mt-1">{selectedProject.trees.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {t(
                    `street trees along ${selectedProject.areaHa} ha`,
                    `arbres de rue sur ${selectedProject.areaHa} ha`
                  )}
                </p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{t("Carbon (tCO₂e/yr)", "Carbone (tCO₂e/an)")}</p>
                <p className="text-xl font-medium mt-1" style={{ color: "#0F6E56" }}>
                  {projectResults.total.carbonTonnes.toFixed(1)} t
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t("sequestered at maturity", "séquestré à maturité")}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{t("Stormwater (L/yr)", "Eaux pluviales (L/an)")}</p>
                <p className="text-xl font-medium text-slate-900 mt-1">
                  {(projectResults.total.stormwaterLitres / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M L
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t("intercepted per year", "interceptés par an")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Photo gallery */}
        <div>
          <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-2">
            {t("Project gallery", "Galerie du projet")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
                caption: t("Before — Main Street corridor, 2023", "Avant — corridor de la rue Main, 2023"),
              },
              {
                src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
                caption: t("Planting in progress — summer 2024", "Plantation en cours — été 2024"),
              },
              {
                src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
                caption: t("Mature canopy vision — community outcome", "Vision du couvert mature — résultat communautaire"),
              },
            ].map((photo, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden relative" style={{ aspectRatio: "4/3", background: "#e8f5f0" }}>
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 text-white text-[10px] px-2 py-1"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                >
                  {photo.caption}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {t(
              "In production, these would show actual project photos uploaded by the municipality.",
              "En production, celles-ci afficheraient les photos réelles du projet téléchargées par la municipalité."
            )}
          </p>
        </div>

        {/* 5. Project story + map — two-column layout */}
        <div className="grid gap-3 md:grid-cols-[1.3fr,1fr]">
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
            <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-2">
              {t("Project story", "Récit du projet")}
            </p>
            <p className="text-[13px] leading-7 text-slate-500">
              {t(
                `${selectedProject.municipality} runs through one of ${selectedProject.province}'s most densely populated neighbourhoods — a corridor with limited shade, ageing sidewalks, and surface temperatures that spike well above the city average on hot summer days. Residents, particularly older adults and families in nearby apartment buildings, had limited access to green space within walking distance.`,
                `${selectedProject.municipality} traverse l'un des quartiers les plus densément peuplés de ${selectedProject.province} — un corridor avec peu d'ombre, des trottoirs vieillissants et des températures de surface bien supérieures à la moyenne de la ville lors des chaudes journées d'été.`
              )}
            </p>
            <p className="text-[13px] leading-7 text-slate-500 mt-3">
              {t(
                `In ${selectedProject.year}, the municipality partnered with GCCC to plant ${selectedProject.trees} street trees along this corridor, prioritising species adapted to ${language === "fr" ? regionLabels[selectedProject.region].fr : regionLabels[selectedProject.region].en} climate conditions. The project is estimated to reduce local cooling load by ${projectResults.total.heatIslandReductionDegC.toFixed(2)}°C at maturity, intercept over ${(projectResults.total.stormwaterLitres / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })} million litres of stormwater annually, and generate approximately $${projectResults.total.propertyValueIncrease.toLocaleString(undefined, { maximumFractionDigits: 0 })} per year in property value uplift for adjacent households.`,
                `En ${selectedProject.year}, la municipalité s'est associée au GCCC pour planter ${selectedProject.trees} arbres de rue le long de ce corridor. Le projet devrait réduire la charge de refroidissement locale de ${projectResults.total.heatIslandReductionDegC.toFixed(2)}°C à maturité et intercepter plus de ${(projectResults.total.stormwaterLitres / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })} millions de litres d'eaux pluviales par an.`
              )}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-3" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
            <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-2">
              {t("Project location", "Emplacement du projet")}
            </p>
            <div className="rounded-lg overflow-hidden" style={{ height: "240px" }}>
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
            <p className="text-[10px] text-slate-400 mt-2">
              {t(
                "Interactive map centred on project location in full build.",
                "Carte interactive centrée sur l'emplacement du projet dans la version complète."
              )}
            </p>
          </div>
        </div>

        {/* 6. Monitoring timeline */}
        <div className="rounded-xl border bg-white p-4" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-3">
            {t("Monitoring timeline", "Chronologie de surveillance")}
          </p>
          {[selectedProject.year, selectedProject.year + 2, selectedProject.year + 4].map((updateYear, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between py-3"
              style={{ borderBottom: idx < 2 ? "0.5px solid rgba(0,0,0,0.08)" : "none" }}
            >
              <div>
                <p className="text-xs font-medium text-slate-900">
                  {idx === 0
                    ? `${t("Baseline", "Ligne de base")} — ${updateYear}`
                    : `${t("Update", "Mise à jour")} — ${updateYear}`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {idx === 0
                    ? t(
                        "Project establishment. Tree planting completed. Baseline measurements recorded.",
                        "Établissement du projet. Plantation complétée. Mesures de référence enregistrées."
                      )
                    : t(
                        "Project progress and impact metrics will be captured here every 2 years.",
                        "L'avancement du projet et les indicateurs d'impact seront saisis ici tous les 2 ans."
                      )}
                </p>
                <div className="flex gap-3 mt-1">
                  {idx === 0 ? (
                    <>
                      <span className="text-[11px] font-medium cursor-pointer" style={{ color: "#1D9E75" }}>
                        {t("View report", "Voir le rapport")}
                      </span>
                      <span className="text-[11px] font-medium cursor-pointer" style={{ color: "#1D9E75" }}>
                        {t("Download PDF", "Télécharger PDF")}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {t("Not yet available", "Pas encore disponible")}
                    </span>
                  )}
                </div>
              </div>
              {idx === 0 ? (
                <span
                  className="text-[10px] font-medium rounded-full px-2 py-0.5 whitespace-nowrap"
                  style={{ background: "#E1F5EE", color: "#085041" }}
                >
                  {t("Baseline", "Ligne de base")}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {idx === 1 ? t("+2 years", "+2 ans") : t("+4 years", "+4 ans")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 8. Benefits & impacts section */}
        <div>
          <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-1">
            {t("Benefits & impacts", "Bénéfices et impacts")}
          </p>
          <p className="text-[11px] text-slate-500 mb-3">
            {t(
              "Estimated benefits using the same methodology as the calculator. Values are indicative for reporting and stakeholder communication.",
              "Bénéfices estimés selon la même méthodologie que le calculateur. Valeurs indicatives pour les rapports et la communication."
            )}
          </p>

          {/* 8b. Headline benefit KPI strip */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-lg p-3" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t("Total annual value", "Valeur annuelle totale")}</p>
              <p className="text-xl font-medium mt-1" style={{ color: "#0F6E56" }}>
                ${totalAnnualValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t("CAD / yr at maturity", "CAD / an à maturité")}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t("Value per resident", "Valeur par résident")}</p>
              <p className="text-xl font-medium text-slate-900 mt-1">
                ${Math.round(totalAnnualValue / 10000).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t("CAD / capita / yr", "CAD / habitant / an")}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{t("Urban cooling", "Refroidissement urbain")}</p>
              <p className="text-xl font-medium text-slate-900 mt-1">
                −{projectResults.total.heatIslandReductionDegC.toFixed(2)}°C
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t("cooling effect over project footprint", "effet rafraîchissant sur l'emprise du projet")}</p>
            </div>
          </div>

          {/* 8c. Expandable benefit chain rows */}
          <div className="space-y-2 mb-4">
            {benefitChainRows.map((row) => {
              const isOpen = expandedBenefitRows.has(row.key);
              const sharePct = totalAnnualValue > 0 ? Math.round((row.value / totalAnnualValue) * 100) : 0;
              return (
                <div key={row.key} className="rounded-xl overflow-hidden bg-white" style={{ border: "0.5px solid rgba(0,0,0,0.1)" }}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left gap-3"
                    onClick={() => setExpandedBenefitRows((prev) => {
                      const next = new Set(prev);
                      if (next.has(row.key)) next.delete(row.key); else next.add(row.key);
                      return next;
                    })}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium flex-shrink-0 whitespace-nowrap"
                        style={{ background: row.badgeBg, color: row.badgeText }}
                      >
                        {row.badge}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">{row.fn}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-medium text-slate-900">
                        ${Math.round(row.value).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">/ yr</span>
                      <span className="text-[11px] text-slate-300">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t p-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                      <div className="grid gap-2 items-stretch" style={{ gridTemplateColumns: "1fr 20px 1fr 20px 1fr" }}>
                        {/* Function */}
                        <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
                          <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400">{t("FUNCTION", "FONCTION")}</p>
                          <p className="text-[11px] font-medium text-slate-900">{row.fn}</p>
                          <p className="text-[10px] text-slate-500 flex-1">{row.fnDetail}</p>
                          <div>
                            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                              <div className="h-full rounded-full" style={{ width: `${row.barW}%`, background: row.barColor }} />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[9px] text-slate-400">{t("Lower", "Plus faible")}</span>
                              <span className="text-[9px] text-slate-400">{t("Typical", "Typique")}</span>
                              <span className="text-[9px] text-slate-400">{t("High", "Élevé")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center text-slate-300 text-xs">→</div>
                        {/* Benefit */}
                        <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: "var(--color-background-secondary, #f5f5f3)" }}>
                          <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400">{t("BENEFIT", "BÉNÉFICE")}</p>
                          <p className="text-[11px] font-medium text-slate-900">{row.benefit}</p>
                          <p className="text-[10px] text-slate-500 flex-1">{row.benefitDesc}</p>
                        </div>
                        <div className="flex items-center justify-center text-slate-300 text-xs">→</div>
                        {/* Economic value */}
                        <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: row.econBg }}>
                          <p className="text-[9px] font-medium uppercase tracking-widest" style={{ color: row.badgeText, opacity: 0.6 }}>{t("ECONOMIC VALUE", "VALEUR ÉCONOMIQUE")}</p>
                          <p className="text-[11px] font-medium" style={{ color: row.badgeText }}>{row.econLabel}</p>
                          <p className="text-sm font-medium mt-auto" style={{ color: row.badgeText }}>
                            ${Math.round(row.value).toLocaleString()} / {t("yr", "an")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 8d. Benefits summary table */}
          <div className="rounded-xl border bg-white p-4" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
            <p className="text-xs font-medium text-slate-900 mb-2">{t("Benefits summary", "Résumé des bénéfices")}</p>
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider py-1.5 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>{t("Benefit group", "Groupe de bénéfices")}</th>
                  <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider py-1.5 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>{t("Tree function", "Fonction de l'arbre")}</th>
                  <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider py-1.5 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>{t("Physical quantity", "Quantité physique")}</th>
                  <th className="text-right text-[10px] font-medium text-slate-400 uppercase tracking-wider py-1.5 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>{t("Annual value", "Valeur annuelle")}</th>
                  <th className="text-right text-[10px] font-medium text-slate-400 uppercase tracking-wider py-1.5 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>{t("Share", "Part")}</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.key}>
                    <td className="font-medium py-2 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>{row.badge}</td>
                    <td className="text-[11px] text-slate-500 py-2 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>{row.fn}</td>
                    <td className="text-[10px] text-slate-400 py-2 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>{row.fnDetail}</td>
                    <td className="text-right font-medium py-2 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>${Math.round(row.value).toLocaleString()}</td>
                    <td className="text-right text-slate-500 py-2 px-2" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>{row.share}%</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-medium py-2 px-2" style={{ background: "var(--color-background-secondary, #f8f8f6)" }}>{t("Total", "Total")}</td>
                  <td className="text-[11px] text-slate-500 py-2 px-2" style={{ background: "var(--color-background-secondary, #f8f8f6)" }}>{t("All quantified ecosystem services", "Tous les services écosystémiques quantifiés")}</td>
                  <td className="py-2 px-2" style={{ background: "var(--color-background-secondary, #f8f8f6)" }}></td>
                  <td className="text-right font-medium py-2 px-2" style={{ background: "var(--color-background-secondary, #f8f8f6)" }}>${totalAnnualValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="text-right py-2 px-2" style={{ background: "var(--color-background-secondary, #f8f8f6)" }}>100%</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              {t(
                "Valuation methods follow simplified Canadian order-of-magnitude assumptions. Not for official reporting.",
                "Les méthodes d'évaluation suivent des hypothèses canadiennes simplifiées d'ordre de grandeur. Ne pas utiliser pour les rapports officiels."
              )}
            </p>
          </div>
        </div>
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

        {/* Row 1 — Portfolio summary */}
        <div>
          <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-2">
            {t("Portfolio summary", "Résumé du portefeuille")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                {t("Projects funded", "Projets financés")}
              </div>
              <div className="mt-1 text-2xl font-medium" style={{ color: "#0F6E56" }}>
                88
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {t("approved GCCC projects", "projets GCCC approuvés")}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                {t("Trees to be planted", "Arbres à planter")}
              </div>
              <div className="mt-1 text-2xl font-medium text-slate-900">
                203K
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {t("committed this programme", "engagés dans ce programme")}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                {t("Municipalities supported", "Municipalités soutenues")}
              </div>
              <div className="mt-1 text-2xl font-medium text-slate-900">
                81
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {t("across Canada", "à travers le Canada")}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — Estimated benefits generated */}
        <div>
          <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mb-2">
            {t("Estimated benefits generated", "Bénéfices estimés générés")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                {t("Total ecosystem value", "Valeur écosystémique totale")}
              </div>
              <div className="mt-1 text-2xl font-medium" style={{ color: "#0F6E56" }}>
                $1.4M
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {t("indicative CAD / yr at maturity", "CAD indicatif / an à maturité")}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                {t("tCO₂e sequestered", "tCO₂e séquestrées")}
              </div>
              <div className="mt-1 text-2xl font-medium text-slate-900">
                837 t
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {t("per year at canopy maturity", "par an à maturité du couvert")}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                {t("Stormwater diverted", "Eaux pluviales détournées")}
              </div>
              <div className="mt-1 text-2xl font-medium text-slate-900">
                72.8M L
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {t("per year across all projects", "par an pour tous les projets")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">
          {t("Filter projects", "Filtrer les projets")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1.5">
              {t("Year of planting", "Année de plantation")}
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              <option value="all">{t("All years", "Toutes les années")}</option>
              {[2021, 2022, 2023, 2024, 2025, 2026].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1.5">
              {t("Project status", "Statut du projet")}
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as typeof selectedStatus)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              <option value="all">{t("All", "Tous")}</option>
              <option value="approved">{t("Approved", "Approuvé")}</option>
              <option value="pending">{t("Pending approval", "En attente d'approbation")}</option>
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

      {/* Section 5 — Three-column row below map */}
      <section className="grid gap-4 lg:grid-cols-3 items-start">
        {/* Card 1 — Programme funding progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            {t("Programme funding progress", "Progrès du financement du programme")}
          </h3>
          {/* Bar 1 — FY 2025–26 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-700 font-medium">FY 2025–26</span>
              <span className="text-[11px] text-slate-900 font-medium">$26.9M {t("approved", "approuvé")}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "41%", background: "#1D9E75" }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">41% {t("of $65.2M FY target", "de l’objectif de 65,2 M$ pour l’EF")}</p>
          </div>
          {/* Bar 2 — Programme envelope */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-700 font-medium">{t("Programme envelope", "Enveloppe du programme")}</span>
              <span className="text-[11px] text-slate-900 font-medium">$43.5M {t("approved", "approuvé")}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "20%", background: "#1D9E75" }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">20% {t("of $217.3M total envelope", "de l’enveloppe totale de 217,3 M$")}</p>
          </div>
          {/* Mini stat row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">88</p>
              <p className="text-[10px] text-slate-400">{t("Approvals", "Approbations")}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">$159</p>
              <p className="text-[10px] text-slate-400">{t("Grant / tree", "Subvention / arbre")}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">$333</p>
              <p className="text-[10px] text-slate-400">{t("Cost / tree", "Coût / arbre")}</p>
            </div>
          </div>
        </div>

        {/* Card 2 — Portfolio benefit breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-3">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            {t("Portfolio benefit breakdown", "Ventilation des bénéfices du portefeuille")}
          </h3>
          <div className="flex items-center gap-4">
            {/* Doughnut chart — SVG */}
            <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
              {/* Property & economic — 70% (0 to 252°) */}
              <circle cx="50" cy="50" r="36" fill="none" stroke="#1D9E75" strokeWidth="10"
                strokeDasharray={`${0.70 * 226.2} ${226.2}`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)" />
              {/* Health & community — 22% (252° to 331.2°) */}
              <circle cx="50" cy="50" r="36" fill="none" stroke="#7F77DD" strokeWidth="10"
                strokeDasharray={`${0.22 * 226.2} ${226.2}`}
                strokeDashoffset={`${-0.70 * 226.2}`}
                transform="rotate(-90 50 50)" />
              {/* Water & flood — 4% */}
              <circle cx="50" cy="50" r="36" fill="none" stroke="#378ADD" strokeWidth="10"
                strokeDasharray={`${0.04 * 226.2} ${226.2}`}
                strokeDashoffset={`${-0.92 * 226.2}`}
                transform="rotate(-90 50 50)" />
              {/* Climate / carbon — 4% */}
              <circle cx="50" cy="50" r="36" fill="none" stroke="#5DCAA5" strokeWidth="10"
                strokeDasharray={`${0.04 * 226.2} ${226.2}`}
                strokeDashoffset={`${-0.96 * 226.2}`}
                transform="rotate(-90 50 50)" />
            </svg>
            {/* Legend */}
            <div className="space-y-2 text-[11px]">
              {[
                { label: t("Property & economic", "Foncière et économique"), color: "#1D9E75", share: "70%" },
                { label: t("Health & community", "Santé et communauté"), color: "#7F77DD", share: "22%" },
                { label: t("Water & flood", "Eau et inondations"), color: "#378ADD", share: "4%" },
                { label: t("Climate / carbon", "Climat / carbone"), color: "#5DCAA5", share: "4%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-700">{item.label}</span>
                  <span className="text-slate-400 ml-auto">{item.share}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            {t(
              "Indicative aggregated split based on demo project assumptions",
              "Ventilation indicative agrégée basée sur les hypothèses de projets de démonstration"
            )}
          </p>
        </div>

        {/* Card 3 — Equity & coverage context */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            {t("Equity & coverage context", "Contexte d’équité et de couverture")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-lg font-medium" style={{ color: "#854F0B" }}>24 / 88</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                {t(
                  "projects in areas with a canopy cover below 10% of the urban area",
                  "projets dans des zones avec un couvert végétal inférieur à 10 % de la zone urbaine"
                )}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-lg font-medium" style={{ color: "#3C3489" }}>19 / 88</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                {t(
                  "projects in communities with a high social vulnerability index score",
                  "projets dans des communautés ayant un indice élevé de vulnérabilité sociale"
                )}
              </p>
            </div>
          </div>
          {/* Progress bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-700">{t("Indigenous groups engaged", "Groupes autochtones engagés")}</span>
                <span className="text-[11px] font-medium text-slate-900">32</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "60%", background: "#7F77DD" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-700">{t("Municipalities with equity strategy", "Municipalités avec stratégie d’équité")}</span>
                <span className="text-[11px] font-medium text-slate-900">69 / 88</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "78%", background: "#1D9E75" }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            {t(
              "0 projects in Northern Canada — potential coverage gap for outreach",
              "0 projet dans le Nord du Canada — lacune potentielle de couverture pour la sensibilisation"
            )}
          </p>
        </div>
      </section>

      {/* Section 6 — Two-column breakdown charts */}
      <section className="grid gap-4 lg:grid-cols-2 items-start">
        {/* Card 1 — Projects by region */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-3">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            {t("Projects by region", "Projets par région")}
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Ontario", count: 36, pct: 40.9, color: "#085041" },
              { label: t("Prairies", "Prairies"), count: 23, pct: 26.1, color: "#1D9E75" },
              { label: t("British Columbia", "Colombie-Britannique"), count: 16, pct: 18.2, color: "#5DCAA5" },
              { label: "Atlantic", count: 7, pct: 8.0, color: "#9FE1CB" },
              { label: t("Quebec", "Québec"), count: 5, pct: 5.7, color: "#D3D1C7" },
            ].map((region) => (
              <div key={region.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-700">{region.label}</span>
                  <span className="text-[11px] text-slate-500">{region.count} ({region.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(region.count / 36) * 100}%`, background: region.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — Projects by community size */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-3">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            {t("Projects by community size", "Projets par taille de communauté")}
          </h3>
          <div className="flex items-center gap-4">
            {/* Doughnut chart */}
            <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
              <circle cx="50" cy="50" r="36" fill="none" stroke="#085041" strokeWidth="12"
                strokeDasharray={`${0.40 * 226.2} ${226.2}`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="#1D9E75" strokeWidth="12"
                strokeDasharray={`${0.41 * 226.2} ${226.2}`}
                strokeDashoffset={`${-0.40 * 226.2}`}
                transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="#9FE1CB" strokeWidth="12"
                strokeDasharray={`${0.17 * 226.2} ${226.2}`}
                strokeDashoffset={`${-0.81 * 226.2}`}
                transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="#D3D1C7" strokeWidth="12"
                strokeDasharray={`${0.02 * 226.2} ${226.2}`}
                strokeDashoffset={`${-0.98 * 226.2}`}
                transform="rotate(-90 50 50)" />
            </svg>
            {/* Legend */}
            <div className="space-y-2.5 text-[11px]">
              {[
                { label: t("Large", "Grande"), count: 35, pct: "40%", color: "#085041", sub: t("cities >100K pop.", "villes >100K hab.") },
                { label: t("Medium", "Moyenne"), count: 36, pct: "41%", color: "#1D9E75", sub: t("30K–100K pop.", "30K–100K hab.") },
                { label: t("Small", "Petite"), count: 15, pct: "17%", color: "#9FE1CB", sub: t("under 30K pop.", "moins de 30K hab.") },
                { label: t("Unknown", "Inconnu"), count: 2, pct: "2%", color: "#D3D1C7", sub: t("not classified", "non classifié") },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: item.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-medium">{item.label}</span>
                      <span className="text-slate-400">{item.count} · {item.pct}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Footer note */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {t(
            "Portfolio metrics are based on mocked projects and simplified assumptions inspired by GMF’s Growing Canada’s Community Canopies resources. They illustrate how FCM could aggregate climate, water, health and equity benefits across projects. For actual funding applications and reporting, please refer to official guidance and tools from the Green Municipal Fund. Project count and tree figures reflect GCCC programme data as of October 2025.",
            "Les indicateurs de portefeuille reposent sur des projets fictifs et des hypothèses simplifiées inspirées des ressources de l’initiative « Cultiver les canopées communautaires du Canada » du FMV. Ils illustrent comment la FCM pourrait agréger les bénéfices climatiques, hydriques, sanitaires et d’équité à l’échelle des projets. Pour les demandes de financement et la reddition de comptes officielles, veuillez vous référer aux outils et lignes directrices du Fonds municipal vert. Le nombre de projets et les chiffres d’arbres reflètent les données du programme GCCC en date d’octobre 2025."
          )}
        </p>
      </section>
    </main>
  );
}

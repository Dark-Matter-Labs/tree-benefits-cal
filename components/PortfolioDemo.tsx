"use client";

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

interface MockProject {
  id: string;
  name: string;
  municipality: string;
  province: string;
  region: RegionKey;
  size: "small" | "medium" | "large";
  year: number;
  trees: number;
  carbonTonnes: number;
  stormwaterLitres: number;
}

const mockProjects: MockProject[] = [
  {
    id: "p1",
    name: "Downtown Heat Relief Canopy",
    municipality: "Halifax",
    province: "NS",
    region: "atlantic",
    size: "medium",
    year: 2025,
    trees: 750,
    carbonTonnes: 15,
    stormwaterLitres: 2200000
  },
  {
    id: "p2",
    name: "Green Streets Pilot",
    municipality: "Montreal",
    province: "QC",
    region: "quebec",
    size: "large",
    year: 2025,
    trees: 1200,
    carbonTonnes: 24,
    stormwaterLitres: 3800000
  },
  {
    id: "p3",
    name: "Riparian Buffer Restoration",
    municipality: "Saskatoon",
    province: "SK",
    region: "prairies",
    size: "medium",
    year: 2024,
    trees: 600,
    carbonTonnes: 12,
    stormwaterLitres: 1900000
  },
  {
    id: "p4",
    name: "Neighborhood Climate Forest",
    municipality: "Vancouver",
    province: "BC",
    region: "bc",
    size: "large",
    year: 2025,
    trees: 1500,
    carbonTonnes: 30,
    stormwaterLitres: 4500000
  },
  {
    id: "p5",
    name: "Main Street Tree Retrofit",
    municipality: "Charlottetown",
    province: "PE",
    region: "atlantic",
    size: "small",
    year: 2024,
    trees: 120,
    carbonTonnes: 3,
    stormwaterLitres: 450000
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

export function PortfolioDemo({ language }: PortfolioDemoProps) {
  const t = (en: string, fr: string) => (language === "fr" ? fr : en);

  const totalProjects = mockProjects.length;
  const totalTrees = mockProjects.reduce((sum, p) => sum + p.trees, 0);
  const totalCarbon = mockProjects.reduce(
    (sum, p) => sum + p.carbonTonnes,
    0
  );
  const totalStormwater = mockProjects.reduce(
    (sum, p) => sum + p.stormwaterLitres,
    0
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-5">
      <section className="grid gap-4 md:grid-cols-[2fr,1.4fr] items-start">
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
                {t("Carbon (tCO₂e/yr)", "Carbone (tCO₂e/an)")}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {totalCarbon.toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
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

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
              {t(
                "Regional distribution",
                "Répartition régionale (symbolique)"
              )}
            </h3>
            <div className="relative h-44 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden flex items-end justify-stretch shadow-sm">
              {(
                Object.keys(regionLabels) as Array<keyof typeof regionLabels>
              ).map(region => {
                const sumTrees = mockProjects
                  .filter(p => p.region === region)
                  .reduce((s, p) => s + p.trees, 0);
                const share =
                  totalTrees === 0 ? 0 : Math.max(0.05, sumTrees / totalTrees);
                return (
                  <div
                    key={region}
                    className="flex-1 flex flex-col justify-end items-center h-full"
                  >
                    <div
                      className={`w-8 rounded-t-full bg-gradient-to-t ${regionLabels[region].color} shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all`}
                      style={{ height: `${share * 100}%` }}
                    />
                    <div className="mt-2 text-[10px] text-slate-700 text-center px-1 font-medium">
                      {language === "fr"
                        ? regionLabels[region].fr
                        : regionLabels[region].en}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-600 italic">
              {t(
                "In production, this could drive both a PowerBI dashboard and a public map of funded projects.",
                "En production, cela pourrait alimenter à la fois un tableau de bord PowerBI et une carte publique des projets financés."
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 h-full shadow-md">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
            {t("Project list (demo data)", "Liste de projets (données démo)")}
          </h3>
          <div className="space-y-2 max-h-72 overflow-auto pr-2 custom-scrollbar text-xs">
            {mockProjects.map(p => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-900 truncate">
                    {p.name}
                  </div>
                  <span className="rounded-full bg-primary-100 border border-primary-200 px-2 py-0.5 text-[10px] text-primary-700 font-medium">
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
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-600 italic">
            {t(
              "Workshop talking point: ask how FCM staff would want to filter (by region, typology, year, equity) before building the real integration.",
              "Point de discussion pour l’atelier : demander comment le personnel du FCM souhaiterait filtrer (par région, typologie, année, équité) avant de bâtir l’intégration réelle."
            )}
          </p>
        </div>
      </section>
    </main>
  );
}


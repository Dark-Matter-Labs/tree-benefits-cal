export type MunicipalitySize = "small" | "medium" | "large";
export type Region =
  | "atlantic"
  | "quebec"
  | "ontario"
  | "prairies"
  | "bc"
  | "territories";

export type BenefitCategory =
  | "carbon"
  | "stormwater"
  | "airQuality"
  | "heat"
  | "biodiversity"
  | "health"
  | "propertyValue";

export interface ProjectInput {
  region: Region;
  municipalitySize: MunicipalitySize;
  populationServed: number;
  householdsServed: number;
  numberOfTrees: number;
  projectAreaHa: number;
  year: number;
}

export type BenefitResults = {
  total: {
    carbonTonnes: number;
    carbonValue: number;
    stormwaterLitres: number;
    stormwaterValue: number;
    healthSavings: number;
    propertyValueIncrease: number;
    heatIslandReductionDegC: number;
  };
  perCapita: {
    carbonTonnes: number;
    value: number;
  };
  perHousehold: {
    carbonTonnes: number;
    value: number;
  };
};

// NOTE: These are simplified demo multipliers for workshop purposes only.
const baseCoefficients = {
  carbonPerTreeTonnes: 0.02, // rough annualized value for young planting
  carbonPricePerTonne: 65, // $/tCO2e, ballpark of Canadian carbon price
  stormwaterLitresPerTree: 3000,
  stormwaterValuePer1000L: 0.5,
  healthSavingsPerTree: 8,
  propertyValuePerTree: 25,
  heatReductionPerHaDegC: 0.15
};

const regionalCarbonMultiplier: Record<Region, number> = {
  atlantic: 1.0,
  quebec: 1.05,
  ontario: 1.0,
  prairies: 0.95,
  bc: 1.1,
  territories: 0.9
};

const sizeAdjustment: Record<MunicipalitySize, number> = {
  small: 1.1,
  medium: 1.0,
  large: 0.9
};

export function calculateBenefits(input: ProjectInput): BenefitResults {
  const regionFactor = regionalCarbonMultiplier[input.region];
  const sizeFactor = sizeAdjustment[input.municipalitySize];

  const effectiveTrees = input.numberOfTrees * sizeFactor;
  const carbonTonnes =
    effectiveTrees * baseCoefficients.carbonPerTreeTonnes * regionFactor;
  const carbonValue = carbonTonnes * baseCoefficients.carbonPricePerTonne;

  const stormwaterLitres = effectiveTrees * baseCoefficients.stormwaterLitresPerTree;
  const stormwaterValue =
    (stormwaterLitres / 1000) * baseCoefficients.stormwaterValuePer1000L;

  const healthSavings = effectiveTrees * baseCoefficients.healthSavingsPerTree;
  const propertyValueIncrease =
    effectiveTrees * baseCoefficients.propertyValuePerTree;

  const heatIslandReductionDegC =
    input.projectAreaHa * baseCoefficients.heatReductionPerHaDegC;

  const population = Math.max(input.populationServed || 0, 1);
  const households = Math.max(input.householdsServed || 0, 1);

  return {
    total: {
      carbonTonnes,
      carbonValue,
      stormwaterLitres,
      stormwaterValue,
      healthSavings,
      propertyValueIncrease,
      heatIslandReductionDegC
    },
    perCapita: {
      carbonTonnes: carbonTonnes / population,
      value: carbonValue / population
    },
    perHousehold: {
      carbonTonnes: carbonTonnes / households,
      value: carbonValue / households
    }
  };
}


export type Scope = 1 | 2 | 3;

export type EmissionCategory = 
  | 'transportation' 
  | 'electricity' 
  | 'heating_fuel' 
  | 'food' 
  | 'business';

export interface EmissionFactor {
  id: string;
  category: EmissionCategory;
  name: string;
  scope: Scope;
  value: number; // in kg CO2e per unit
  unit: string;
  uncertaintyPercent: number; // e.g. 10 means +/- 10%
  source: {
    organization: string; // e.g. "US EPA", "UK DESNZ/DEFRA", "IPCC"
    name: string;
    year: number;
    url?: string;
    citationText: string;
  };
  notes?: string;
  isCustom?: boolean;
}

export interface ActivityItem {
  id: string;
  category: EmissionCategory;
  name: string;
  scope: Scope;
  factorId: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface CalculatedItem {
  activityId: string;
  category: EmissionCategory;
  name: string;
  scope: Scope;
  amount: number;
  unit: string;
  factorValue: number;
  factorUnit: string;
  kgCO2e: number;
  uncertaintyPercent: number;
  minKgCO2e: number;
  maxKgCO2e: number;
  formula: string;
  sourceCitation: string;
}

export interface FootprintSummary {
  totalKgCO2e: number;
  totalTonnesCO2e: number;
  minTonnesCO2e: number;
  maxTonnesCO2e: number;
  byScope: {
    scope1Kg: number;
    scope2Kg: number;
    scope3Kg: number;
    scope1Tonnes: number;
    scope2Tonnes: number;
    scope3Tonnes: number;
  };
  byCategory: Record<EmissionCategory, {
    kgCO2e: number;
    tonnesCO2e: number;
    percentage: number;
  }>;
  items: CalculatedItem[];
}

export type ProfileType = 'personal' | 'business';

export interface PeriodRecord {
  id: string;
  label: string; // e.g. "2024 Annual", "2023 Annual", "Q1 2024"
  date: string;
  profileType: ProfileType;
  organizationName?: string;
  numberOfPeopleOrEmployees: number;
  squareFootage?: number;
  activities: {
    // Transportation
    gasolineCarMiles: number;
    dieselCarMiles: number;
    hybridCarMiles: number;
    electricVehicleMiles: number;
    busMiles: number;
    trainMiles: number;
    shortFlightsKm: number;
    longFlightsKm: number;
    flightRadiativeForcing: boolean;
    businessVanMiles: number;
    
    // Electricity
    electricityKwh: number;
    gridRegionFactorId: string;
    greenPowerPercentage: number; // 0 to 100%

    // Fuel & Heating
    naturalGasTherms: number;
    heatingOilGallons: number;
    propaneGallons: number;
    woodPelletsKg: number;

    // Food (mostly personal)
    dietType: 'heavy_meat' | 'medium_meat' | 'low_meat' | 'pescatarian' | 'vegetarian' | 'vegan';
    foodWastePercent: number; // 0 to 50%
    localFoodFactor: boolean;

    // Small Business Specific
    officeSqFt: number;
    hvacEnergyKwh: number;
    commuteEmployees: number;
    commuteAvgMilesPerDay: number;
    commuteWorkDaysPerYear: number;
    cloudComputeHours: number; // vCPU hours or kWh
    paperAndSuppliesSpendUsd: number;
    shippingPackagesCount: number;
  };
}

export interface ReductionScenario {
  id: string;
  title: string;
  description: string;
  category: EmissionCategory;
  enabled: boolean;
  impactModifier: {
    type: 'percentage' | 'replace_factor' | 'absolute';
    targetField: keyof PeriodRecord['activities'];
    value: number | boolean | string;
  };
  estimatedCostOrSavingsAnnualUsd?: number;
}

export interface Benchmark {
  id: string;
  title: string;
  type: 'personal' | 'business';
  tonnesCO2e: number;
  description: string;
  source: string;
}

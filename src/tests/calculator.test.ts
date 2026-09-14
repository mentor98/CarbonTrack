/**
 * CarbonTrack Calculation Engine Test Suite
 * Validates calculation outputs against published reference standards:
 * - US EPA GHG Emission Factors Hub (2024)
 * - UK DESNZ / DEFRA Conversion Factors (2024)
 * - IPCC AR6 Global Warming Potential & Error Propagation (Quadrature)
 */

import { calculateFootprint, simulateScenario } from '../utils/calculator';
import { DEFAULT_EMISSION_FACTORS } from '../data/emissionFactors';
import { PeriodRecord } from '../types/carbon';

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  expected: string;
  actual: string;
  notes: string;
}

export function runCalculationTests(): TestResult[] {
  const results: TestResult[] = [];

  // TEST 1: EPA Passenger Car Gasoline Mobile Combustion
  try {
    const record: PeriodRecord = {
      id: 'test_car',
      label: 'Test Car',
      date: '2024-01-01',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 1,
      activities: {
        gasolineCarMiles: 1000,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 0,
        longFlightsKm: 0,
        flightRadiativeForcing: false,
        businessVanMiles: 0,
        electricityKwh: 0,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 0,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 0,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    const res = calculateFootprint(record, DEFAULT_EMISSION_FACTORS);
    const carItem = res.items.find(i => i.name === 'Gasoline Passenger Car');
    // 1000 miles * 0.385 = 385 kg CO2e
    const expectedKg = 385.0;
    const actualKg = carItem ? carItem.kgCO2e : 0;
    const passed = Math.abs(actualKg - expectedKg) < 0.01 && carItem?.scope === 1;

    results.push({
      name: 'EPA Gasoline Passenger Car Combustion (Scope 1)',
      category: 'Transportation',
      passed,
      expected: '385.00 kg CO₂e (Scope 1)',
      actual: `${actualKg.toFixed(2)} kg CO₂e (Scope ${carItem?.scope})`,
      notes: '1,000 miles × 0.385 kg CO₂e/mile (EPA GHG Hub Table 8)'
    });
  } catch (e: any) {
    results.push({
      name: 'EPA Gasoline Passenger Car Combustion',
      category: 'Transportation',
      passed: false,
      expected: '385.00 kg CO₂e',
      actual: `Error: ${e.message}`,
      notes: 'Execution failed'
    });
  }

  // TEST 2: EPA Natural Gas Stationary Combustion
  try {
    const record: PeriodRecord = {
      id: 'test_gas',
      label: 'Test Gas',
      date: '2024-01-01',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 1,
      activities: {
        gasolineCarMiles: 0,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 0,
        longFlightsKm: 0,
        flightRadiativeForcing: false,
        businessVanMiles: 0,
        electricityKwh: 0,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 100,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 0,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    const res = calculateFootprint(record, DEFAULT_EMISSION_FACTORS);
    const gasItem = res.items.find(i => i.name === 'Piped Natural Gas');
    // 100 therms * 5.306 = 530.6 kg CO2e
    const expectedKg = 530.6;
    const actualKg = gasItem ? gasItem.kgCO2e : 0;
    const passed = Math.abs(actualKg - expectedKg) < 0.01 && gasItem?.scope === 1;

    results.push({
      name: 'EPA Natural Gas Stationary Combustion (Scope 1)',
      category: 'Heating & Fuel',
      passed,
      expected: '530.60 kg CO₂e (Scope 1)',
      actual: `${actualKg.toFixed(2)} kg CO₂e (Scope ${gasItem?.scope})`,
      notes: '100 therms × 5.306 kg CO₂e/therm (EPA Table 1)'
    });
  } catch (e: any) {
    results.push({
      name: 'EPA Natural Gas Stationary Combustion',
      category: 'Heating & Fuel',
      passed: false,
      expected: '530.60 kg CO₂e',
      actual: `Error: ${e.message}`,
      notes: 'Execution failed'
    });
  }

  // TEST 3: Electricity Scope 2 with 100% Green Power Market-Based Reduction
  try {
    const record: PeriodRecord = {
      id: 'test_green',
      label: 'Test Green Power',
      date: '2024-01-01',
      profileType: 'business',
      numberOfPeopleOrEmployees: 5,
      activities: {
        gasolineCarMiles: 0,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 0,
        longFlightsKm: 0,
        flightRadiativeForcing: false,
        businessVanMiles: 0,
        electricityKwh: 10000,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 100, // 100% green
        naturalGasTherms: 0,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 0,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    const res = calculateFootprint(record, DEFAULT_EMISSION_FACTORS);
    const elecItem = res.items.find(i => i.category === 'electricity');
    const actualKg = elecItem ? elecItem.kgCO2e : 0;
    const passed = actualKg === 0 && res.byScope.scope2Kg === 0;

    results.push({
      name: 'Scope 2 Market-Based Accounting (100% Green Power)',
      category: 'Electricity',
      passed,
      expected: '0.00 kg CO₂e (100% avoided Scope 2)',
      actual: `${actualKg.toFixed(2)} kg CO₂e`,
      notes: 'GHG Protocol Scope 2 Guidance Market-Based method'
    });
  } catch (e: any) {
    results.push({
      name: 'Scope 2 Market-Based Accounting',
      category: 'Electricity',
      passed: false,
      expected: '0.00 kg CO₂e',
      actual: `Error: ${e.message}`,
      notes: 'Execution failed'
    });
  }

  // TEST 4: DEFRA Aviation Radiative Forcing (1.9x Multiplier)
  try {
    const recordNoRf: PeriodRecord = {
      id: 'test_fly_norf',
      label: 'Flight No RF',
      date: '2024-01-01',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 1,
      activities: {
        gasolineCarMiles: 0,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 1000,
        longFlightsKm: 0,
        flightRadiativeForcing: false,
        businessVanMiles: 0,
        electricityKwh: 0,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 0,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 0,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    const recordWithRf: PeriodRecord = {
      ...recordNoRf,
      activities: { ...recordNoRf.activities, flightRadiativeForcing: true }
    };

    const resNoRf = calculateFootprint(recordNoRf, DEFAULT_EMISSION_FACTORS);
    const resWithRf = calculateFootprint(recordWithRf, DEFAULT_EMISSION_FACTORS);

    const kgNoRf = resNoRf.items.find(i => i.name.includes('Short Flights'))?.kgCO2e || 0;
    const kgWithRf = resWithRf.items.find(i => i.name.includes('Short Flights'))?.kgCO2e || 0;

    // 1000 km * 0.245 = 245 kg without RF
    // 1000 km * 0.245 * 1.9 = 465.5 kg with RF
    const passed = Math.abs(kgNoRf - 245.0) < 0.1 && Math.abs(kgWithRf - 465.5) < 0.1;

    results.push({
      name: 'Aviation Radiative Forcing (RF 1.9x) Non-CO2 Uplift',
      category: 'Transportation',
      passed,
      expected: 'No RF: 245.00 kg | With RF: 465.50 kg (1.9x ratio)',
      actual: `No RF: ${kgNoRf.toFixed(2)} kg | With RF: ${kgWithRf.toFixed(2)} kg (Ratio: ${(kgWithRf / kgNoRf).toFixed(2)}x)`,
      notes: 'DESNZ / DEFRA aviation guidance for high-altitude non-CO2 impacts'
    });
  } catch (e: any) {
    results.push({
      name: 'Aviation Radiative Forcing Multiplier',
      category: 'Transportation',
      passed: false,
      expected: 'Ratio 1.9x',
      actual: `Error: ${e.message}`,
      notes: 'Execution failed'
    });
  }

  // TEST 5: IPCC Quadrature Uncertainty Propagation
  try {
    const record: PeriodRecord = {
      id: 'test_unc',
      label: 'Test Uncertainty',
      date: '2024-01-01',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 1,
      activities: {
        gasolineCarMiles: 10000, // 3850 kg, 12% unc = 462 kg stddev
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 0,
        longFlightsKm: 0,
        flightRadiativeForcing: false,
        businessVanMiles: 0,
        electricityKwh: 5000, // 1940 kg, 10% unc = 194 kg stddev
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 500, // 2653 kg, 5% unc = 132.65 kg stddev
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 0,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    const res = calculateFootprint(record, DEFAULT_EMISSION_FACTORS);
    // minTonnes should be strictly less than totalTonnes, maxTonnes strictly greater
    const passed = res.minTonnesCO2e < res.totalTonnesCO2e && res.maxTonnesCO2e > res.totalTonnesCO2e;

    results.push({
      name: 'IPCC Quadrature Uncertainty Propagation',
      category: 'Uncertainty Modeling',
      passed,
      expected: `minTonnes < total (${res.totalTonnesCO2e.toFixed(2)} t) < maxTonnes`,
      actual: `CI Bounds: [${res.minTonnesCO2e.toFixed(2)} t, ${res.maxTonnesCO2e.toFixed(2)} t]`,
      notes: 'IPCC Good Practice Guidance for standard error propagation in GHG inventories'
    });
  } catch (e: any) {
    results.push({
      name: 'IPCC Uncertainty Propagation',
      category: 'Uncertainty Modeling',
      passed: false,
      expected: 'Valid confidence interval bounds',
      actual: `Error: ${e.message}`,
      notes: 'Execution failed'
    });
  }

  // TEST 6: Reduction Scenario Simulation (EV Transition + Green Electricity)
  try {
    const baseRecord: PeriodRecord = {
      id: 'test_scen',
      label: 'Scenario Baseline',
      date: '2024-01-01',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 1,
      activities: {
        gasolineCarMiles: 10000,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 0,
        longFlightsKm: 0,
        flightRadiativeForcing: false,
        businessVanMiles: 0,
        electricityKwh: 6000,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 0,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 0,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    const sim = simulateScenario(
      baseRecord,
      {
        greenElectricity: true,
        evVehicleShiftPercent: 100, // all gas car miles to EV
        remoteWorkDaysPerWeek: 0,
        lowCarbonDiet: false,
        heatPumpAdoption: false,
        reduceFlightsPercent: 0
      },
      DEFAULT_EMISSION_FACTORS
    );

    // Baseline: 10000*0.385 = 3850 kg + 6000*0.388 = 2328 kg + diet 2500 = 8678 kg (8.678 t)
    // Scenario: EV 10000*0.092 = 920 kg + Elec 0 kg + diet 2500 = 3420 kg (3.420 t)
    // Saved: ~5.258 tonnes (reduction ~60%)
    const passed = sim.savedTonnes > 4.5 && sim.reductionPercentage > 50;

    results.push({
      name: 'Decarbonization Scenario Simulator (100% EV + Green Power)',
      category: 'Scenarios',
      passed,
      expected: 'Saved > 4.5 tonnes CO₂e (>50% reduction)',
      actual: `Saved ${sim.savedTonnes.toFixed(2)} tonnes (${sim.reductionPercentage.toFixed(1)}% reduction)`,
      notes: 'Validates multi-lever policy scenario delta modeling'
    });
  } catch (e: any) {
    results.push({
      name: 'Scenario Simulator',
      category: 'Scenarios',
      passed: false,
      expected: 'Valid scenario delta calculation',
      actual: `Error: ${e.message}`,
      notes: 'Execution failed'
    });
  }

  return results;
}

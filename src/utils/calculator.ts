import { 
  EmissionFactor, 
  PeriodRecord, 
  FootprintSummary, 
  CalculatedItem, 
  EmissionCategory, 
  Scope 
} from '../types/carbon';

export function findFactor(factors: EmissionFactor[], factorId: string, fallbackCategory?: EmissionCategory): EmissionFactor {
  const found = factors.find(f => f.id === factorId);
  if (found) return found;
  if (fallbackCategory) {
    const byCat = factors.find(f => f.category === fallbackCategory);
    if (byCat) return byCat;
  }
  return {
    id: 'unknown',
    category: fallbackCategory || 'transportation',
    name: 'Unspecified factor',
    scope: 1,
    value: 0,
    unit: 'unit',
    uncertaintyPercent: 20,
    source: {
      organization: 'Estimate',
      name: 'Default fallback',
      year: 2024,
      citationText: 'Default baseline factor'
    }
  };
}

export function calculateFootprint(
  record: PeriodRecord, 
  factors: EmissionFactor[]
): FootprintSummary {
  const act = record.activities;
  const items: CalculatedItem[] = [];

  // Helper to append item
  const addItem = (
    category: EmissionCategory,
    name: string,
    scope: Scope,
    amount: number,
    unit: string,
    factor: EmissionFactor,
    formulaOverride?: string,
    effectiveFactorValue?: number
  ) => {
    if (amount <= 0) return;

    const fValue = effectiveFactorValue !== undefined ? effectiveFactorValue : factor.value;
    const kg = amount * fValue;
    const uncertaintyPct = factor.uncertaintyPercent || 15;
    const minKg = Math.max(0, kg * (1 - uncertaintyPct / 100));
    const maxKg = kg * (1 + uncertaintyPct / 100);

    const formula = formulaOverride || `${amount.toLocaleString()} ${unit} × ${fValue.toFixed(4)} kg CO₂e/${factor.unit} = ${kg.toFixed(1)} kg CO₂e (±${uncertaintyPct}%)`;

    items.push({
      activityId: `${category}_${items.length + 1}`,
      category,
      name,
      scope,
      amount,
      unit,
      factorValue: fValue,
      factorUnit: factor.unit,
      kgCO2e: kg,
      uncertaintyPercent: uncertaintyPct,
      minKgCO2e: minKg,
      maxKgCO2e: maxKg,
      formula,
      sourceCitation: `${factor.source.organization} (${factor.source.year}): ${factor.source.name} [${factor.source.citationText}]`
    });
  };

  // 1. TRANSPORTATION
  const fGas = findFactor(factors, 'trans_gasoline_car', 'transportation');
  addItem('transportation', 'Gasoline Passenger Car', 1, act.gasolineCarMiles, 'miles', fGas);

  const fDiesel = findFactor(factors, 'trans_diesel_car', 'transportation');
  addItem('transportation', 'Diesel Passenger Car', 1, act.dieselCarMiles, 'miles', fDiesel);

  const fHybrid = findFactor(factors, 'trans_hybrid_car', 'transportation');
  addItem('transportation', 'Hybrid Vehicle', 1, act.hybridCarMiles, 'miles', fHybrid);

  const fEv = findFactor(factors, 'trans_ev_car', 'transportation');
  addItem('transportation', 'Electric Vehicle (EV)', 2, act.electricVehicleMiles, 'miles', fEv);

  const fBus = findFactor(factors, 'trans_transit_bus', 'transportation');
  addItem('transportation', 'Transit Bus', 3, act.busMiles, 'miles', fBus);

  const fTrain = findFactor(factors, 'trans_passenger_train', 'transportation');
  addItem('transportation', 'Passenger Train / Rail', 3, act.trainMiles, 'miles', fTrain);

  const fShortFlight = findFactor(factors, 'trans_flight_short', 'transportation');
  const rfMultiplier = act.flightRadiativeForcing ? 1.9 : 1.0;
  if (act.shortFlightsKm > 0) {
    const effectiveVal = fShortFlight.value * rfMultiplier;
    const formula = `${act.shortFlightsKm.toLocaleString()} km × ${fShortFlight.value} kg CO₂e/km${act.flightRadiativeForcing ? ' × 1.9 (DEFRA Radiative Forcing)' : ''} = ${(act.shortFlightsKm * effectiveVal).toFixed(1)} kg CO₂e (±${fShortFlight.uncertaintyPercent}%)`;
    addItem('transportation', `Short Flights (<1,000 km)${act.flightRadiativeForcing ? ' [with RF 1.9×]' : ''}`, 3, act.shortFlightsKm, 'km', fShortFlight, formula, effectiveVal);
  }

  const fLongFlight = findFactor(factors, 'trans_flight_long', 'transportation');
  if (act.longFlightsKm > 0) {
    const effectiveVal = fLongFlight.value * rfMultiplier;
    const formula = `${act.longFlightsKm.toLocaleString()} km × ${fLongFlight.value} kg CO₂e/km${act.flightRadiativeForcing ? ' × 1.9 (DEFRA Radiative Forcing)' : ''} = ${(act.longFlightsKm * effectiveVal).toFixed(1)} kg CO₂e (±${fLongFlight.uncertaintyPercent}%)`;
    addItem('transportation', `Long Flights (>3,700 km)${act.flightRadiativeForcing ? ' [with RF 1.9×]' : ''}`, 3, act.longFlightsKm, 'km', fLongFlight, formula, effectiveVal);
  }

  const fVan = findFactor(factors, 'trans_delivery_van', 'transportation');
  addItem('transportation', 'Commercial Van / Freight Miles', 1, act.businessVanMiles, 'miles', fVan);

  // 2. ELECTRICITY (Scope 2)
  const gridFactor = findFactor(factors, act.gridRegionFactorId || 'elec_us_average', 'electricity');
  if (act.electricityKwh > 0) {
    const greenDeductionFraction = Math.min(100, Math.max(0, act.greenPowerPercentage)) / 100;
    const effectiveGridKwh = act.electricityKwh * (1 - greenDeductionFraction);
    const effectiveFactorVal = gridFactor.value * (1 - greenDeductionFraction);
    const formula = `${act.electricityKwh.toLocaleString()} kWh × ${gridFactor.value} kg CO₂e/kWh × (100% - ${act.greenPowerPercentage}% Green Tariff) = ${(effectiveGridKwh * gridFactor.value).toFixed(1)} kg CO₂e (±${gridFactor.uncertaintyPercent}%)`;
    
    addItem(
      'electricity', 
      `Purchased Electricity (${gridFactor.name}${act.greenPowerPercentage > 0 ? `, ${act.greenPowerPercentage}% Green/Solar` : ''})`, 
      2, 
      act.electricityKwh, 
      'kWh', 
      gridFactor, 
      formula, 
      effectiveFactorVal
    );
  }

  // 3. HEATING & STATIONARY FUELS (Scope 1)
  const fNatGas = findFactor(factors, 'fuel_natural_gas', 'heating_fuel');
  addItem('heating_fuel', 'Piped Natural Gas', 1, act.naturalGasTherms, 'therms', fNatGas);

  const fOil = findFactor(factors, 'fuel_heating_oil', 'heating_fuel');
  addItem('heating_fuel', 'Distillate Heating Oil #2', 1, act.heatingOilGallons, 'gallons', fOil);

  const fPropane = findFactor(factors, 'fuel_propane', 'heating_fuel');
  addItem('heating_fuel', 'Propane (LPG)', 1, act.propaneGallons, 'gallons', fPropane);

  const fPellets = findFactor(factors, 'fuel_wood_pellets', 'heating_fuel');
  addItem('heating_fuel', 'Wood Biomass Pellets', 1, act.woodPelletsKg, 'kg', fPellets);

  // 4. FOOD & DIET (Scope 3) - Primarily Personal
  if (record.profileType === 'personal' || act.dietType) {
    const dietFactorId = `food_${act.dietType || 'medium_meat'}`;
    const fDiet = findFactor(factors, dietFactorId, 'food');
    
    // Diet factor is annual kg CO2e per person.
    const people = Math.max(1, record.numberOfPeopleOrEmployees || 1);
    const wasteMultiplier = 1 + (act.foodWastePercent || 0) / 100;
    const localDiscount = act.localFoodFactor ? 0.95 : 1.0;
    const effectiveDietKg = fDiet.value * people * wasteMultiplier * localDiscount;
    const effectivePerPerson = (fDiet.value * wasteMultiplier * localDiscount);

    const formula = `${people} person(s) × ${fDiet.value} kg CO₂e/yr × ${wasteMultiplier.toFixed(2)} (Waste +${act.foodWastePercent}%) ${act.localFoodFactor ? '× 0.95 (Local Food Discount)' : ''} = ${effectiveDietKg.toFixed(1)} kg CO₂e (±${fDiet.uncertaintyPercent}%)`;

    addItem(
      'food', 
      `Dietary Footprint (${fDiet.name})`, 
      3, 
      people, 
      'person(s)', 
      fDiet, 
      formula, 
      effectivePerPerson
    );
  }

  // 5. SMALL BUSINESS OPERATIONS (Scope 3 & HVAC Scope 1/2)
  if (record.profileType === 'business' || act.officeSqFt > 0 || act.commuteEmployees > 0) {
    // HVAC energy
    if (act.hvacEnergyKwh > 0) {
      const fHvac = findFactor(factors, act.gridRegionFactorId || 'elec_us_average', 'electricity');
      addItem('business', 'HVAC Space Conditioning / Cooling', 2, act.hvacEnergyKwh, 'kWh', fHvac);
    }

    // Employee Commute
    const totalCommuteMiles = (act.commuteEmployees || 0) * (act.commuteAvgMilesPerDay || 0) * (act.commuteWorkDaysPerYear || 0);
    if (totalCommuteMiles > 0) {
      const fCommute = findFactor(factors, 'biz_employee_commute', 'business');
      const formula = `${act.commuteEmployees} staff × ${act.commuteAvgMilesPerDay} mi/day × ${act.commuteWorkDaysPerYear} days (${totalCommuteMiles.toLocaleString()} total mi) × ${fCommute.value} kg CO₂e/mi = ${(totalCommuteMiles * fCommute.value).toFixed(1)} kg CO₂e (±${fCommute.uncertaintyPercent}%)`;
      addItem('business', 'Staff Daily Commute (GHG Scope 3 Cat 7)', 3, totalCommuteMiles, 'miles', fCommute, formula);
    }

    // Cloud Computing
    if (act.cloudComputeHours > 0) {
      const fCloud = findFactor(factors, 'biz_cloud_compute', 'business');
      addItem('business', 'Cloud Infrastructure & Compute', 3, act.cloudComputeHours, 'vCPU-hours', fCloud);
    }

    // Office supplies spend
    if (act.paperAndSuppliesSpendUsd > 0) {
      const fSupplies = findFactor(factors, 'biz_office_supplies', 'business');
      addItem('business', 'Office Supplies, Paper & IT Hardware (USEEIO spend)', 3, act.paperAndSuppliesSpendUsd, 'USD', fSupplies);
    }

    // Shipping packages
    if (act.shippingPackagesCount > 0) {
      const fShipping = findFactor(factors, 'biz_shipping_parcel', 'business');
      addItem('business', 'Outbound Parcel & Freight Deliveries', 3, act.shippingPackagesCount, 'parcels', fShipping);
    }
  }

  // Calculate Aggregations
  let totalKgCO2e = 0;
  let varianceSum = 0;

  const byScope = {
    scope1Kg: 0,
    scope2Kg: 0,
    scope3Kg: 0,
    scope1Tonnes: 0,
    scope2Tonnes: 0,
    scope3Tonnes: 0
  };

  const byCategory: Record<EmissionCategory, { kgCO2e: number; tonnesCO2e: number; percentage: number }> = {
    transportation: { kgCO2e: 0, tonnesCO2e: 0, percentage: 0 },
    electricity: { kgCO2e: 0, tonnesCO2e: 0, percentage: 0 },
    heating_fuel: { kgCO2e: 0, tonnesCO2e: 0, percentage: 0 },
    food: { kgCO2e: 0, tonnesCO2e: 0, percentage: 0 },
    business: { kgCO2e: 0, tonnesCO2e: 0, percentage: 0 }
  };

  for (const it of items) {
    totalKgCO2e += it.kgCO2e;
    
    // IPCC Quadrature error propagation
    const stdDev = it.kgCO2e * (it.uncertaintyPercent / 100);
    varianceSum += (stdDev * stdDev);

    if (it.scope === 1) byScope.scope1Kg += it.kgCO2e;
    else if (it.scope === 2) byScope.scope2Kg += it.kgCO2e;
    else if (it.scope === 3) byScope.scope3Kg += it.kgCO2e;

    if (byCategory[it.category]) {
      byCategory[it.category].kgCO2e += it.kgCO2e;
    }
  }

  byScope.scope1Tonnes = byScope.scope1Kg / 1000;
  byScope.scope2Tonnes = byScope.scope2Kg / 1000;
  byScope.scope3Tonnes = byScope.scope3Kg / 1000;

  const totalTonnesCO2e = totalKgCO2e / 1000;
  const combinedUncertaintyKg = Math.sqrt(varianceSum);
  const minTonnesCO2e = Math.max(0, (totalKgCO2e - combinedUncertaintyKg) / 1000);
  const maxTonnesCO2e = (totalKgCO2e + combinedUncertaintyKg) / 1000;

  for (const cat of Object.keys(byCategory) as EmissionCategory[]) {
    byCategory[cat].tonnesCO2e = byCategory[cat].kgCO2e / 1000;
    byCategory[cat].percentage = totalKgCO2e > 0 ? (byCategory[cat].kgCO2e / totalKgCO2e) * 100 : 0;
  }

  return {
    totalKgCO2e,
    totalTonnesCO2e,
    minTonnesCO2e,
    maxTonnesCO2e,
    byScope,
    byCategory,
    items
  };
}

export function simulateScenario(
  baselineRecord: PeriodRecord,
  scenarios: {
    greenElectricity: boolean;
    evVehicleShiftPercent: number; // 0 to 100%
    remoteWorkDaysPerWeek: number; // 0 to 5
    lowCarbonDiet: boolean;
    heatPumpAdoption: boolean; // Replaces 80% natural gas with efficient heat pump
    reduceFlightsPercent: number; // 0 to 100%
  },
  factors: EmissionFactor[]
): {
  scenarioRecord: PeriodRecord;
  scenarioSummary: FootprintSummary;
  baselineSummary: FootprintSummary;
  savedTonnes: number;
  reductionPercentage: number;
  treesEquivalent: number;
  gasolineGallonsAvoided: number;
} {
  const mod: PeriodRecord = JSON.parse(JSON.stringify(baselineRecord));
  const bAct = mod.activities;

  // 1. Green electricity
  if (scenarios.greenElectricity) {
    bAct.greenPowerPercentage = 100;
  }

  // 2. EV vehicle shift
  if (scenarios.evVehicleShiftPercent > 0) {
    const shiftFrac = scenarios.evVehicleShiftPercent / 100;
    const shiftedGasMiles = bAct.gasolineCarMiles * shiftFrac;
    const shiftedDieselMiles = bAct.dieselCarMiles * shiftFrac;

    bAct.gasolineCarMiles -= shiftedGasMiles;
    bAct.dieselCarMiles -= shiftedDieselMiles;
    bAct.electricVehicleMiles += (shiftedGasMiles + shiftedDieselMiles);
  }

  // 3. Remote work days
  if (scenarios.remoteWorkDaysPerWeek > 0 && bAct.commuteWorkDaysPerYear > 0) {
    // Normal is 5 days/week => fraction saved = remoteDays / 5
    const reductionFrac = Math.min(1, scenarios.remoteWorkDaysPerWeek / 5);
    bAct.commuteWorkDaysPerYear = Math.max(0, Math.round(bAct.commuteWorkDaysPerYear * (1 - reductionFrac)));
  }

  // 4. Low-carbon diet
  if (scenarios.lowCarbonDiet) {
    if (bAct.dietType === 'heavy_meat' || bAct.dietType === 'medium_meat') {
      bAct.dietType = 'low_meat';
    }
  }

  // 5. Heat pump conversion
  if (scenarios.heatPumpAdoption && bAct.naturalGasTherms > 0) {
    // 1 therm = 29.3 kWh heat. A cold-climate heat pump has COP ~ 3.2.
    // Electricity needed = (therms * 29.3) / 3.2 kWh
    const replacedTherms = bAct.naturalGasTherms * 0.85; // 85% heat replaced
    bAct.naturalGasTherms -= replacedTherms;
    const heatPumpElecKwh = (replacedTherms * 29.3) / 3.2;
    bAct.electricityKwh += Math.round(heatPumpElecKwh);
  }

  // 6. Reduce flights
  if (scenarios.reduceFlightsPercent > 0) {
    const keepFrac = 1 - (scenarios.reduceFlightsPercent / 100);
    bAct.shortFlightsKm = Math.round(bAct.shortFlightsKm * keepFrac);
    bAct.longFlightsKm = Math.round(bAct.longFlightsKm * keepFrac);
  }

  const baselineSummary = calculateFootprint(baselineRecord, factors);
  const scenarioSummary = calculateFootprint(mod, factors);

  const savedTonnes = Math.max(0, baselineSummary.totalTonnesCO2e - scenarioSummary.totalTonnesCO2e);
  const reductionPercentage = baselineSummary.totalTonnesCO2e > 0
    ? (savedTonnes / baselineSummary.totalTonnesCO2e) * 100
    : 0;

  // Equivalencies (EPA Greenhouse Gas Equivalencies Calculator)
  // 1 tree seedling grown for 10 years absorbs ~0.06 t CO2 (~60 kg)
  // 1 gallon of gasoline = ~8.887 kg CO2 = ~0.00889 t CO2
  const treesEquivalent = Math.round(savedTonnes * 16.5);
  const gasolineGallonsAvoided = Math.round((savedTonnes * 1000) / 8.887);

  return {
    scenarioRecord: mod,
    scenarioSummary,
    baselineSummary,
    savedTonnes,
    reductionPercentage,
    treesEquivalent,
    gasolineGallonsAvoided
  };
}

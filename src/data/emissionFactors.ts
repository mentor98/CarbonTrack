import { EmissionFactor, Benchmark } from '../types/carbon';

export const DEFAULT_EMISSION_FACTORS: EmissionFactor[] = [
  // ==========================================
  // TRANSPORTATION (Scope 1 for owned, Scope 3 for travel)
  // ==========================================
  {
    id: 'trans_gasoline_car',
    category: 'transportation',
    name: 'Passenger Car - Gasoline (Avg)',
    scope: 1,
    value: 0.385,
    unit: 'mile',
    uncertaintyPercent: 12,
    source: {
      organization: 'US EPA',
      name: 'Emission Factors for Greenhouse Gas Inventories',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA GHG Hub Table 8: Mobile Combustion GHG (Passenger Car, 24.2 MPG fleet avg).'
    },
    notes: 'Based on average US passenger car fleet fuel economy. Tailpipe combustion CO2, CH4, and N2O included.'
  },
  {
    id: 'trans_diesel_car',
    category: 'transportation',
    name: 'Passenger Car - Diesel',
    scope: 1,
    value: 0.404,
    unit: 'mile',
    uncertaintyPercent: 12,
    source: {
      organization: 'UK DESNZ / DEFRA',
      name: 'Greenhouse Gas Reporting: Conversion Factors',
      year: 2024,
      url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
      citationText: 'UK Government GHG Conversion Factors 2024 (Passenger vehicles - Diesel average).'
    },
    notes: 'Direct tailpipe emissions for diesel passenger car.'
  },
  {
    id: 'trans_hybrid_car',
    category: 'transportation',
    name: 'Passenger Car - Hybrid (HEV)',
    scope: 1,
    value: 0.220,
    unit: 'mile',
    uncertaintyPercent: 15,
    source: {
      organization: 'US EPA',
      name: 'Automotive Trends Report & GHG Inventory',
      year: 2024,
      url: 'https://www.epa.gov/automotive-trends',
      citationText: 'EPA Table of Hybrid Electric Vehicle average carbon intensity (~45-50 MPG equivalent).'
    },
    notes: 'Standard gasoline-electric hybrid vehicle emissions.'
  },
  {
    id: 'trans_ev_car',
    category: 'transportation',
    name: 'Electric Vehicle (EV) - Grid Charged',
    scope: 2,
    value: 0.092,
    unit: 'mile',
    uncertaintyPercent: 20,
    source: {
      organization: 'US Department of Energy (AFDC)',
      name: 'Alternative Fuels Data Center - Emissions from Hybrid and Plug-In Electric Vehicles',
      year: 2024,
      url: 'https://afdc.energy.gov/vehicles/electric_emissions.html',
      citationText: 'DOE AFDC average US grid electricity consumption for BEV (0.30 kWh/mile @ US average grid factor).'
    },
    notes: 'Indirect Scope 2 emissions based on 0.30 kWh/mi efficiency powered by average grid electricity.'
  },
  {
    id: 'trans_transit_bus',
    category: 'transportation',
    name: 'Local Transit Bus',
    scope: 3,
    value: 0.160,
    unit: 'mile',
    uncertaintyPercent: 25,
    source: {
      organization: 'Federal Transit Administration / EPA',
      name: 'National Transit Database & EPA GHG Hub',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA GHG Hub Table 8 (Public Transit Bus per passenger-mile with average occupancy).'
    },
    notes: 'Allocated per passenger-mile considering average urban passenger loading.'
  },
  {
    id: 'trans_passenger_train',
    category: 'transportation',
    name: 'Commuter / Intercity Rail',
    scope: 3,
    value: 0.115,
    unit: 'mile',
    uncertaintyPercent: 20,
    source: {
      organization: 'US EPA',
      name: 'Emission Factors for GHG Inventories',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA GHG Hub: Intercity rail / commuter rail per passenger-mile.'
    },
    notes: 'Average electric and diesel passenger train operations.'
  },
  {
    id: 'trans_flight_short',
    category: 'transportation',
    name: 'Domestic / Short-Haul Flight (< 1,000 km)',
    scope: 3,
    value: 0.245,
    unit: 'km',
    uncertaintyPercent: 18,
    source: {
      organization: 'UK DESNZ / DEFRA',
      name: 'Greenhouse gas reporting: conversion factors',
      year: 2024,
      url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024',
      citationText: 'DEFRA 2024: Domestic aviation passenger-km (economy class, without RF multiplier).'
    },
    notes: 'Higher per-km emissions due to taxi, takeoff, and climb phases.'
  },
  {
    id: 'trans_flight_long',
    category: 'transportation',
    name: 'Long-Haul Flight (> 3,700 km)',
    scope: 3,
    value: 0.147,
    unit: 'km',
    uncertaintyPercent: 18,
    source: {
      organization: 'UK DESNZ / DEFRA',
      name: 'Greenhouse gas reporting: conversion factors',
      year: 2024,
      url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024',
      citationText: 'DEFRA 2024: Long-haul international aviation passenger-km (economy class).'
    },
    notes: 'Cruise altitude efficiency is higher per km than short flights.'
  },
  {
    id: 'trans_delivery_van',
    category: 'transportation',
    name: 'Commercial Delivery Van (Class 2)',
    scope: 1,
    value: 0.540,
    unit: 'mile',
    uncertaintyPercent: 15,
    source: {
      organization: 'US EPA',
      name: 'GHG Emission Factors Hub',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA Table 8: Light-duty trucks and commercial delivery vans.'
    },
    notes: 'Standard diesel or gasoline parcel/delivery van.'
  },

  // ==========================================
  // ELECTRICITY (Scope 2)
  // ==========================================
  {
    id: 'elec_us_average',
    category: 'electricity',
    name: 'Electricity - US National Grid Average',
    scope: 2,
    value: 0.388,
    unit: 'kWh',
    uncertaintyPercent: 10,
    source: {
      organization: 'US EPA',
      name: 'eGRID 2024 Summary Tables',
      year: 2024,
      url: 'https://www.epa.gov/egrid',
      citationText: 'EPA eGRID2024 US average output emission rate (855.4 lb CO2e/MWh = 0.388 kg CO2e/kWh).'
    },
    notes: 'Includes line losses for delivered electricity.'
  },
  {
    id: 'elec_us_california',
    category: 'electricity',
    name: 'Electricity - US California (CAMX Subregion)',
    scope: 2,
    value: 0.210,
    unit: 'kWh',
    uncertaintyPercent: 12,
    source: {
      organization: 'US EPA',
      name: 'eGRID 2024 CAMX Subregion',
      year: 2024,
      url: 'https://www.epa.gov/egrid',
      citationText: 'EPA eGRID2024 WECC California subregion output emission rate.'
    },
    notes: 'Cleaner grid with high solar, wind, and hydro penetration.'
  },
  {
    id: 'elec_us_midwest',
    category: 'electricity',
    name: 'Electricity - US Midwest (MROW Coal/Gas)',
    scope: 2,
    value: 0.530,
    unit: 'kWh',
    uncertaintyPercent: 10,
    source: {
      organization: 'US EPA',
      name: 'eGRID 2024 MROW Subregion',
      year: 2024,
      url: 'https://www.epa.gov/egrid',
      citationText: 'EPA eGRID2024 MRO West regional grid average.'
    },
    notes: 'Higher fossil fuel mix (coal and natural gas).'
  },
  {
    id: 'elec_uk_grid',
    category: 'electricity',
    name: 'Electricity - United Kingdom National Grid',
    scope: 2,
    value: 0.207,
    unit: 'kWh',
    uncertaintyPercent: 8,
    source: {
      organization: 'UK DESNZ',
      name: 'UK Government GHG Conversion Factors',
      year: 2024,
      url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
      citationText: 'DESNZ 2024: Electricity supplied from the national transmission & distribution grid.'
    },
    notes: 'Includes transmission & distribution (T&D) losses.'
  },
  {
    id: 'elec_eu_average',
    category: 'electricity',
    name: 'Electricity - European Union (EU-27 Average)',
    scope: 2,
    value: 0.230,
    unit: 'kWh',
    uncertaintyPercent: 12,
    source: {
      organization: 'European Environment Agency (EEA)',
      name: 'Greenhouse gas emission intensity of electricity generation',
      year: 2024,
      url: 'https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emission-intensity-of-electricity-generation-in-europe',
      citationText: 'EEA Indicator 2024: EU-27 aggregate grid carbon intensity.'
    },
    notes: 'Average across 27 EU member states.'
  },
  {
    id: 'elec_green_zero',
    category: 'electricity',
    name: 'Electricity - 100% Certified Green / On-Site Solar',
    scope: 2,
    value: 0.000,
    unit: 'kWh',
    uncertaintyPercent: 0,
    source: {
      organization: 'GHG Protocol',
      name: 'Scope 2 Guidance (Market-based Method)',
      year: 2024,
      url: 'https://ghgprotocol.org/scope_2_guidance',
      citationText: 'GHG Protocol Scope 2 Market-Based Accounting for bundled RECs and solar PPA.'
    },
    notes: 'Market-based reporting: 0 emissions when supported by retired contractual instruments.'
  },

  // ==========================================
  // HEATING & FUEL (Scope 1)
  // ==========================================
  {
    id: 'fuel_natural_gas',
    category: 'heating_fuel',
    name: 'Natural Gas (Piped)',
    scope: 1,
    value: 5.306,
    unit: 'therm',
    uncertaintyPercent: 5,
    source: {
      organization: 'US EPA',
      name: 'Emission Factors for GHG Inventories',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA Table 1: Stationary Combustion (0.05306 kg CO2e / scf, 5.306 kg CO2e / therm).'
    },
    notes: '1 therm = 100,000 BTU ~ 29.3 kWh. Direct combustion.'
  },
  {
    id: 'fuel_heating_oil',
    category: 'heating_fuel',
    name: 'Heating Oil (Distillate Fuel Oil #2)',
    scope: 1,
    value: 10.21,
    unit: 'gallon',
    uncertaintyPercent: 6,
    source: {
      organization: 'US EPA',
      name: 'Emission Factors for GHG Inventories',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA Table 1: Distillate Fuel Oil No. 2 (10.21 kg CO2e / gallon).'
    },
    notes: 'Common residential and commercial space heating fuel.'
  },
  {
    id: 'fuel_propane',
    category: 'heating_fuel',
    name: 'Propane / LPG',
    scope: 1,
    value: 5.72,
    unit: 'gallon',
    uncertaintyPercent: 6,
    source: {
      organization: 'US EPA',
      name: 'Emission Factors for GHG Inventories',
      year: 2024,
      url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
      citationText: 'EPA Table 1: Propane combustion (5.72 kg CO2e / gallon).'
    },
    notes: 'Liquefied petroleum gas used for heating and cooking.'
  },
  {
    id: 'fuel_wood_pellets',
    category: 'heating_fuel',
    name: 'Wood Biomass Pellets',
    scope: 1,
    value: 0.038,
    unit: 'kg',
    uncertaintyPercent: 25,
    source: {
      organization: 'UK DESNZ / DEFRA',
      name: 'Greenhouse gas reporting: conversion factors',
      year: 2024,
      url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024',
      citationText: 'DEFRA 2024: Wood pellets (fossil CO2e non-biogenic lifecycle portion).'
    },
    notes: 'Represents fossil upstream processing & transport; biogenic CO2 reported separately per GHG Protocol.'
  },

  // ==========================================
  // FOOD & DIET (Scope 3)
  // ==========================================
  {
    id: 'food_heavy_meat',
    category: 'food',
    name: 'Diet - High Meat Consumer (>100g/day red meat)',
    scope: 3,
    value: 3300,
    unit: 'year',
    uncertaintyPercent: 20,
    source: {
      organization: 'Scarborough et al. / Nature Food',
      name: 'Vegans, vegetarians, fish-eaters and meat-eaters in the UK',
      year: 2023,
      url: 'https://www.nature.com/articles/s43016-023-00795-w',
      citationText: 'Nature Food (2023): Dietary greenhouse gas emissions of meat-eaters (3.3 t CO2e/year).'
    },
    notes: 'Full cradle-to-farm-gate lifecycle emissions including ruminant enteric fermentation (methane).'
  },
  {
    id: 'food_medium_meat',
    category: 'food',
    name: 'Diet - Medium Meat Consumer (Average Western Diet)',
    scope: 3,
    value: 2500,
    unit: 'year',
    uncertaintyPercent: 20,
    source: {
      organization: 'Scarborough et al. / Nature Food',
      name: 'Dietary emissions across dietary patterns',
      year: 2023,
      url: 'https://www.nature.com/articles/s43016-023-00795-w',
      citationText: 'Nature Food (2023): Medium meat consumer diet ~2.5 t CO2e/year (~6.8 kg CO2e/day).'
    },
    notes: 'Standard mixed omnivore diet.'
  },
  {
    id: 'food_low_meat',
    category: 'food',
    name: 'Diet - Low Meat / Flexitarian (<50g/day)',
    scope: 3,
    value: 1700,
    unit: 'year',
    uncertaintyPercent: 20,
    source: {
      organization: 'Scarborough et al. / Poore & Nemecek',
      name: 'Science (2018) & Nature Food (2023)',
      year: 2023,
      citationText: 'Poore & Nemecek Science 2018 / Nature Food 2023: Low meat intake diet.'
    },
    notes: 'Plant-forward diet with occasional meat or poultry.'
  },
  {
    id: 'food_pescatarian',
    category: 'food',
    name: 'Diet - Pescatarian (Fish & Vegetarian)',
    scope: 3,
    value: 1400,
    unit: 'year',
    uncertaintyPercent: 20,
    source: {
      organization: 'Nature Food',
      name: 'Dietary Greenhouse Gas Emissions Analysis',
      year: 2023,
      citationText: 'Nature Food (2023): Pescatarian pattern ~1.4 t CO2e/year.'
    },
    notes: 'Excludes land animal meats; includes seafood and dairy.'
  },
  {
    id: 'food_vegetarian',
    category: 'food',
    name: 'Diet - Vegetarian (Dairy & Eggs, No Meat)',
    scope: 3,
    value: 1200,
    unit: 'year',
    uncertaintyPercent: 20,
    source: {
      organization: 'Nature Food',
      name: 'Dietary Patterns Comparative LCA',
      year: 2023,
      citationText: 'Nature Food (2023): Vegetarian dietary emissions ~1.2 t CO2e/year.'
    },
    notes: 'Plant-based diet including dairy and poultry eggs.'
  },
  {
    id: 'food_vegan',
    category: 'food',
    name: 'Diet - Fully Plant-Based (Vegan)',
    scope: 3,
    value: 1000,
    unit: 'year',
    uncertaintyPercent: 20,
    source: {
      organization: 'Nature Food / Science',
      name: 'Environmental impacts of food production',
      year: 2023,
      citationText: 'Poore & Nemecek Science 2018 / Nature Food 2023: Vegan diet ~1.0 t CO2e/year.'
    },
    notes: '100% plant-derived diet with minimal agricultural methane/nitrous oxide.'
  },

  // ==========================================
  // BUSINESS OPERATIONS & SUPPLY CHAIN (Scope 3)
  // ==========================================
  {
    id: 'biz_employee_commute',
    category: 'business',
    name: 'Employee Commuting (Mixed Mode Avg)',
    scope: 3,
    value: 0.320,
    unit: 'mile',
    uncertaintyPercent: 25,
    source: {
      organization: 'GHG Protocol / EPA',
      name: 'Technical Guidance for Calculating Scope 3 Emissions (Category 7)',
      year: 2024,
      url: 'https://ghgprotocol.org/scope-3-calculation-guidance',
      citationText: 'GHG Protocol Category 7: Employee Commute blended passenger vehicle/transit factor.'
    },
    notes: 'Weighted average of vehicle and transit commuting modes per employee-mile.'
  },
  {
    id: 'biz_cloud_compute',
    category: 'business',
    name: 'Cloud Computing (1 vCPU-Hour)',
    scope: 3,
    value: 0.0022,
    unit: 'hour',
    uncertaintyPercent: 30,
    source: {
      organization: 'Cloud Carbon Footprint / Etsy Tech LCA',
      name: 'Cloud Carbon Footprint Methodology',
      year: 2024,
      url: 'https://www.cloudcarbonfootprint.org/docs/methodology',
      citationText: 'CCF methodology: Average cloud instance 1 vCPU @ 50% utilization + PUE 1.15.'
    },
    notes: 'Estimated datacenter server electricity consumption and embodied manufacturing footprint.'
  },
  {
    id: 'biz_office_supplies',
    category: 'business',
    name: 'Office Supplies & Hardware ($ Spend-based)',
    scope: 3,
    value: 0.180,
    unit: 'USD',
    uncertaintyPercent: 35,
    source: {
      organization: 'US EPA',
      name: 'Supply Chain Greenhouse Gas Emission Factors for US Industries (USEEIO v2.0)',
      year: 2024,
      url: 'https://www.epa.gov/land-research/us-environmentally-extended-input-output-useeio-technical-content',
      citationText: 'USEEIO v2.0: Office supplies, paper, and computer peripheral spend factor.'
    },
    notes: 'Top-down input-output economic model; high uncertainty inherent to monetary spend modeling.'
  },
  {
    id: 'biz_shipping_parcel',
    category: 'business',
    name: 'Courier / Parcel Shipping (Ground Domestic)',
    scope: 3,
    value: 0.850,
    unit: 'package',
    uncertaintyPercent: 25,
    source: {
      organization: 'DEFRA / Freight Transport Association',
      name: 'Logistics Carbon Emissions Model',
      year: 2024,
      url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024',
      citationText: 'DEFRA 2024 Freight / Parcel delivery average ~2.5 kg parcel ground transport.'
    },
    notes: 'Average door-to-door parcel delivery via regional hub-and-spoke ground network.'
  }
];

export const BENCHMARKS: Benchmark[] = [
  {
    id: 'paris_2030',
    title: 'Paris Agreement 1.5°C Budget',
    type: 'personal',
    tonnesCO2e: 2.0,
    description: 'Target per capita global annual emissions by 2030 to limit global warming to 1.5°C.',
    source: 'IPCC Special Report on Global Warming of 1.5°C / UNEP Emissions Gap Report'
  },
  {
    id: 'world_avg',
    title: 'World Citizen Average',
    type: 'personal',
    tonnesCO2e: 4.7,
    description: 'Global average greenhouse gas emissions per person per year.',
    source: 'Our World in Data / Global Carbon Project (2023)'
  },
  {
    id: 'uk_avg',
    title: 'United Kingdom Average',
    type: 'personal',
    tonnesCO2e: 5.2,
    description: 'UK per capita consumption-based territorial greenhouse gas footprint.',
    source: 'UK Department for Energy Security and Net Zero (2024)'
  },
  {
    id: 'eu_avg',
    title: 'European Union Average',
    type: 'personal',
    tonnesCO2e: 6.8,
    description: 'EU-27 per capita greenhouse gas emissions per person.',
    source: 'Eurostat / European Environment Agency (2024)'
  },
  {
    id: 'us_avg',
    title: 'United States Average',
    type: 'personal',
    tonnesCO2e: 14.4,
    description: 'US per capita annual greenhouse gas emissions (highest among large economies).',
    source: 'US EPA / World Bank Climate Indicators (2023)'
  },
  // Small business benchmarks
  {
    id: 'biz_tech_services',
    title: 'Digital / Tech Agency (Per Employee)',
    type: 'business',
    tonnesCO2e: 1.8,
    description: 'Standard office & remote software/creative small business annual footprint per full-time staff.',
    source: 'SBTi Small and Medium Enterprises (SME) Sector Benchmarks'
  },
  {
    id: 'biz_retail_cafe',
    title: 'Retail / Café (Per Employee)',
    type: 'business',
    tonnesCO2e: 4.8,
    description: 'Physical small business with refrigeration, cooking, customer HVAC and packaging.',
    source: 'Carbon Trust Small Business Energy Efficiency Benchmarks'
  },
  {
    id: 'biz_light_mfg',
    title: 'Light Manufacturing (Per Employee)',
    type: 'business',
    tonnesCO2e: 12.5,
    description: 'Workshop, assembly, or physical product creation with machinery and higher freight.',
    source: 'EPA Climate Leaders Small Business Guidance'
  }
];

export const INITIAL_PRESETS: Record<string, { label: string; description: string; period: any }> = {
  urban_renter: {
    label: 'Urban Renter / Apartment',
    description: 'Single individual in a city apartment, public transit user, no personal car, flexitarian.',
    period: {
      label: 'Urban Individual (2024)',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 1,
      activities: {
        gasolineCarMiles: 0,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 800,
        trainMiles: 2400,
        shortFlightsKm: 1200,
        longFlightsKm: 0,
        flightRadiativeForcing: true,
        businessVanMiles: 0,
        electricityKwh: 2200,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 80,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'low_meat',
        foodWastePercent: 15,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 24
      }
    }
  },
  suburban_family: {
    label: 'Suburban Family (Household of 3)',
    description: 'Household with 2 cars (gasoline & hybrid), detached home, natural gas heating, standard diet.',
    period: {
      label: 'Suburban Household (2024)',
      profileType: 'personal',
      numberOfPeopleOrEmployees: 3,
      activities: {
        gasolineCarMiles: 9000,
        dieselCarMiles: 0,
        hybridCarMiles: 5000,
        electricVehicleMiles: 0,
        busMiles: 150,
        trainMiles: 300,
        shortFlightsKm: 2000,
        longFlightsKm: 5000,
        flightRadiativeForcing: true,
        businessVanMiles: 0,
        electricityKwh: 8400,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 650,
        heatingOilGallons: 0,
        propaneGallons: 20,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 20,
        localFoodFactor: false,
        officeSqFt: 0,
        hvacEnergyKwh: 0,
        commuteEmployees: 0,
        commuteAvgMilesPerDay: 0,
        commuteWorkDaysPerYear: 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 65
      }
    }
  },
  small_agency: {
    label: 'Digital Agency (8 Staff)',
    description: 'Small consulting/software team with leased office space, cloud compute, hybrid commuting.',
    period: {
      label: 'Design Studio LLC (2024)',
      profileType: 'business',
      organizationName: 'Design Studio LLC',
      numberOfPeopleOrEmployees: 8,
      squareFootage: 2200,
      activities: {
        gasolineCarMiles: 1200,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 3500,
        longFlightsKm: 8000,
        flightRadiativeForcing: true,
        businessVanMiles: 0,
        electricityKwh: 9200,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 25,
        naturalGasTherms: 220,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 10,
        localFoodFactor: false,
        officeSqFt: 2200,
        hvacEnergyKwh: 3400,
        commuteEmployees: 8,
        commuteAvgMilesPerDay: 14,
        commuteWorkDaysPerYear: 140, // 3 days/wk hybrid
        cloudComputeHours: 12000,
        paperAndSuppliesSpendUsd: 4500,
        shippingPackagesCount: 80
      }
    }
  },
  retail_cafe: {
    label: 'Neighborhood Café & Bakery (5 Staff)',
    description: 'Physical small retail venue with commercial refrigeration, espresso machines, delivery van.',
    period: {
      label: 'Artisan Roast Café (2024)',
      profileType: 'business',
      organizationName: 'Artisan Roast Café',
      numberOfPeopleOrEmployees: 5,
      squareFootage: 1600,
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
        businessVanMiles: 3800,
        electricityKwh: 24000,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: 950,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 15,
        localFoodFactor: false,
        officeSqFt: 1600,
        hvacEnergyKwh: 6500,
        commuteEmployees: 5,
        commuteAvgMilesPerDay: 8,
        commuteWorkDaysPerYear: 260,
        cloudComputeHours: 200,
        paperAndSuppliesSpendUsd: 8500,
        shippingPackagesCount: 150
      }
    }
  }
};

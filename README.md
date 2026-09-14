# CarbonTrack — Personal & Small-Business Carbon Calculator

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![GHG Protocol](https://img.shields.io/badge/Standard-GHG_Protocol_Scope_1%2C2%2C3-green.svg)](https://ghgprotocol.org/)

CarbonTrack is an open-source, mathematically transparent carbon footprint estimation platform designed for individuals, households, and small-to-medium enterprises (SMEs). 

Many people and small organizations want to understand and reduce their climate impact, but are confronted either with simplistic black-box calculators or expensive enterprise ESG software. CarbonTrack bridges this gap by providing an audit-grade, fully configurable calculator that exposes every formula, cites authoritative emission-factor sources, models uncertainties, and enables interactive "what-if" decarbonization scenario planning.

---

## 📖 Table of Contents

1. [Core Principles](#-core-principles)
2. [Calculation Methodology & Standards](#-calculation-methodology--standards)
   - [GHG Protocol Scopes Breakdown](#ghg-protocol-scopes-breakdown)
   - [Aviation Radiative Forcing (RF)](#aviation-radiative-forcing-rf)
   - [IPCC Uncertainty & Error Propagation](#ipcc-uncertainty--error-propagation)
3. [Data Model](#-data-model)
4. [Configurable Emission Factors & Sources](#-configurable-emission-factors--sources)
5. [Architecture & Component Hierarchy](#-architecture--component-hierarchy)
6. [Setup & Local Development](#-setup--local-development)
7. [Testing & Verification](#-testing--verification)
8. [Limitations & Non-Exactness Notice](#-limitations--non-exactness-notice)
9. [Contributing](#-contributing)
10. [License](#-license)

---

## 🎯 Core Principles

1. **Strict Methodological Transparency**: Every number has an audit trail. Users can inspect the exact arithmetic equation, activity data, and emission factor citation for every single calculation item.
2. **Never Pretend Estimates are Exact Measurements**: Carbon accounting relies on activity proxies and secondary emission coefficients. CarbonTrack explicitly computes statistical 90% confidence intervals ($CI_{90}$) to communicate real-world uncertainty bounds.
3. **Open & Configurable**: Preloaded with US EPA, UK DESNZ/DEFRA, and IPCC AR6 datasets. All factors can be customized, overridden, added, or reset by the user.
4. **Action-Oriented Scenario Modeling**: Beyond passive calculation, the interactive "What-If" simulator computes tangible reductions across vehicle electrification, renewable electricity tariffs, remote work policies, and dietary transitions.

---

## 🔬 Calculation Methodology & Standards

Emissions are estimated using the standard greenhouse gas accounting formulation:

$$\text{Emissions } (\text{kg CO}_2\text{e}) = \text{Activity Data} \times \text{Emission Factor} \times \text{GWP} \times \text{Adjustment Multipliers}$$

Where:
- **Activity Data**: Quantified user consumption (e.g., miles driven, kWh electricity consumed, therms gas combusted, headcount, diet category).
- **Emission Factor**: Mass of greenhouse gas emitted per activity unit (e.g., $\text{kg CO}_2\text{e} / \text{kWh}$).
- **Global Warming Potential (GWP)**: 100-year metric values according to IPCC Sixth Assessment Report (AR6):
  - Carbon Dioxide ($\text{CO}_2$): $1$
  - Methane ($\text{CH}_4$): $27.9 - 29.8$
  - Nitrous Oxide ($\text{N}_2\text{O}$): $273$

### GHG Protocol Scopes Breakdown

- **Scope 1 (Direct Emissions)**:
  - Mobile combustion from owned/leased vehicles (Gasoline, Diesel, Hybrid passenger cars, Commercial delivery vans).
  - Stationary combustion from on-site heating and fuels (Piped natural gas, Fuel oil #2, Propane / LPG, Wood pellets).
- **Scope 2 (Indirect Energy Emissions)**:
  - Purchased grid electricity consumption (location-based regional factors: US National Average, CAMX California, MROW Midwest, UK Grid, EU-27 Average, etc.).
  - Market-based renewable adjustments: Contractual green power tariffs, Community Solar, or retired Renewable Energy Certificates (RECs) reduce effective grid Scope 2 emissions toward 0.
- **Scope 3 (Value Chain / Other Indirect Emissions)**:
  - Category 6 (Business & Personal Travel): Commercial aviation (short-haul and long-haul).
  - Category 7 (Employee Commuting): Staff headcount $\times$ commute distance $\times$ annual working days.
  - Category 1 (Purchased Goods & Services): Spend-based economic input-output modeling (USEEIO v2.0) for office supplies and IT hardware.
  - Category 4/9 (Transportation & Distribution): Parcel delivery and logistics shipping.
  - Diet & Household Consumption: Lifecycle dietary emissions adjusted for domestic food waste percentage.

### Aviation Radiative Forcing (RF)

High-altitude aircraft combustion produces non-$\text{CO}_2$ climate effects including nitrogen oxides ($\text{NO}_x$), water vapor, soot, and aviation-induced contrails/cirrus clouds. Following UK DESNZ / DEFRA aviation guidance and IPCC aviation assessments, CarbonTrack includes a toggleable **$1.9\times$ Radiative Forcing multiplier** to capture high-altitude net warming impacts.

### IPCC Uncertainty & Error Propagation

Individual emission factors carry inherent empirical uncertainty ($\pm 5\%$ to $\pm 35\%$). To avoid false precision, CarbonTrack computes root-sum-of-squares (quadrature) uncertainty propagation following the *IPCC Good Practice Guidance and Uncertainty Management in National Greenhouse Gas Inventories*:

$$\sigma_{\text{total}} = \sqrt{\sum_{i=1}^{n} \left( E_i \times \frac{u_i}{100} \right)^2}$$

$$\text{Confidence Interval (90\%)} = \left[ \max\left(0, E_{\text{total}} - \sigma_{\text{total}}\right), \ E_{\text{total}} + \sigma_{\text{total}} \right]$$

---

## 📊 Data Model

The primary data structures are codified in TypeScript (`/src/types/carbon.ts`):

```typescript
export interface EmissionFactor {
  id: string;
  category: 'transportation' | 'electricity' | 'heating_fuel' | 'food' | 'business';
  name: string;
  scope: 1 | 2 | 3;
  value: number; // kg CO2e per unit
  unit: string;
  uncertaintyPercent: number; // e.g. 12%
  source: {
    organization: string; // e.g. "US EPA"
    name: string;
    year: number;
    url?: string;
    citationText: string;
  };
  notes?: string;
  isCustom?: boolean;
}

export interface PeriodRecord {
  id: string;
  label: string;
  date: string;
  profileType: 'personal' | 'business';
  numberOfPeopleOrEmployees: number;
  squareFootage?: number;
  activities: {
    gasolineCarMiles: number;
    electricVehicleMiles: number;
    electricityKwh: number;
    gridRegionFactorId: string;
    greenPowerPercentage: number;
    naturalGasTherms: number;
    dietType: string;
    foodWastePercent: number;
    commuteEmployees: number;
    commuteAvgMilesPerDay: number;
    commuteWorkDaysPerYear: number;
    cloudComputeHours: number;
    // ...
  };
}
```

---

## 📚 Configurable Emission Factors & Sources

All default factors are grounded in current, publicly verifiable databases:

| Domain | Key Emission Factor | Value & Unit | Scope | Authority & Source |
| :--- | :--- | :--- | :--- | :--- |
| **Transport** | Gasoline Passenger Car | 0.385 kg $\text{CO}_2\text{e}$/mile | Scope 1 | US EPA GHG Hub Table 8 (2024) |
| **Transport** | Diesel Passenger Car | 0.404 kg $\text{CO}_2\text{e}$/mile | Scope 1 | UK DESNZ / DEFRA (2024) |
| **Transport** | Electric Vehicle (Grid) | 0.092 kg $\text{CO}_2\text{e}$/mile | Scope 2 | US DOE Alternative Fuels Data Center (2024) |
| **Transport** | Short Flight (<1,000 km) | 0.245 kg $\text{CO}_2\text{e}$/km | Scope 3 | UK DESNZ / DEFRA Aviation Table (2024) |
| **Electricity** | US Grid National Average | 0.388 kg $\text{CO}_2\text{e}$/kWh | Scope 2 | US EPA eGRID2024 Summary Tables |
| **Electricity** | California CAMX Subregion | 0.210 kg $\text{CO}_2\text{e}$/kWh | Scope 2 | US EPA eGRID2024 CAMX |
| **Electricity** | UK National Grid | 0.207 kg $\text{CO}_2\text{e}$/kWh | Scope 2 | UK DESNZ Electricity Factors (2024) |
| **Heating** | Natural Gas | 5.306 kg $\text{CO}_2\text{e}$/therm | Scope 1 | US EPA GHG Hub Table 1 (Stationary Combustion) |
| **Heating** | Heating Fuel Oil #2 | 10.210 kg $\text{CO}_2\text{e}$/gal | Scope 1 | US EPA GHG Hub Table 1 |
| **Heating** | Propane (LPG) | 5.720 kg $\text{CO}_2\text{e}$/gal | Scope 1 | US EPA GHG Hub Table 1 |
| **Food** | High Meat Consumer | 3,300 kg $\text{CO}_2\text{e}$/yr | Scope 3 | Scarborough et al. *Nature Food* (2023) |
| **Food** | Vegetarian Diet | 1,200 kg $\text{CO}_2\text{e}$/yr | Scope 3 | Poore & Nemecek *Science* (2018) |
| **Business** | Employee Commute (Avg) | 0.320 kg $\text{CO}_2\text{e}$/mile | Scope 3 | GHG Protocol Technical Guidance Cat 7 |
| **Business** | Cloud Compute (1 vCPU-hr) | 0.0022 kg $\text{CO}_2\text{e}$/hr | Scope 3 | Cloud Carbon Footprint Methodology (2024) |

Users can freely inspect, modify, or add new factors via the in-app **Emission Factors Hub**.

---

## 🏗️ Architecture & Component Hierarchy

```text
src/
├── types/
│   └── carbon.ts              # Core TypeScript interfaces, scopes, period schemas
├── data/
│   └── emissionFactors.ts     # Authoritative factor database, benchmarks, presets
├── utils/
│   ├── calculator.ts          # Pure deterministic engine, error propagation, scenarios
│   └── exportImport.ts        # JSON backup, CSV audit export, Markdown report generator
├── tests/
│   └── calculator.test.ts     # Benchmark assertions against EPA & DEFRA standards
├── components/
│   ├── Navbar.tsx             # Profile switcher, preset selector, export/import buttons
│   ├── OverviewDashboard.tsx  # KPI cards, CI90 banner, Scope & Category charts, Benchmarks
│   ├── ActivityForm.tsx       # Interactive inputs with real-time math formula cards
│   ├── ReductionScenarios.tsx # What-if sandbox sliders, live delta, tree/fuel equivalents
│   ├── FactorManager.tsx      # Configurable factors table, custom factor modal, reset
│   ├── HistoricalTrends.tsx   # Multi-period comparison, YoY delta, timeline visualizer
│   ├── ReportModal.tsx        # Print-ready audit report, PDF print view, MD/CSV export
│   └── TestRunnerModal.tsx    # Live in-browser test suite execution & verification
└── App.tsx                    # Root state coordinator with localStorage persistence
```

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### Installation

```bash
# Clone repository
git clone https://github.com/carbontrack/carbontrack.git
cd carbontrack

# Install dependencies
npm install

# Start local development server (binds to port 3000)
npm run dev

# Build production bundle
npm run build

# Run type checks & linter
npm run lint
```

---

## 🧪 Testing & Verification

CarbonTrack includes comprehensive automated tests that validate calculations against official published reference values.

### Running Tests in Browser
Click **"Methodology & Tests"** in the top navigation bar to execute the full test suite live in the browser, showing detailed assertion results and mathematical ratios.

### Reference Tests Verified:
1. **EPA Passenger Car Combustion (Scope 1)**: Asserts $1,000 \text{ miles} \times 0.385 = 385.0 \text{ kg CO}_2\text{e}$.
2. **EPA Natural Gas Combustion (Scope 1)**: Asserts $100 \text{ therms} \times 5.306 = 530.6 \text{ kg CO}_2\text{e}$.
3. **Scope 2 Market-Based Accounting**: Asserts $10,000 \text{ kWh}$ with $100\%$ green tariff results in $0.0 \text{ kg CO}_2\text{e}$ Scope 2.
4. **Aviation Radiative Forcing**: Asserts $1.9\times$ uplift for domestic flight non-$\text{CO}_2$ climate impacts.
5. **IPCC Quadrature Uncertainty**: Verifies standard error propagation formula.
6. **Decarbonization Scenario Simulator**: Asserts expected policy intervention deltas.

---

## ⚠️ Limitations & Non-Exactness Notice

> **Important Disclosure**: Greenhouse gas inventories generated by CarbonTrack are statistical estimations based on secondary emission factors and user-reported activity data. They **do not constitute direct physical greenhouse gas measurements**.

1. **Grid Time-of-Use**: Scope 2 calculations use annual regional average emission rates. Real-time grid carbon intensity fluctuates hour-by-hour based on renewable dispatch.
2. **Spend-Based Limitations**: Economic input-output factors for office procurement approximate emissions based on monetary transactions, which are susceptible to inflation and regional pricing variance.
3. **Supply Chain Variances**: Agricultural and manufactured goods exhibit wide variance based on farming practices, soil types, and supply chain logistics.
4. **Regulatory Filings**: Organizations requiring legally binding compliance reporting (e.g., CSRD, SEC Climate Disclosure, California SB 253) should work with certified third-party assurance auditors.

---

## 🤝 Contributing

We welcome contributions from environmental scientists, software engineers, and sustainability advocates!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/new-emission-factor-dataset`.
3. When adding or updating emission factors, **you must provide a peer-reviewed or governmental source citation** (e.g., EPA, DEFRA, IEA, IPCC, or academic journal DOI).
4. Ensure all calculations pass automated tests: `npm run lint`.
5. Submit a descriptive Pull Request.

---

## 📜 License

CarbonTrack is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details. You are free to inspect, modify, fork, and deploy this software in accordance with the license.

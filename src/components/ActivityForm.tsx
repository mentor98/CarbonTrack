import React, { useState } from 'react';
import { 
  Car, 
  Zap, 
  Flame, 
  Utensils, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  HelpCircle, 
  Plane, 
  Train, 
  Bus, 
  Truck, 
  Sun,
  RotateCcw
} from 'lucide-react';
import { PeriodRecord, EmissionFactor, FootprintSummary, CalculatedItem } from '../types/carbon';

interface ActivityFormProps {
  period: PeriodRecord;
  factors: EmissionFactor[];
  summary: FootprintSummary;
  onChangeActivities: (updated: Partial<PeriodRecord['activities']>) => void;
  onChangeMeta: (updated: Partial<PeriodRecord>) => void;
  onOpenFactorsHub: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  period,
  factors,
  summary,
  onChangeActivities,
  onChangeMeta,
  onOpenFactorsHub
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('transportation');
  const [expandedMath, setExpandedMath] = useState<Record<string, boolean>>({});

  const act = period.activities;

  const toggleMath = (id: string) => {
    setExpandedMath(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to find calculated item details
  const getItem = (nameSnippet: string): CalculatedItem | undefined => {
    return summary.items.find(i => i.name.toLowerCase().includes(nameSnippet.toLowerCase()));
  };

  // Input field component with live math inspector
  const ActivityField = ({
    id,
    label,
    value,
    unit,
    onChange,
    step = 1,
    min = 0,
    hint,
    itemSnippet
  }: {
    id: string;
    label: string;
    value: number;
    unit: string;
    onChange: (val: number) => void;
    step?: number;
    min?: number;
    hint?: string;
    itemSnippet?: string;
  }) => {
    const calcItem = itemSnippet ? getItem(itemSnippet) : undefined;
    const isExpanded = expandedMath[id];

    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all hover:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label htmlFor={id} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>{label}</span>
            {hint && (
              <span title={hint} className="text-slate-400 cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </label>
          {calcItem && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                {calcItem.kgCO2e.toFixed(1)} kg CO₂e
              </span>
              <button
                type="button"
                onClick={() => toggleMath(id)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isExpanded ? 'Hide Math' : 'View Math'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            min={min}
            step={step}
            value={value === 0 ? '' : value}
            placeholder="0"
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 border border-slate-300/80 px-2.5 py-2 rounded-lg shrink-0 select-none">
            {unit}
          </span>
        </div>

        {/* Expandable step-by-step formula and citation card */}
        {isExpanded && calcItem && (
          <div className="mt-3 p-3 bg-white border border-emerald-200/90 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
            <div className="font-mono text-[11px] text-emerald-950 font-semibold bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 break-all">
              {calcItem.formula}
            </div>
            <div className="text-[11px] text-slate-600 flex items-start gap-1">
              <span className="font-semibold text-slate-800 shrink-0">Source Authority:</span>
              <span className="text-slate-600">{calcItem.sourceCitation}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
              <span>Uncertainty Margin: ±{calcItem.uncertaintyPercent}%</span>
              <span>Scope: {calcItem.scope} (GHG Protocol)</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Category Navigation Bar */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-2 flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveCategory('transportation')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'transportation'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4 text-sky-600" />
          <span>Transportation</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
            {summary.byCategory.transportation.tonnesCO2e.toFixed(1)}t
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('electricity')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'electricity'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Electricity</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
            {summary.byCategory.electricity.tonnesCO2e.toFixed(1)}t
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('heating_fuel')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeCategory === 'heating_fuel'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-600" />
          <span>Heating & Fuel</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
            {summary.byCategory.heating_fuel.tonnesCO2e.toFixed(1)}t
          </span>
        </button>

        {period.profileType === 'personal' && (
          <button
            type="button"
            onClick={() => setActiveCategory('food')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'food'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Food & Diet</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
              {summary.byCategory.food.tonnesCO2e.toFixed(1)}t
            </span>
          </button>
        )}

        {period.profileType === 'business' && (
          <button
            type="button"
            onClick={() => setActiveCategory('business')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'business'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span>Business Operations</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
              {summary.byCategory.business.tonnesCO2e.toFixed(1)}t
            </span>
          </button>
        )}
      </div>

      {/* Category Content Panels */}
      <div className="p-6">

        {/* 1. TRANSPORTATION */}
        {activeCategory === 'transportation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transportation Activities</h3>
                <p className="text-xs text-slate-500">
                  Annual distance traveled across personal vehicles, public transit, and commercial aviation.
                </p>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Subtotal:</span>
                <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {summary.byCategory.transportation.tonnesCO2e.toFixed(2)} t CO₂e
                </span>
              </div>
            </div>

            {/* Passenger Vehicles */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Road Passenger Vehicles (Annual Miles)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActivityField
                  id="gasolineCarMiles"
                  label="Gasoline Car (Avg 24 MPG)"
                  unit="miles"
                  value={act.gasolineCarMiles}
                  onChange={(val) => onChangeActivities({ gasolineCarMiles: val })}
                  hint="Based on US EPA 2024 fleet average 0.385 kg CO2e/mile"
                  itemSnippet="Gasoline Passenger Car"
                />
                <ActivityField
                  id="dieselCarMiles"
                  label="Diesel Car"
                  unit="miles"
                  value={act.dieselCarMiles}
                  onChange={(val) => onChangeActivities({ dieselCarMiles: val })}
                  hint="UK DEFRA 2024 average diesel passenger car factor 0.404 kg CO2e/mile"
                  itemSnippet="Diesel Passenger Car"
                />
                <ActivityField
                  id="hybridCarMiles"
                  label="Hybrid Vehicle (HEV)"
                  unit="miles"
                  value={act.hybridCarMiles}
                  onChange={(val) => onChangeActivities({ hybridCarMiles: val })}
                  hint="EPA hybrid vehicle average 0.220 kg CO2e/mile (~45-50 MPG)"
                  itemSnippet="Hybrid Vehicle"
                />
                <ActivityField
                  id="electricVehicleMiles"
                  label="Electric Vehicle (EV)"
                  unit="miles"
                  value={act.electricVehicleMiles}
                  onChange={(val) => onChangeActivities({ electricVehicleMiles: val })}
                  hint="DOE Alternative Fuels Data Center US grid-charged EV: 0.092 kg CO2e/mile"
                  itemSnippet="Electric Vehicle"
                />
              </div>
            </div>

            {/* Public Transit */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Public Transit (Annual Passenger-Miles)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActivityField
                  id="busMiles"
                  label="Transit Bus"
                  unit="miles"
                  value={act.busMiles}
                  onChange={(val) => onChangeActivities({ busMiles: val })}
                  hint="EPA Table 8: 0.160 kg CO2e per passenger-mile"
                  itemSnippet="Transit Bus"
                />
                <ActivityField
                  id="trainMiles"
                  label="Commuter / Passenger Train"
                  unit="miles"
                  value={act.trainMiles}
                  onChange={(val) => onChangeActivities({ trainMiles: val })}
                  hint="EPA Table 8: 0.115 kg CO2e per passenger-mile"
                  itemSnippet="Passenger Train"
                />
              </div>
            </div>

            {/* Aviation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-sky-600" />
                    <span>Commercial Aviation (Passenger-km)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Calculated using UK DESNZ / DEFRA aviation carbon models.
                  </p>
                </div>

                {/* Radiative Forcing Toggle */}
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={act.flightRadiativeForcing}
                    onChange={(e) => onChangeActivities({ flightRadiativeForcing: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Apply Radiative Forcing (1.9× Multiplier)</span>
                  <span title="Captures high-altitude non-CO2 warming impacts (contrails, NOx, cirrus clouds) recommended by DEFRA" className="text-slate-400 cursor-help">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActivityField
                  id="shortFlightsKm"
                  label="Short-Haul Flights (< 1,000 km)"
                  unit="km"
                  value={act.shortFlightsKm}
                  onChange={(val) => onChangeActivities({ shortFlightsKm: val })}
                  hint="Higher takeoff/landing proportion: 0.245 kg CO2e/km (before RF uplift)"
                  itemSnippet="Short Flights"
                />
                <ActivityField
                  id="longFlightsKm"
                  label="Long-Haul Flights (> 3,700 km)"
                  unit="km"
                  value={act.longFlightsKm}
                  onChange={(val) => onChangeActivities({ longFlightsKm: val })}
                  hint="Cruise efficiency: 0.147 kg CO2e/km (before RF uplift)"
                  itemSnippet="Long Flights"
                />
              </div>
            </div>

            {/* Commercial Van (for business or delivery) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Freight & Commercial Vehicles</h4>
              <ActivityField
                id="businessVanMiles"
                label="Commercial Cargo Van / Delivery Miles"
                unit="miles"
                value={act.businessVanMiles}
                onChange={(val) => onChangeActivities({ businessVanMiles: val })}
                hint="EPA Class 2 commercial van factor 0.540 kg CO2e/mile"
                itemSnippet="Commercial Van"
              />
            </div>
          </div>
        )}

        {/* 2. ELECTRICITY */}
        {activeCategory === 'electricity' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Electricity Consumption (Scope 2)</h3>
                <p className="text-xs text-slate-500">
                  Calculated based on regional grid emission intensity and market-based renewable energy deductions.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {summary.byCategory.electricity.tonnesCO2e.toFixed(2)} t CO₂e
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Electricity Amount */}
              <ActivityField
                id="electricityKwh"
                label="Annual Electricity Consumed"
                unit="kWh"
                value={act.electricityKwh}
                onChange={(val) => onChangeActivities({ electricityKwh: val })}
                hint="Check your utility bills for annual kWh total"
                itemSnippet="Purchased Electricity"
              />

              {/* Grid Region Selector */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Regional Grid Factor Dataset
                </label>
                <select
                  value={act.gridRegionFactorId}
                  onChange={(e) => onChangeActivities({ gridRegionFactorId: e.target.value })}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {factors.filter(f => f.category === 'electricity').map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.value.toFixed(3)} kg/kWh)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-2">
                  Different electric grids have vastly different carbon intensities depending on the proportion of coal, gas, wind, and solar.
                </p>
              </div>

            </div>

            {/* Green Power / Renewable Deduction Slider */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">
                    Certified Renewable Energy Tariff / On-Site Solar Offset
                  </span>
                </div>
                <span className="text-xs font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {act.greenPowerPercentage}% Green
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                If your utility offers a certified 100% renewable plan, or if your property produces solar energy with retired RECs, 
                GHG Protocol Scope 2 Market-Based accounting allows you to deduct that share.
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={act.greenPowerPercentage}
                onChange={(e) => onChangeActivities({ greenPowerPercentage: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-semibold text-emerald-800">
                <span>0% Standard Grid</span>
                <span>50% Hybrid Green</span>
                <span>100% Zero-Carbon PPA/Solar</span>
              </div>
            </div>

          </div>
        )}

        {/* 3. HEATING & STATIONARY FUELS */}
        {activeCategory === 'heating_fuel' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Heating & Direct Fuels (Scope 1)</h3>
                <p className="text-xs text-slate-500">
                  Stationary combustion fuels burned directly on-site for space heating, water heating, and cooking.
                </p>
              </div>
              <div className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {summary.byCategory.heating_fuel.tonnesCO2e.toFixed(2)} t CO₂e
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActivityField
                id="naturalGasTherms"
                label="Piped Natural Gas"
                unit="therms"
                value={act.naturalGasTherms}
                onChange={(val) => onChangeActivities({ naturalGasTherms: val })}
                hint="EPA GHG Hub: 5.306 kg CO2e per therm (1 therm = 100,000 BTU ~ 29.3 kWh)"
                itemSnippet="Piped Natural Gas"
              />
              <ActivityField
                id="heatingOilGallons"
                label="Fuel Oil / Heating Oil #2"
                unit="gallons"
                value={act.heatingOilGallons}
                onChange={(val) => onChangeActivities({ heatingOilGallons: val })}
                hint="EPA Table 1: 10.21 kg CO2e per gallon"
                itemSnippet="Distillate Heating Oil"
              />
              <ActivityField
                id="propaneGallons"
                label="Propane (LPG)"
                unit="gallons"
                value={act.propaneGallons}
                onChange={(val) => onChangeActivities({ propaneGallons: val })}
                hint="EPA Table 1: 5.72 kg CO2e per gallon"
                itemSnippet="Propane"
              />
              <ActivityField
                id="woodPelletsKg"
                label="Biomass / Wood Pellets"
                unit="kg"
                value={act.woodPelletsKg}
                onChange={(val) => onChangeActivities({ woodPelletsKg: val })}
                hint="DEFRA 2024 fossil upstream processing portion: 0.038 kg CO2e/kg"
                itemSnippet="Wood Biomass Pellets"
              />
            </div>
          </div>
        )}

        {/* 4. FOOD & DIET (Personal) */}
        {activeCategory === 'food' && period.profileType === 'personal' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Food & Dietary Footprint (Scope 3)</h3>
                <p className="text-xs text-slate-500">
                  Full cradle-to-plate lifecycle agricultural emissions (Poore & Nemecek, Scarborough et al. Nature Food).
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {summary.byCategory.food.tonnesCO2e.toFixed(2)} t CO₂e
              </div>
            </div>

            {/* Household Headcount */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Number of People in Household
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={period.numberOfPeopleOrEmployees || 1}
                  onChange={(e) => onChangeMeta({ numberOfPeopleOrEmployees: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-500 font-semibold shrink-0">person(s)</span>
              </div>
            </div>

            {/* Diet Type Selector Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Dietary Pattern Archetype
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'heavy_meat', label: 'High Meat (>100g/day)', kg: '3,300 kg/yr', desc: 'Frequent beef, lamb, pork' },
                  { id: 'medium_meat', label: 'Medium Meat (Average)', kg: '2,500 kg/yr', desc: 'Standard mixed Western diet' },
                  { id: 'low_meat', label: 'Low Meat / Flexitarian', kg: '1,700 kg/yr', desc: 'Occasional meat, plant-forward' },
                  { id: 'pescatarian', label: 'Pescatarian', kg: '1,400 kg/yr', desc: 'Fish and seafood, no land meat' },
                  { id: 'vegetarian', label: 'Vegetarian', kg: '1,200 kg/yr', desc: 'Dairy and eggs, no meat or fish' },
                  { id: 'vegan', label: 'Plant-Based (Vegan)', kg: '1,000 kg/yr', desc: '100% plant foods, lowest methane' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onChangeActivities({ dietType: d.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      act.dietType === d.id
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{d.label}</span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        {d.kg}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Food Waste Percentage */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Household Food Waste Factor</span>
                <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {act.foodWastePercent}% wasted
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Food that is discarded amplifies agricultural emissions and decomposes in landfills producing methane.
              </p>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={act.foodWastePercent}
                onChange={(e) => onChangeActivities({ foodWastePercent: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

          </div>
        )}

        {/* 5. SMALL BUSINESS OPERATIONS */}
        {activeCategory === 'business' && period.profileType === 'business' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Small Business Operations & Scope 3</h3>
                <p className="text-xs text-slate-500">
                  Staff commuting, facility conditioning, cloud data processing, and supply chain procurement.
                </p>
              </div>
              <div className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {summary.byCategory.business.tonnesCO2e.toFixed(2)} t CO₂e
              </div>
            </div>

            {/* Headcount & Office Sqft */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full-Time Staff / Employee Headcount
                </label>
                <input
                  type="number"
                  min={1}
                  value={period.numberOfPeopleOrEmployees || 1}
                  onChange={(e) => onChangeMeta({ numberOfPeopleOrEmployees: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Office Space Square Footage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={period.squareFootage || 0}
                    onChange={(e) => onChangeMeta({ squareFootage: Number(e.target.value) || 0 })}
                    className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500 font-semibold shrink-0">sq ft</span>
                </div>
              </div>
            </div>

            {/* Employee Commuting (Scope 3 Category 7) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  Staff Daily Commute (GHG Scope 3 Category 7)
                </h4>
                {getItem('Staff Daily Commute') && (
                  <span className="text-xs font-bold text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded">
                    {getItem('Staff Daily Commute')?.kgCO2e.toFixed(1)} kg CO₂e
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Formula: Employees × Daily Roundtrip Miles × In-Person Working Days per Year × Blended Commute Factor (0.32 kg/mi).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Commuting Staff</label>
                  <input
                    type="number"
                    min={0}
                    value={act.commuteEmployees}
                    onChange={(e) => onChangeActivities({ commuteEmployees: Number(e.target.value) || 0 })}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Avg Roundtrip Miles</label>
                  <input
                    type="number"
                    min={0}
                    value={act.commuteAvgMilesPerDay}
                    onChange={(e) => onChangeActivities({ commuteAvgMilesPerDay: Number(e.target.value) || 0 })}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Office Days / Year</label>
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={act.commuteWorkDaysPerYear}
                    onChange={(e) => onChangeActivities({ commuteWorkDaysPerYear: Number(e.target.value) || 0 })}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Cloud Compute & Procurement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActivityField
                id="cloudComputeHours"
                label="Cloud Computing (vCPU-Hours)"
                unit="hours"
                value={act.cloudComputeHours}
                onChange={(val) => onChangeActivities({ cloudComputeHours: val })}
                hint="Cloud Carbon Footprint model: 0.0022 kg CO2e / vCPU-hour"
                itemSnippet="Cloud Infrastructure"
              />
              <ActivityField
                id="paperAndSuppliesSpendUsd"
                label="Office Supplies & IT Hardware"
                unit="USD ($)"
                value={act.paperAndSuppliesSpendUsd}
                onChange={(val) => onChangeActivities({ paperAndSuppliesSpendUsd: val })}
                hint="EPA USEEIO v2.0 spend model: 0.180 kg CO2e / USD"
                itemSnippet="Office Supplies"
              />
              <ActivityField
                id="shippingPackagesCount"
                label="Courier & Parcel Shipments"
                unit="parcels"
                value={act.shippingPackagesCount}
                onChange={(val) => onChangeActivities({ shippingPackagesCount: val })}
                hint="DEFRA 2024 freight model: 0.850 kg CO2e / parcel"
                itemSnippet="Outbound Parcel"
              />
            </div>
          </div>
        )}

      </div>

      {/* Footer info bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Looking to configure or add custom emission coefficients?
        </span>
        <button
          onClick={onOpenFactorsHub}
          className="font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
        >
          <span>Open Configurable Emission Factors Hub</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};

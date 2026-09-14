import { PeriodRecord, FootprintSummary, EmissionFactor } from '../types/carbon';

export function exportToJson(data: {
  version: string;
  exportDate: string;
  periods: PeriodRecord[];
  emissionFactors: EmissionFactor[];
  activePeriodId: string;
}) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carbontrack-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSummaryToCsv(period: PeriodRecord, summary: FootprintSummary) {
  const lines: string[] = [];

  // Header meta
  lines.push(`"CarbonTrack Emissions Audit Report"`);
  lines.push(`"Profile:","${period.label}"`);
  lines.push(`"Type:","${period.profileType}"`);
  lines.push(`"Generated:","${new Date().toISOString()}"`);
  lines.push(`"Estimated Total Emissions:","${summary.totalTonnesCO2e.toFixed(3)} t CO2e"`);
  lines.push(`"Uncertainty Range (90% CI):","${summary.minTonnesCO2e.toFixed(3)} to ${summary.maxTonnesCO2e.toFixed(3)} t CO2e"`);
  lines.push(``);

  // Scope summary
  lines.push(`"Scope Summary"`);
  lines.push(`"Scope","Tonnes CO2e","kg CO2e","Description"`);
  lines.push(`"Scope 1 (Direct)","${summary.byScope.scope1Tonnes.toFixed(3)}","${summary.byScope.scope1Kg.toFixed(1)}","On-site fuel combustion, company fleet"`);
  lines.push(`"Scope 2 (Indirect Energy)","${summary.byScope.scope2Tonnes.toFixed(3)}","${summary.byScope.scope2Kg.toFixed(1)}","Purchased electricity and heat"`);
  lines.push(`"Scope 3 (Value Chain)","${summary.byScope.scope3Tonnes.toFixed(3)}","${summary.byScope.scope3Kg.toFixed(1)}","Flights, commuting, supply chain, diet"`);
  lines.push(``);

  // Category summary
  lines.push(`"Category Summary"`);
  lines.push(`"Category","Tonnes CO2e","Percentage (%)"`);
  for (const [cat, data] of Object.entries(summary.byCategory)) {
    lines.push(`"${cat}","${data.tonnesCO2e.toFixed(3)}","${data.percentage.toFixed(1)}%"`);
  }
  lines.push(``);

  // Itemized calculations
  lines.push(`"Itemized Emissions & Methodology Breakdown"`);
  lines.push(`"Activity Name","Scope","Category","Amount","Unit","Factor Value","Factor Unit","Emissions (kg CO2e)","Uncertainty (%)","Min (kg)","Max (kg)","Calculation Formula","Source Citation"`);
  for (const it of summary.items) {
    lines.push(
      `"${it.name.replace(/"/g, '""')}","Scope ${it.scope}","${it.category}","${it.amount}","${it.unit}","${it.factorValue}","${it.factorUnit}","${it.kgCO2e.toFixed(2)}","±${it.uncertaintyPercent}%","${it.minKgCO2e.toFixed(2)}","${it.maxKgCO2e.toFixed(2)}","${it.formula.replace(/"/g, '""')}","${it.sourceCitation.replace(/"/g, '""')}"`
    );
  }

  lines.push(``);
  lines.push(`"Disclaimer:","Estimates are approximations based on published emission factor datasets (EPA, DEFRA, IPCC) and do not constitute certified exact physical measurements."`);

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carbontrack-${period.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-emissions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateReportMarkdown(period: PeriodRecord, summary: FootprintSummary): string {
  const timestamp = new Date().toLocaleDateString('en-US', { dateStyle: 'full' });

  let md = `# CarbonTrack — Greenhouse Gas Inventory & Audit Report\n\n`;
  md += `**Profile:** ${period.label}  \n`;
  md += `**Type:** ${period.profileType.toUpperCase()}  \n`;
  md += `**Audit Period Date:** ${period.date || timestamp}  \n`;
  md += `**Headcount / Occupants:** ${period.numberOfPeopleOrEmployees || 1}  \n`;
  md += `**Report Generated:** ${timestamp}  \n\n`;

  md += `> **Methodology & Uncertainty Notice:**  \n`;
  md += `> Greenhouse gas calculations in this report are statistical estimations calculated following the **GHG Protocol Corporate and Individual Standards**. Values reflect secondary emission factors published by government and academic bodies (US EPA, UK DESNZ/DEFRA, IPCC AR6). **Never treat these estimates as exact physical measurements.** Actual emissions may vary within the estimated 90% confidence interval.\n\n`;

  md += `## 1. Executive Summary\n\n`;
  md += `| Metric | Estimated Value | 90% Confidence Interval |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Total Greenhouse Gas Emissions** | **${summary.totalTonnesCO2e.toFixed(2)} t CO₂e** | **${summary.minTonnesCO2e.toFixed(2)} – ${summary.maxTonnesCO2e.toFixed(2)} t CO₂e** |\n`;
  md += `| **Emissions Per Person/Staff** | **${(summary.totalTonnesCO2e / Math.max(1, period.numberOfPeopleOrEmployees)).toFixed(2)} t CO₂e** | — |\n`;
  md += `| **Scope 1 (Direct Fuel & Vehicles)** | ${summary.byScope.scope1Tonnes.toFixed(2)} t CO₂e (${summary.totalTonnesCO2e > 0 ? ((summary.byScope.scope1Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1) : 0}%) | Stationary combustion, fleet combustion |\n`;
  md += `| **Scope 2 (Purchased Electricity)** | ${summary.byScope.scope2Tonnes.toFixed(2)} t CO₂e (${summary.totalTonnesCO2e > 0 ? ((summary.byScope.scope2Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1) : 0}%) | Grid power (market-adjusted for renewables) |\n`;
  md += `| **Scope 3 (Supply Chain & Indirect)** | ${summary.byScope.scope3Tonnes.toFixed(2)} t CO₂e (${summary.totalTonnesCO2e > 0 ? ((summary.byScope.scope3Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1) : 0}%) | Flights, diet, commute, procurement |\n\n`;

  md += `## 2. Category Breakdown\n\n`;
  md += `| Category | Emissions (t CO₂e) | Share (%) |\n`;
  md += `| :--- | :--- | :--- |\n`;
  for (const [cat, val] of Object.entries(summary.byCategory)) {
    const title = cat.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    md += `| ${title} | ${val.tonnesCO2e.toFixed(2)} | ${val.percentage.toFixed(1)}% |\n`;
  }
  md += `\n`;

  md += `## 3. Itemized Calculations & Source Citations\n\n`;
  md += `| Activity | Scope | Input Activity | Factor Used | kg CO₂e | Calculation Formula | Source Citation |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const it of summary.items) {
    md += `| ${it.name} | S${it.scope} | ${it.amount.toLocaleString()} ${it.unit} | ${it.factorValue} / ${it.factorUnit} | ${it.kgCO2e.toFixed(1)} | \`${it.formula}\` | ${it.sourceCitation} |\n`;
  }
  md += `\n`;

  md += `## 4. Key Recommended Decarbonization Priorities\n\n`;
  if (summary.byCategory.electricity.percentage > 25) {
    md += `- **Switch to 100% Certified Renewable Electricity:** Electricity accounts for ${summary.byCategory.electricity.percentage.toFixed(0)}% of your footprint. Transitioning to a green utility tariff or on-site solar could reduce up to ${summary.byCategory.electricity.tonnesCO2e.toFixed(2)} t CO₂e.\n`;
  }
  if (summary.byCategory.transportation.percentage > 25) {
    md += `- **Electrify Transportation & Eliminate Short Flights:** Transportation accounts for ${summary.byCategory.transportation.percentage.toFixed(0)}% of total emissions. Prioritizing EV charging, rail over domestic aviation, and remote meetings reduces direct combustion.\n`;
  }
  if (summary.byCategory.heating_fuel.percentage > 20) {
    md += `- **Heat Pump Transition:** On-site fossil heating accounts for ${summary.byCategory.heating_fuel.percentage.toFixed(0)}%. High-efficiency heat pumps can slash fossil fuel combustion by 80%+.\n`;
  }
  md += `- **Annual Tracking:** Update this inventory quarterly to verify emissions trajectories and support ESG disclosures.\n\n`;

  md += `---\n*Generated by CarbonTrack Open-Source Carbon Calculator — Verified against GHG Protocol Standards.*`;

  return md;
}

export function downloadMarkdownReport(period: PeriodRecord, summary: FootprintSummary) {
  const md = generateReportMarkdown(period, summary);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carbontrack-${period.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-report.md`;
  a.click();
  URL.revokeObjectURL(url);
}

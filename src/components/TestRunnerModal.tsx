import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  X, 
  BookOpen, 
  ShieldCheck, 
  Code2, 
  Scale, 
  FileCheck 
} from 'lucide-react';
import { runCalculationTests, TestResult } from '../tests/calculator.test';

interface TestRunnerModalProps {
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'methodology'>('tests');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    executeTests();
  }, []);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runCalculationTests();
      setTestResults(res);
      setIsRunning(false);
    }, 150);
  };

  const totalPassed = testResults.filter(t => t.passed).length;
  const allPassed = testResults.length > 0 && totalPassed === testResults.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Calculation Methodology & Automated Test Suite</h2>
              <p className="text-xs text-slate-500">
                Rigorous assertion benchmarks verified against US EPA, UK DESNZ, and IPCC standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Live Test Suite ({totalPassed}/{testResults.length} Passed)</span>
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'methodology'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standards & Assumptions</span>
            </button>
          </div>

          {activeTab === 'tests' && (
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-indigo-600" />
              <span>Re-run Suite</span>
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'tests' && (
            <div className="space-y-4">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  {allPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-sm">
                      {allPassed ? 'All Reference Calculations Passed Verification' : 'Some Tests Failed'}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Verified mathematical outputs against official published tables from the US EPA, DEFRA, and IPCC AR6.
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  {totalPassed} / {testResults.length} Passing
                </span>
              </div>

              {/* Test List */}
              <div className="space-y-3">
                {testResults.map((t, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{t.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {t.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{t.notes}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-sans font-semibold">Expected: </span>
                        <span className="text-slate-700">{t.expected}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans font-semibold">Calculated: </span>
                        <span className="text-slate-900 font-bold">{t.actual}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>The Fundamental Equation</span>
                </h3>
                <p>
                  CarbonTrack estimates greenhouse gas emissions using the standard international formulation:
                </p>
                <div className="font-mono text-[11px] bg-white p-3 rounded-lg border border-slate-200 text-emerald-950 font-bold">
                  Emissions (kg CO₂e) = Activity Data × Emission Factor × GWP × Multipliers
                </div>
                <p className="text-[11px] text-slate-500">
                  Where GWP (Global Warming Potential) values represent 100-year time horizons from the IPCC Sixth Assessment Report (AR6):
                  CO₂ = 1, CH₄ = 27.9–29.8, N₂O = 273.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">GHG Protocol Scope Boundaries</h3>
                
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
                  <div className="font-bold text-rose-950">Scope 1: Direct Greenhouse Gas Emissions</div>
                  <p className="text-rose-900/80 text-[11px]">
                    Emissions from physical sources owned or directly controlled by the reporting entity. Includes stationary combustion of natural gas, 
                    heating oil, and propane in boilers/furnaces, plus tailpipe exhaust from owned passenger vehicles and delivery vans.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                  <div className="font-bold text-blue-950">Scope 2: Indirect Emissions from Purchased Energy</div>
                  <p className="text-blue-900/80 text-[11px]">
                    Emissions from the generation of purchased electricity, heating, or cooling consumed by the reporting entity. 
                    Calculated following GHG Protocol Scope 2 Guidance, allowing both Location-Based (regional grid intensity) and Market-Based 
                    (certified renewable tariffs, PPAs, and retired RECs) adjustments.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                  <div className="font-bold text-emerald-950">Scope 3: Other Value Chain Indirect Emissions</div>
                  <p className="text-emerald-900/80 text-[11px]">
                    Consequential emissions across the value chain, including Category 6 (business travel & aviation flights), Category 7 
                    (employee commuting), Category 1 (purchased office supplies via USEEIO spend modeling), and lifecycle food production.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                <h3 className="text-sm font-bold text-amber-950">Aviation Radiative Forcing (1.9× Multiplier)</h3>
                <p className="text-amber-900/90 text-[11px]">
                  High-altitude commercial aircraft combustion releases nitrogen oxides (NOx), soot, and water vapor that generate contrails and cirrus cloud enhancement. 
                  Following UK DESNZ / DEFRA official guidance, an optional 1.9× multiplier captures this non-CO2 net radiative warming effect.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Uncertainty Propagation (Quadrature)</h3>
                <p className="text-[11px] text-slate-600">
                  To prevent the illusion of false precision, aggregate uncertainties are computed using root-sum-of-squares (quadrature) propagation 
                  under IPCC Good Practice Guidance:
                </p>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                  σ_total = √( Σ (E_i × u_i / 100)² )
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>CarbonTrack Open-Source Methodology v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

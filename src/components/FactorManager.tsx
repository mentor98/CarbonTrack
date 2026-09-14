import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Search, 
  Edit3, 
  Plus, 
  RotateCcw, 
  ExternalLink, 
  Check, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { EmissionFactor, EmissionCategory, Scope } from '../types/carbon';
import { DEFAULT_EMISSION_FACTORS } from '../data/emissionFactors';

interface FactorManagerProps {
  factors: EmissionFactor[];
  onClose: () => void;
  onUpdateFactor: (updated: EmissionFactor) => void;
  onAddFactor: (newFactor: EmissionFactor) => void;
  onResetFactors: () => void;
}

export const FactorManager: React.FC<FactorManagerProps> = ({
  factors,
  onClose,
  onUpdateFactor,
  onAddFactor,
  onResetFactors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New factor form state
  const [newFactor, setNewFactor] = useState<Partial<EmissionFactor>>({
    name: '',
    category: 'transportation',
    scope: 1,
    value: 0.1,
    unit: 'mile',
    uncertaintyPercent: 15,
    source: {
      organization: 'User Defined',
      name: 'Custom Factor',
      year: 2024,
      citationText: 'User-specified emission factor'
    },
    notes: ''
  });

  const filtered = factors.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.source.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.source.citationText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'all' || f.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactor) return;
    onUpdateFactor({ ...editingFactor, isCustom: true });
    setEditingFactor(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactor.name || !newFactor.value) return;

    const created: EmissionFactor = {
      id: `custom_${Date.now()}`,
      category: (newFactor.category as EmissionCategory) || 'transportation',
      name: newFactor.name,
      scope: (newFactor.scope as Scope) || 1,
      value: Number(newFactor.value),
      unit: newFactor.unit || 'unit',
      uncertaintyPercent: Number(newFactor.uncertaintyPercent) || 15,
      source: {
        organization: newFactor.source?.organization || 'User Defined',
        name: newFactor.source?.name || 'Custom Emission Factor',
        year: Number(newFactor.source?.year) || 2024,
        url: newFactor.source?.url || '',
        citationText: newFactor.source?.citationText || 'Custom user parameter'
      },
      notes: newFactor.notes || 'User configured custom emission factor.',
      isCustom: true
    };

    onAddFactor(created);
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Emission Factor Database & Citations</h2>
              <p className="text-xs text-slate-600">
                Official coefficients published by the US EPA, UK DESNZ, and IPCC. Fully inspectable and editable.
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

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search factors or citations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="transportation">Transportation</option>
              <option value="electricity">Electricity</option>
              <option value="heating_fuel">Heating & Fuel</option>
              <option value="food">Food & Diet</option>
              <option value="business">Business Operations</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Factor</span>
            </button>
            <button
              onClick={onResetFactors}
              title="Reset all factors to EPA/DEFRA authoritative values"
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Factors Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Factor Name & Domain</th>
                  <th className="px-3 py-3">Scope</th>
                  <th className="px-4 py-3">Emission Factor</th>
                  <th className="px-3 py-3">Uncertainty</th>
                  <th className="px-4 py-3">Authoritative Source Citation</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{f.name}</span>
                        {f.isCustom && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {f.category.replace('_', ' ')}
                      </div>
                      {f.notes && (
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {f.notes}
                        </div>
                      )}
                    </td>

                    {/* Scope */}
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        f.scope === 1 ? 'bg-rose-100 text-rose-700' :
                        f.scope === 2 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        Scope {f.scope}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {f.value} <span className="text-slate-500 font-normal">kg CO₂e / {f.unit}</span>
                    </td>

                    {/* Uncertainty */}
                    <td className="px-3 py-3.5 whitespace-nowrap font-medium text-slate-600">
                      ±{f.uncertaintyPercent}%
                    </td>

                    {/* Citation */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f.source.organization} ({f.source.year})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2">
                        {f.source.citationText}
                      </div>
                      {f.source.url && (
                        <a 
                          href={f.source.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-emerald-700 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>Official Publication</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingFactor(JSON.parse(JSON.stringify(f)))}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Factor Modal */}
        {editingFactor && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Edit Emission Factor: {editingFactor.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Override the numeric intensity or uncertainty margin for local supplier specifics.
              </p>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value (kg CO₂e per {editingFactor.unit})
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    value={editingFactor.value}
                    onChange={(e) => setEditingFactor({ ...editingFactor, value: Number(e.target.value) })}
                    className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Uncertainty Margin (±%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingFactor.uncertaintyPercent}
                    onChange={(e) => setEditingFactor({ ...editingFactor, uncertaintyPercent: Number(e.target.value) })}
                    className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used in IPCC 90% confidence error propagation.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Source Notes / Supplier Citation
                  </label>
                  <input
                    type="text"
                    value={editingFactor.source.citationText}
                    onChange={(e) => setEditingFactor({
                      ...editingFactor,
                      source: { ...editingFactor.source, citationText: e.target.value }
                    })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingFactor(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                  >
                    Save Override
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Custom Factor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Add Custom Emission Factor</h3>
              <p className="text-xs text-slate-500 mb-4">
                Define a specialized regional factor, custom fuel type, or supplier LCA measurement.
              </p>

              <form onSubmit={handleSaveNew} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Factor Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biodiesel B20 Blend"
                      value={newFactor.name}
                      onChange={(e) => setNewFactor({ ...newFactor, name: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newFactor.category}
                      onChange={(e) => setNewFactor({ ...newFactor, category: e.target.value as any })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2"
                    >
                      <option value="transportation">Transportation</option>
                      <option value="electricity">Electricity</option>
                      <option value="heating_fuel">Heating & Fuel</option>
                      <option value="food">Food & Diet</option>
                      <option value="business">Business Operations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Scope</label>
                    <select
                      value={newFactor.scope}
                      onChange={(e) => setNewFactor({ ...newFactor, scope: Number(e.target.value) as any })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2"
                    >
                      <option value={1}>Scope 1 (Direct)</option>
                      <option value={2}>Scope 2 (Electricity)</option>
                      <option value={3}>Scope 3 (Value Chain)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Value (kg CO₂e)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={newFactor.value}
                      onChange={(e) => setNewFactor({ ...newFactor, value: Number(e.target.value) })}
                      className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. gallon, mile, kWh"
                      value={newFactor.unit}
                      onChange={(e) => setNewFactor({ ...newFactor, unit: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Author / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Regional University LCA"
                      value={newFactor.source?.organization}
                      onChange={(e) => setNewFactor({
                        ...newFactor,
                        source: { ...newFactor.source!, organization: e.target.value }
                      })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Uncertainty (±%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newFactor.uncertaintyPercent}
                      onChange={(e) => setNewFactor({ ...newFactor, uncertaintyPercent: Number(e.target.value) })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Citation Text / URL</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified Supplier Scope 1 EPD Certificate #482"
                    value={newFactor.source?.citationText}
                    onChange={(e) => setNewFactor({
                      ...newFactor,
                      source: { ...newFactor.source!, citationText: e.target.value }
                    })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                  >
                    Add Factor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

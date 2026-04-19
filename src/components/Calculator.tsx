import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Zap, Clock, Save, X, Lightbulb, Tv, Wind, Refrigerator, Laptop, WashingMachine, Heater, Fan } from 'lucide-react';
import { Appliance } from '../types';
import { HARYANA_TARIFF_2026 } from '../utils/calculations';
import ConfirmDialog from './ConfirmDialog';

interface CalculatorProps {
  appliances: Appliance[];
  onAddAppliance: (appliance: Appliance) => void;
  onUpdateAppliance: (appliance: Appliance) => void;
  onDeleteAppliance: (id: string) => void;
  totalUnits: number;
  monthlyBill: number;
}

const presetAppliances = [
  { name: 'LED Bulb', wattage: 10, icon: Lightbulb, hours: 6 },
  { name: 'Ceiling Fan', wattage: 75, icon: Fan, hours: 10 },
  { name: 'Television', wattage: 120, icon: Tv, hours: 5 },
  { name: 'Air Conditioner (1.5T)', wattage: 1500, icon: Wind, hours: 8 },
  { name: 'Refrigerator', wattage: 150, icon: Refrigerator, hours: 24 },
  { name: 'Laptop', wattage: 65, icon: Laptop, hours: 8 },
  { name: 'Washing Machine', wattage: 500, icon: WashingMachine, hours: 1 },
  { name: 'Water Heater', wattage: 2000, icon: Heater, hours: 0.5 },
];

// Tariff array for easier iteration
const TARIFF_TIERS = [
  { min: 0, max: 150, rate: HARYANA_TARIFF_2026.tier1.rate },
  { min: 151, max: 300, rate: HARYANA_TARIFF_2026.tier2.rate },
  { min: 301, max: 500, rate: HARYANA_TARIFF_2026.tier3.rate },
  { min: 501, max: Infinity, rate: HARYANA_TARIFF_2026.tier4.rate },
];

// Calculate units for a single appliance
function calculateApplianceUnits(wattage: number, hours: number, quantity: number): number {
  return (wattage * hours * 30 * quantity) / 1000;
}

// Calculate bill for given units
function calculateBillForUnits(units: number): number {
  let bill = 0;
  let remaining = units;
  
  // Tier 1
  const t1 = Math.min(remaining, 150);
  bill += t1 * HARYANA_TARIFF_2026.tier1.rate;
  remaining -= t1;
  
  // Tier 2
  if (remaining > 0) {
    const t2 = Math.min(remaining, 150);
    bill += t2 * HARYANA_TARIFF_2026.tier2.rate;
    remaining -= t2;
  }
  
  // Tier 3
  if (remaining > 0) {
    const t3 = Math.min(remaining, 200);
    bill += t3 * HARYANA_TARIFF_2026.tier3.rate;
    remaining -= t3;
  }
  
  // Tier 4
  if (remaining > 0) {
    bill += remaining * HARYANA_TARIFF_2026.tier4.rate;
  }
  
  return bill;
}

const Calculator: React.FC<CalculatorProps> = ({
  appliances,
  onAddAppliance,
  onUpdateAppliance,
  onDeleteAppliance,
  totalUnits,
  monthlyBill
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', wattage: '', hours: '', quantity: '1' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Clear newly added animation after delay
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  const billBreakdown = useMemo(() => {
    const breakdown: { tier: string; units: number; rate: number; amount: number }[] = [];
    let remainingUnits = totalUnits;
    
    if (remainingUnits > 0) {
      const tierUnits = Math.min(remainingUnits, 150);
      breakdown.push({ tier: '0-150', units: tierUnits, rate: HARYANA_TARIFF_2026.tier1.rate, amount: tierUnits * HARYANA_TARIFF_2026.tier1.rate });
      remainingUnits -= tierUnits;
    }
    if (remainingUnits > 0) {
      const tierUnits = Math.min(remainingUnits, 150);
      breakdown.push({ tier: '151-300', units: tierUnits, rate: HARYANA_TARIFF_2026.tier2.rate, amount: tierUnits * HARYANA_TARIFF_2026.tier2.rate });
      remainingUnits -= tierUnits;
    }
    if (remainingUnits > 0) {
      const tierUnits = Math.min(remainingUnits, 200);
      breakdown.push({ tier: '301-500', units: tierUnits, rate: HARYANA_TARIFF_2026.tier3.rate, amount: tierUnits * HARYANA_TARIFF_2026.tier3.rate });
      remainingUnits -= tierUnits;
    }
    if (remainingUnits > 0) {
      breakdown.push({ tier: 'Above 500', units: remainingUnits, rate: HARYANA_TARIFF_2026.tier4.rate, amount: remainingUnits * HARYANA_TARIFF_2026.tier4.rate });
    }
    
    return breakdown;
  }, [totalUnits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wattage = parseFloat(formData.wattage);
    const hours = parseFloat(formData.hours);
    const quantity = parseInt(formData.quantity) || 1;
    
    if (!formData.name || isNaN(wattage) || isNaN(hours)) return;

    if (editingId) {
      onUpdateAppliance({ id: editingId, name: formData.name, wattage, hoursPerDay: hours, quantity });
      setEditingId(null);
    } else {
      const newId = Date.now().toString();
      onAddAppliance({ id: newId, name: formData.name, wattage, hoursPerDay: hours, quantity });
      setNewlyAddedId(newId);
    }
    
    setFormData({ name: '', wattage: '', hours: '', quantity: '1' });
    setShowForm(false);
  };

  const handleEdit = (appliance: Appliance) => {
    setFormData({
      name: appliance.name,
      wattage: appliance.wattage.toString(),
      hours: appliance.hoursPerDay.toString(),
      quantity: appliance.quantity.toString()
    });
    setEditingId(appliance.id);
    setShowForm(true);
  };

  const handleDeleteClick = (appliance: Appliance) => {
    setDeleteConfirm({ isOpen: true, id: appliance.id, name: appliance.name });
  };

  const handleDeleteConfirm = () => {
    setDeletingId(deleteConfirm.id);
    setTimeout(() => {
      onDeleteAppliance(deleteConfirm.id);
      setDeletingId(null);
    }, 300);
    setDeleteConfirm({ isOpen: false, id: '', name: '' });
  };

  const handleQuickAdd = (preset: typeof presetAppliances[0]) => {
    const newId = Date.now().toString();
    onAddAppliance({ id: newId, name: preset.name, wattage: preset.wattage, hoursPerDay: preset.hours, quantity: 1 });
    setNewlyAddedId(newId);
  };

  const effectiveRate = totalUnits > 0 ? monthlyBill / totalUnits : 0;

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Appliance"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep it"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div className="animate-slide-in-left">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 drop-shadow-md">
            <Zap className="text-cyan-400 animate-pulse drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
            Energy Calculator
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Add your appliances to calculate monthly consumption</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', wattage: '', hours: '', quantity: '1' });
          }}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl font-bold btn-press btn-ripple animate-slide-in-right electric-hover shadow-[0_0_15px_rgba(34,211,238,0.25)]"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Appliance'}
        </button>
      </div>

      {/* Quick Add Presets */}
      <div className="glass-card rounded-xl p-4 card-hover animate-slide-in-bottom stagger-1 relative z-10" style={{ animationFillMode: 'both' }}>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Add Common Appliances</h3>
        <div className="flex flex-wrap gap-2">
          {presetAppliances.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                onClick={() => handleQuickAdd(preset)}
                className="flex items-center gap-2 bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-slate-200 hover:text-white px-3 py-2 rounded-lg text-sm btn-press transition-all duration-200 electric-hover"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form 
          onSubmit={handleSubmit} 
          className="glass-card rounded-xl p-6 animate-scale-in relative z-10"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Edit Appliance' : 'Add New Appliance'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-1">Appliance Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Air Conditioner"
                className="w-full bg-white/[0.05] border border-cyan-500/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-1">Power (Watts)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.wattage}
                  onChange={(e) => setFormData({ ...formData, wattage: e.target.value })}
                  placeholder="1500"
                  min="1"
                  className="w-full bg-white/[0.05] border border-cyan-500/20 rounded-lg px-4 py-2 pr-12 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-200"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">W</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-1">Hours Used/Day</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="8"
                  min="0.1"
                  max="24"
                  step="0.1"
                  className="w-full bg-white/[0.05] border border-cyan-500/20 rounded-lg px-4 py-2 pr-12 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-200"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">hrs</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="1"
                min="1"
                className="w-full bg-white/[0.05] border border-cyan-500/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-xl font-bold btn-press btn-ripple electric-hover shadow-[0_0_12px_rgba(34,211,238,0.2)]"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Add'} Appliance
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Appliance List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Your Appliances ({appliances.length})</h3>
          
          {appliances.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
              <Zap className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-bounce-gentle" />
              <p className="text-slate-300 font-medium">No appliances added yet</p>
              <p className="text-sm text-slate-400 mt-1">Add your first appliance to start calculating</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appliances.map((appliance, index) => {
                const units = calculateApplianceUnits(appliance.wattage, appliance.hoursPerDay, appliance.quantity);
                const cost = calculateBillForUnits(units);
                const isNewlyAdded = newlyAddedId === appliance.id;
                const isDeleting = deletingId === appliance.id;
                
                return (
                  <div
                    key={appliance.id}
                    className={`glass-card rounded-xl p-4 card-hover ${
                      isNewlyAdded ? 'animate-add' : ''
                    } ${isDeleting ? 'animate-delete' : ''}`}
                    style={{ 
                      animationDelay: isNewlyAdded ? '0ms' : `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 icon-glow-cyan rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {appliance.name}
                            {appliance.quantity > 1 && (
                              <span className="text-cyan-400 text-sm ml-2">×{appliance.quantity}</span>
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300 mt-1">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-slate-400" />
                              {appliance.wattage}W
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {appliance.hoursPerDay} hrs/day
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{units.toFixed(1)} kWh</p>
                          <p className="text-sm text-slate-400 font-medium">₹{cost.toFixed(0)}/month</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(appliance)}
                            className="p-2 bg-white/[0.05] hover:bg-cyan-500/15 rounded-lg transition-all duration-200 btn-press hover:scale-110 border border-transparent hover:border-cyan-500/30"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-slate-300 hover:text-cyan-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(appliance)}
                            className="p-2 bg-white/[0.05] hover:bg-red-500/15 rounded-lg transition-all duration-200 btn-press hover:scale-110 group border border-transparent hover:border-red-500/30"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bill Summary */}
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-right" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <h3 className="text-lg font-bold text-slate-100 mb-4">Bill Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-cyan-500/10">
                <span className="text-slate-300 font-medium">Total Consumption</span>
                <span className="text-xl font-bold text-white number-transition drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]">{totalUnits.toFixed(1)} kWh</span>
              </div>
              
              {/* Tier Breakdown */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400 font-semibold">Haryana 2026 Tiered Billing:</p>
                {billBreakdown.map((tier, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between text-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                  >
                    <span className="text-slate-300">
                      {tier.units.toFixed(1)} units @ <span className="text-cyan-400 font-medium">₹{tier.rate}</span>
                    </span>
                    <span className="text-slate-200 font-medium">₹{tier.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-cyan-500/10">
                <span className="text-slate-300 font-medium">Monthly Bill</span>
                <span className="text-2xl font-extrabold text-white number-transition drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">₹{monthlyBill.toFixed(0)}</span>
              </div>
              
              <div className="bg-white/[0.03] rounded-lg p-3 border border-cyan-500/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Effective Rate</span>
                  <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">₹{effectiveRate.toFixed(2)}/unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tariff Info */}
          <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-right" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Haryana Tariff 2026</h3>
            <div className="space-y-2 text-sm">
              {TARIFF_TIERS.map((tier, index) => (
                <div 
                  key={index} 
                  className="flex justify-between animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  <span className="text-slate-400">
                    {tier.max === Infinity 
                      ? `Above ${tier.min - 1} units` 
                      : `${tier.min}-${tier.max} units`
                    }
                  </span>
                  <span className="text-slate-200 font-medium">₹{tier.rate}/unit</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;

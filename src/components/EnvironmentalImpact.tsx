import { useMemo } from 'react';
import { Leaf, TreeDeciduous, Car, Factory, Droplets, Wind, Globe, TrendingUp, FileText } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Appliance, StatsData } from '../types';
import {
  CO2_PER_KWH,
  CO2_PER_TREE_YEARLY,
  calculateCO2SavedAnnual,
  calculateTreesEquivalent,
  calculateMonthlyGenerationByCity,
  calculateSolarSystemSizeByCity,
  calculateSubsidy,
  calculateInstallationCost,
  calculateNetMeteringCredits,
} from '../utils/calculations';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface EnvironmentalImpactProps {
  stats: StatsData;
  applianceList: Appliance[];
  selectedCity: string;
  netMeteringEnabled: boolean;
  onPrint: () => void;
}

export default function EnvironmentalImpact({ 
  stats, 
  applianceList, 
  selectedCity,
  netMeteringEnabled,
  onPrint 
}: EnvironmentalImpactProps) {
  const annualConsumption = stats.totalConsumption * 12;
  const annualCO2Emissions = annualConsumption * CO2_PER_KWH;
  const annualCO2Saved = calculateCO2SavedAnnual(stats.totalConsumption);
  const treesEquivalent = Math.round(calculateTreesEquivalent(annualCO2Saved));
  
  const KM_PER_KG_CO2 = 1 / 0.12;
  const LITERS_WATER_SAVED = 2;
  const carKmEquivalent = Math.round(annualCO2Saved * KM_PER_KG_CO2);
  const waterSaved = annualConsumption * LITERS_WATER_SAVED;

  const applianceChartData = useMemo(() => {
    const sortedAppliances = [...applianceList].sort((a, b) => {
      const consumptionA = (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000;
      const consumptionB = (b.wattage * b.quantity * b.hoursPerDay * 30) / 1000;
      return consumptionB - consumptionA;
    });

    const colors = [
      '#22d3ee', '#3b82f6', '#fbbf24', '#f87171', '#a78bfa',
      '#f472b6', '#10b981', '#84cc16', '#fb923c', '#818cf8',
    ];

    return {
      labels: sortedAppliances.map(a => a.name),
      datasets: [{
        data: sortedAppliances.map(a => (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000),
        backgroundColor: sortedAppliances.map((_, i) => colors[i % colors.length]),
        borderColor: 'rgba(0,0,0,0.6)',
        borderWidth: 2,
      }],
    };
  }, [applianceList]);

  const costComparisonData = useMemo(() => {
    const systemSize = calculateSolarSystemSizeByCity(stats.totalConsumption, selectedCity);
    const installationCost = calculateInstallationCost(systemSize);
    const subsidy = calculateSubsidy(systemSize);
    const monthlyGeneration = calculateMonthlyGenerationByCity(systemSize, selectedCity);
    const netMeteringCredits = netMeteringEnabled ? calculateNetMeteringCredits(monthlyGeneration) : 0;
    
    const netCost = installationCost - subsidy;
    const monthlyEMI = netCost / 84;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const gridCosts: number[] = [];
    const solarCosts: number[] = [];
    
    let cumulativeGrid = 0;
    let cumulativeSolar = 0;
    
    for (let i = 0; i < 12; i++) {
      cumulativeGrid += stats.monthlyBill;
      cumulativeSolar += Math.max(0, monthlyEMI - netMeteringCredits);
      gridCosts.push(Math.round(cumulativeGrid));
      solarCosts.push(Math.round(cumulativeSolar));
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Grid Power Cost (₹)',
          data: gridCosts,
          backgroundColor: '#f87171',
          borderRadius: 4,
        },
        {
          label: 'Solar Power Cost (₹)',
          data: solarCosts,
          backgroundColor: '#22d3ee',
          borderRadius: 4,
        },
      ],
    };
  }, [stats.monthlyBill, stats.totalConsumption, selectedCity, netMeteringEnabled]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 12, weight: 500 as const },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(34,211,238,0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context: { label: string; parsed: number }) => `${context.label}: ${context.parsed.toFixed(1)} kWh/month`,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 12, weight: 500 as const },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(34,211,238,0.3)',
        borderWidth: 1,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => `${context.dataset.label || ''}: ₹${(context.parsed.y ?? 0).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(34,211,238,0.08)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(34,211,238,0.08)' },
        ticks: { 
          color: '#94a3b8',
          callback: (value: number | string) => `₹${(Number(value) / 1000).toFixed(0)}K`,
        },
      },
    },
  };

  const impactMetrics = [
    {
      icon: TreeDeciduous,
      value: treesEquivalent,
      unit: 'trees',
      label: 'Equivalent Trees Planted',
      description: `${CO2_PER_TREE_YEARLY} kg CO₂ absorbed per tree/year`,
      color: 'emerald',
      glowClass: 'icon-glow-emerald',
      textClass: 'text-emerald-400',
    },
    {
      icon: Car,
      value: carKmEquivalent.toLocaleString(),
      unit: 'km',
      label: 'Car Travel Avoided',
      description: 'Emissions equivalent to driving',
      color: 'blue',
      glowClass: 'icon-glow-blue',
      textClass: 'text-blue-400',
    },
    {
      icon: Droplets,
      value: (waterSaved / 1000).toFixed(1),
      unit: 'kL',
      label: 'Water Saved',
      description: 'Compared to thermal power',
      color: 'cyan',
      glowClass: 'icon-glow-cyan',
      textClass: 'text-cyan-400',
    },
    {
      icon: Factory,
      value: (annualCO2Emissions / 1000).toFixed(2),
      unit: 'tonnes',
      label: 'Current CO₂ Emissions',
      description: `${CO2_PER_KWH} kg CO₂/kWh (Indian Grid 2026)`,
      color: 'red',
      glowClass: 'icon-glow-red',
      textClass: 'text-red-400',
    },
  ];

  const ecoTips = [
    { tip: 'Switch to LED bulbs', savings: 'Save up to 80% on lighting energy' },
    { tip: 'Use 5-star rated appliances', savings: 'Reduce consumption by 30%' },
    { tip: 'Set AC to 24°C', savings: 'Each degree saves 6% energy' },
    { tip: 'Unplug standby devices', savings: 'Eliminate phantom load of 5-10%' },
    { tip: 'Use natural ventilation', savings: 'Reduce cooling needs by 20%' },
    { tip: 'Install solar panels', savings: 'Go carbon neutral' },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div className="animate-slide-in-left">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2 drop-shadow-md">
            <Leaf className="text-cyan-400 animate-pulse drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" size={28} />
            Environmental Impact
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Carbon footprint analysis using 2026 Indian Grid emission factor ({CO2_PER_KWH} kg CO₂/kWh)</p>
        </div>
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all duration-200 btn-press btn-ripple print:hidden animate-slide-in-right electric-hover shadow-[0_0_15px_rgba(34,211,238,0.25)]"
        >
          <FileText size={18} />
          Export Audit Report
        </button>
      </div>

      {/* Carbon Summary */}
      <div className="glass-card bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-400/20 rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 icon-glow-cyan rounded-lg animate-float">
              <Globe className="text-cyan-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Your Carbon Footprint</h2>
              <p className="text-slate-200 mt-1">
                Your current electricity usage produces <span className="text-red-400 font-bold">{(annualCO2Emissions / 1000).toFixed(2)} tonnes</span> of CO₂ annually.
                By switching to solar, you can save <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{(annualCO2Saved / 1000).toFixed(2)} tonnes</span> per year.
              </p>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                Formula: CO₂ Saved = {stats.totalConsumption.toFixed(0)} kWh/month × 12 months × {CO2_PER_KWH} kg/kWh = <span className="text-cyan-300 font-semibold">{annualCO2Saved.toFixed(0)} kg</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-400/15 rounded-lg animate-pulse-glow border border-cyan-400/20">
            <TrendingUp className="text-cyan-400" size={20} />
            <span className="text-cyan-300 font-bold">
              {((annualCO2Saved / annualCO2Emissions) * 100).toFixed(0)}% Reduction Possible
            </span>
          </div>
        </div>
      </div>

      {/* Trees Equivalent Highlight */}
      <div className="glass-card bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-400/20 rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <div className="flex items-start gap-4">
          <div className="p-3 icon-glow-emerald rounded-lg animate-bounce-gentle">
            <TreeDeciduous className="text-emerald-400" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Trees Equivalent</h2>
            <p className="text-slate-200 mt-1">
              Switching to solar is equivalent to planting <span className="text-cyan-300 font-extrabold text-2xl animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">{treesEquivalent}</span> trees.
            </p>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Formula: Trees = {annualCO2Saved.toFixed(0)} kg CO₂ ÷ {CO2_PER_TREE_YEARLY} kg/tree/year = <span className="text-cyan-300 font-semibold">{treesEquivalent} trees</span>
            </p>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {impactMetrics.map((metric, index) => (
          <div 
            key={metric.label} 
            className="glass-card rounded-xl p-5 card-hover animate-slide-in-bottom"
            style={{ animationDelay: `${200 + index * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${metric.glowClass} rounded-lg transition-transform duration-300 hover:scale-110`}>
                <metric.icon className={metric.textClass} size={20} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white number-transition drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
              {metric.value} <span className="text-sm text-slate-400 font-medium">{metric.unit}</span>
            </p>
            <p className="text-slate-200 text-sm mt-1 font-medium">{metric.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Consumption Breakdown Doughnut Chart */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-left" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Consumption Breakdown</h2>
            <div className="icon-glow-cyan p-1 rounded-full">
              <Factory className="text-cyan-400" size={20} />
            </div>
          </div>
          
          {applianceList.length > 0 ? (
            <div className="h-[300px]">
              <Doughnut data={applianceChartData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-slate-400 font-medium">Add appliances in the Calculator to see breakdown</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-white/[0.03] rounded-lg border border-white/5">
            <p className="text-slate-300 text-sm">
              The chart shows which appliances consume the most energy. Focus on high-consumption items for maximum savings.
            </p>
          </div>
        </div>

        {/* Financial Comparison Bar Chart */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-right" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">12-Month Cost Comparison</h2>
            <div className="icon-glow-cyan p-1 rounded-full">
              <TrendingUp className="text-cyan-400" size={20} />
            </div>
          </div>
          
          <div className="h-[300px]">
            <Bar data={costComparisonData} options={barOptions} />
          </div>

          <div className="mt-4 p-4 bg-white/[0.03] rounded-lg border border-white/5">
            <p className="text-slate-300 text-sm">
              Cumulative comparison of grid electricity costs vs solar system EMI{netMeteringEnabled ? ' (including net metering credits)' : ''}.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Impact - Trees */}
      <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100">Visual Impact</h2>
          <div className="icon-glow-emerald p-1 rounded-full">
            <Leaf className="text-emerald-400" size={20} />
          </div>
        </div>
        
        <div className="grid grid-cols-10 gap-2 mb-6">
          {[...Array(Math.min(treesEquivalent, 50))].map((_, i) => (
            <div 
              key={i} 
              className="aspect-square flex items-center justify-center bg-cyan-400/10 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-cyan-400/20 animate-fade-in border border-cyan-500/10"
              style={{ animationDelay: `${450 + i * 30}ms`, animationFillMode: 'both' }}
            >
              <TreeDeciduous className="text-emerald-400" size={20} />
            </div>
          ))}
          {treesEquivalent > 50 && (
            <div className="aspect-square flex items-center justify-center bg-cyan-400/10 rounded-lg col-span-10 animate-fade-in border border-cyan-500/10" style={{ animationDelay: '2000ms', animationFillMode: 'both' }}>
              <span className="text-cyan-300 text-sm font-medium">+{treesEquivalent - 50} more trees</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-cyan-400/10 rounded-lg hover-lift border border-cyan-500/10">
            <Wind className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]" size={18} />
            <span className="text-slate-200 text-sm font-medium">
              Equivalent to {(annualCO2Saved / 1000).toFixed(2)} tonnes of CO₂ absorbed annually
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-400/10 rounded-lg hover-lift border border-blue-500/10">
            <Car className="text-blue-400 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]" size={18} />
            <span className="text-slate-200 text-sm font-medium">
              Like taking a car off the road for {(carKmEquivalent / 15000).toFixed(1)} months
            </span>
          </div>
        </div>
      </div>

      {/* Eco Tips */}
      <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100">Energy Saving Tips</h2>
          <div className="icon-glow-emerald p-1 rounded-full">
            <Leaf className="text-emerald-400" size={20} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecoTips.map((item, index) => (
            <div 
              key={index} 
              className="p-4 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] transition-all duration-300 hover-lift animate-fade-in border border-white/5"
              style={{ animationDelay: `${500 + index * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center icon-glow-cyan rounded-full flex-shrink-0 transition-transform duration-300 hover:rotate-12">
                  <span className="text-cyan-300 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{item.tip}</p>
                  <p className="text-slate-400 text-sm mt-1 font-medium">{item.savings}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="glass-card bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-6 text-center print:hidden animate-slide-in-bottom card-hover relative z-10" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
        <h3 className="text-xl font-extrabold text-white mb-2">Ready to Make a Difference?</h3>
        <p className="text-slate-200 mb-4 font-medium">
          Switch to solar energy and reduce your carbon footprint by up to 100%
        </p>
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all duration-200 btn-press btn-ripple animate-pulse-glow electric-hover shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          <FileText size={20} />
          Generate Solar Feasibility Report
        </button>
      </div>
    </div>
  );
}

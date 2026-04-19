import { useMemo } from 'react';
import { Zap, IndianRupee, Sun, Leaf, TrendingUp, Battery, Activity, Info } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import StatsCard from './StatsCard';
import { StatsData, Appliance } from '../types';
import { 
  NCR_SUNLIGHT_CONSTANT, 
  getEffectiveRate,
  calculateSubsidy,
  calculateInstallationCost,
  COST_PER_KW,
  CO2_PER_TREE_YEARLY,
} from '../utils/calculations';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  stats: StatsData;
  applianceList: Appliance[];
}

export default function Dashboard({ stats, applianceList }: DashboardProps) {
  const topAppliances = [...applianceList]
    .sort((a, b) => (b.wattage * b.hoursPerDay * b.quantity) - (a.wattage * a.hoursPerDay * a.quantity))
    .slice(0, 5);

  const effectiveRate = getEffectiveRate(stats.totalConsumption);
  const subsidy = calculateSubsidy(stats.solarCapacityNeeded);
  const installCost = calculateInstallationCost(stats.solarCapacityNeeded);
  const netCost = installCost - subsidy;

  // Doughnut chart data for consumption breakdown
  const doughnutData = useMemo(() => {
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 11, weight: 500 as const },
          padding: 12,
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

  const insightColors: Record<string, string> = {
    blue: 'text-blue-400',
    amber: 'text-amber-300',
    emerald: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
  };

  const insightBgs: Record<string, string> = {
    blue: 'icon-glow-blue',
    amber: 'icon-glow-amber',
    emerald: 'icon-glow-cyan',
    purple: 'icon-glow-purple',
    pink: 'icon-glow-red',
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="animate-slide-in-left relative z-10">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white drop-shadow-md">Dashboard</h1>
        <p className="text-slate-400 mt-1 font-medium">Haryana 2026 Tariff Rates • PM Surya Ghar 2026 Subsidy</p>
      </div>

      {/* 2026 Notice */}
      <div className="glass-card bg-gradient-to-r from-cyan-500/10 to-amber-500/10 border border-cyan-400/20 rounded-xl p-4 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="flex items-start gap-3">
          <div className="icon-glow-cyan p-1 rounded-full">
            <Info className="text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" size={20} />
          </div>
          <div className="text-sm relative z-10">
            <p className="text-white font-semibold">2026 Government Rates Applied</p>
            <p className="text-slate-200 mt-1">
              Using Haryana 2026 tiered electricity rates (<span className="text-cyan-300 font-semibold">₹2.95</span> – <span className="text-cyan-300 font-semibold">₹7.10/unit</span>) and PM Surya Ghar 2026 solar subsidies.
              Current effective rate: <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.7)]">₹{effectiveRate.toFixed(2)}/unit</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <StatsCard
          title="Total Consumption"
          value={stats.totalConsumption.toFixed(1)}
          unit="kWh/month"
          icon={Zap}
          trend={{ value: 12, isPositive: false }}
          delay={150}
          glowColor="cyan"
        />
        <StatsCard
          title="Monthly Bill"
          value={`₹${stats.monthlyBill.toFixed(0)}`}
          unit=""
          icon={IndianRupee}
          trend={{ value: 8, isPositive: false }}
          delay={200}
          glowColor="cyan"
        />
        <StatsCard
          title="Solar Capacity Needed"
          value={stats.solarCapacityNeeded.toFixed(2)}
          unit="kW"
          icon={Sun}
          delay={250}
          glowColor="amber"
        />
        <StatsCard
          title="Carbon Saved (if Solar)"
          value={stats.carbonSaved.toFixed(1)}
          unit="kg CO₂/month"
          icon={Leaf}
          trend={{ value: 15, isPositive: true }}
          delay={300}
          glowColor="cyan"
        />
      </div>

      {/* Solar Savings Quick View - Go Solar */}
      <div className="glass-card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Sun className="text-amber-300 animate-pulse drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]" size={20} />
              <span className="drop-shadow-[0_0_4px_rgba(252,211,77,0.3)]">Go Solar & Save</span>
            </h3>
            <p className="text-amber-100/90 text-sm mt-1">
              With PM Surya Ghar 2026, install a <span className="text-amber-300 font-semibold">{stats.solarCapacityNeeded.toFixed(2)} kW</span> system
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg hover-lift border border-white/5">
              <p className="text-slate-400 text-xs font-medium">Installation Cost</p>
              <p className="text-white font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">₹{(installCost / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-cyan-400/10 px-4 py-2 rounded-lg border border-cyan-400/25 hover-lift">
              <p className="text-cyan-300 text-xs font-medium">Govt Subsidy</p>
              <p className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">−₹{(subsidy / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-cyan-400/15 px-4 py-2 rounded-lg border border-cyan-400/30 hover-lift animate-pulse-glow">
              <p className="text-cyan-300 text-xs font-medium">You Pay</p>
              <p className="text-white font-extrabold text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">₹{(netCost / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Consumption Breakdown Doughnut */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-left" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Consumption Breakdown</h2>
            <div className="icon-glow-cyan p-1 rounded-full">
              <Activity className="text-cyan-400" size={20} />
            </div>
          </div>
          
          {applianceList.length > 0 ? (
            <div className="h-[280px] xl:h-[340px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center">
                <Battery className="mx-auto text-slate-500 mb-3 animate-bounce-gentle" size={48} />
                <p className="text-slate-300 font-medium">No appliances added yet</p>
                <p className="text-slate-400 text-sm">Go to Calculator to add appliances</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-right" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Energy Insights</h2>
            <div className="icon-glow-cyan p-1 rounded-full">
              <TrendingUp className="text-cyan-400" size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: Zap, color: 'blue', label: 'Daily Consumption', value: `${(stats.totalConsumption / 30).toFixed(2)} kWh` },
              { icon: Sun, color: 'amber', label: 'NCR Peak Sun Hours', value: `${NCR_SUNLIGHT_CONSTANT} hrs/day` },
              { icon: Leaf, color: 'emerald', label: 'Trees Equivalent', value: `${((stats.carbonSaved * 12) / CO2_PER_TREE_YEARLY).toFixed(1)} trees/year` },
              { icon: IndianRupee, color: 'purple', label: 'Solar Cost/kW', value: `₹${(COST_PER_KW / 1000).toFixed(0)}K` },
              { icon: Battery, color: 'pink', label: 'Appliances Tracked', value: `${applianceList.length}` },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.label}
                  className="flex items-center justify-between p-4 bg-white/[0.03] backdrop-blur-sm rounded-lg card-hover border border-white/5 animate-fade-in"
                  style={{ animationDelay: `${450 + index * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${insightBgs[item.color]} rounded-lg`}>
                      <Icon className={insightColors[item.color]} size={18} />
                    </div>
                    <span className="text-slate-200 font-medium">{item.label}</span>
                  </div>
                  <span className="text-white font-bold number-transition drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Energy Consumers Table */}
      <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100">Top Energy Consumers</h2>
          <div className="icon-glow-amber p-1 rounded-full">
            <Zap className="text-amber-300 animate-pulse" size={20} />
          </div>
        </div>
        
        {topAppliances.length > 0 ? (
          <div className="space-y-4">
            {topAppliances.map((appliance, index) => {
              const consumption = (appliance.wattage * appliance.hoursPerDay * appliance.quantity * 30) / 1000;
              const percentage = stats.totalConsumption > 0 
                ? (consumption / stats.totalConsumption) * 100 
                : 0;
              
              const colors = ['bg-cyan-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
              
              return (
                <div 
                  key={appliance.id}
                  className="animate-slide-in-right"
                  style={{ animationDelay: `${550 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">#{index + 1}</span>
                      <span className="text-slate-100 font-medium">{appliance.name}</span>
                      <span className="text-slate-400 text-xs">({appliance.wattage}W × {appliance.quantity} × {appliance.hoursPerDay}h)</span>
                    </div>
                    <span className="text-slate-300 font-medium">{consumption.toFixed(1)} kWh <span className="text-slate-400">({percentage.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        animation: `slide-in-left 0.8s ease-out ${0.6 + index * 0.1}s both`,
                        boxShadow: '0 0 8px rgba(34,211,238,0.3)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Battery className="mx-auto text-slate-500 mb-3 animate-bounce-gentle" size={48} />
            <p className="text-slate-300 font-medium">No appliances added yet</p>
            <p className="text-slate-400 text-sm">Go to Calculator to add appliances</p>
          </div>
        )}
      </div>
    </div>
  );
}

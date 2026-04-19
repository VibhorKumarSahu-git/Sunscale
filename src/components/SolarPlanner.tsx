import { Sun, Battery, Zap, IndianRupee, Calendar, TrendingDown, CheckCircle2, Info, Award, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { Appliance, StatsData } from '../types';
import {
  COST_PER_KW,
  PM_SURYA_GHAR_2026,
  CITY_DATA,
  NET_METERING_EXPORT_PERCENT,
  NET_METERING_RATE,
  calculateSolarSystemSizeByCity,
  calculateInstallationCost,
  calculateSubsidy,
  getSubsidyBreakdown,
  calculatePaybackYears,
  calculatePanelsNeeded,
  calculateRoofArea,
  calculateMonthlyGenerationByCity,
  calculateNetMeteringCredits,
  formatIndianCurrency,
  formatInLakhs,
} from '../utils/calculations';

interface SolarPlannerProps {
  stats: StatsData;
  applianceList: Appliance[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  netMeteringEnabled: boolean;
  setNetMeteringEnabled: (enabled: boolean) => void;
}

export default function SolarPlanner({ 
  stats, 
  applianceList, 
  selectedCity, 
  setSelectedCity,
  netMeteringEnabled,
  setNetMeteringEnabled 
}: SolarPlannerProps) {
  const cityInfo = CITY_DATA[selectedCity] || CITY_DATA.gurugram;
  
  const requiredCapacity = calculateSolarSystemSizeByCity(stats.totalConsumption, selectedCity);
  const installationCost = calculateInstallationCost(requiredCapacity);
  const subsidy = calculateSubsidy(requiredCapacity);
  const subsidyBreakdown = getSubsidyBreakdown(requiredCapacity);
  const netCost = installationCost - subsidy;
  
  const panelWattage = 400;
  const panelsNeeded = calculatePanelsNeeded(requiredCapacity, panelWattage);
  const roofArea = calculateRoofArea(panelsNeeded);
  const monthlyGeneration = calculateMonthlyGenerationByCity(requiredCapacity, selectedCity);
  
  const monthlyNetMeteringCredits = netMeteringEnabled ? calculateNetMeteringCredits(monthlyGeneration) : 0;
  const annualNetMeteringCredits = monthlyNetMeteringCredits * 12;
  
  const effectiveMonthlyBill = stats.monthlyBill + monthlyNetMeteringCredits;
  const paybackYears = calculatePaybackYears(installationCost, subsidy, effectiveMonthlyBill);
  
  const annualSavings = effectiveMonthlyBill * 12;
  const lifetimeSavings = annualSavings * 25;

  const systemSizes = [
    { size: 2, label: 'Small Home', ideal: '100-200 units/month', subsidyPerKw: PM_SURYA_GHAR_2026.upTo2kW },
    { size: 3, label: 'Medium Home', ideal: '200-350 units/month', subsidyFixed: PM_SURYA_GHAR_2026.above3kW },
    { size: 5, label: 'Large Home', ideal: '350-550 units/month', subsidyFixed: PM_SURYA_GHAR_2026.above3kW },
    { size: 10, label: 'Premium/Office', ideal: '500+ units/month', subsidyFixed: PM_SURYA_GHAR_2026.above3kW },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="animate-slide-in-left relative z-10">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2 drop-shadow-md">
          <Sun className="text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]" size={28} />
          Solar Planner
        </h1>
        <p className="text-slate-400 mt-1 font-medium">PM Surya Ghar 2026 Subsidy • {cityInfo.name} ({cityInfo.sunHours} peak sun hours)</p>
      </div>

      {/* Configuration Panel */}
      <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City Selection */}
          <div>
            <label className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-2">
              <MapPin size={16} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
              Select Your City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-white/[0.05] border border-cyan-500/20 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 cursor-pointer backdrop-blur-sm"
            >
              {Object.entries(CITY_DATA).map(([key, city]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {city.name}, {city.state} - {city.sunHours} sun hours/day
                </option>
              ))}
            </select>
            <p className="text-slate-400 text-xs mt-2 font-medium">
              System size is calculated based on peak sun hours in your city
            </p>
          </div>

          {/* Net Metering Toggle */}
          <div>
            <label className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-2">
              <Zap size={16} className="text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.5)]" />
              Net Metering
            </label>
            <button
              onClick={() => setNetMeteringEnabled(!netMeteringEnabled)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300 btn-press backdrop-blur-sm ${
                netMeteringEnabled 
                  ? 'bg-cyan-400/10 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                  : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/25'
              }`}
            >
              <div className="text-left">
                <p className={`font-semibold transition-colors duration-200 ${netMeteringEnabled ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {netMeteringEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">
                  Export {(NET_METERING_EXPORT_PERCENT * 100).toFixed(0)}% of power at ₹{NET_METERING_RATE}/unit
                </p>
              </div>
              <div className={`transition-transform duration-300 ${netMeteringEnabled ? 'scale-110' : ''}`}>
                {netMeteringEnabled ? (
                  <ToggleRight className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" size={32} />
                ) : (
                  <ToggleLeft className="text-slate-400" size={32} />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Net Metering Credits Display */}
        {netMeteringEnabled && monthlyNetMeteringCredits > 0 && (
          <div className="mt-4 p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg animate-scale-in backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="icon-glow-amber p-1 rounded-full">
                <Zap className="text-amber-300 flex-shrink-0 mt-0.5 animate-pulse" size={20} />
              </div>
              <div>
                <p className="text-amber-200 font-bold">Estimated Net Metering Credits</p>
                <p className="text-slate-200 text-sm mt-1">
                  Export: <span className="text-white font-semibold">{(monthlyGeneration * NET_METERING_EXPORT_PERCENT).toFixed(1)} kWh/month</span> × 
                  <span className="text-white font-semibold"> ₹{NET_METERING_RATE}/unit</span> = 
                  <span className="text-cyan-300 font-bold ml-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{formatIndianCurrency(monthlyNetMeteringCredits)}/month</span>
                </p>
                <p className="text-amber-300/80 text-sm mt-1 font-medium">
                  Annual Credits: <span className="neon-amber font-bold">{formatIndianCurrency(annualNetMeteringCredits)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Sync Notice */}
      <div className="glass-card bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <div className="flex items-start gap-3">
          <div className="icon-glow-cyan p-1 rounded-full">
            <Zap className="text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" size={20} />
          </div>
          <div>
            <p className="text-white font-bold">Live Sync with Calculator</p>
            <p className="text-slate-200 text-sm mt-1">
              This planner automatically updates based on your <span className="text-cyan-300 font-semibold">{applianceList.length} appliances</span> in the Calculator.
              Monthly consumption: <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{stats.totalConsumption.toFixed(1)} kWh</span>
            </p>
          </div>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="glass-card rounded-xl p-4 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <div className="flex items-start gap-3">
          <div className="icon-glow-blue p-1 rounded-full">
            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          </div>
          <div className="text-sm space-y-1">
            <p className="text-white font-bold">2026 Calculation Formulas</p>
            <p className="text-slate-300">System Size (kW) = (Monthly Units ÷ 30) ÷ <span className="text-amber-300 font-medium">{cityInfo.sunHours}</span> ({cityInfo.name} Sunlight Constant)</p>
            <p className="text-slate-300">Installation Cost = System Size × <span className="text-cyan-300 font-medium">₹{COST_PER_KW.toLocaleString('en-IN')}/kW</span></p>
            <p className="text-slate-300">ROI (Years) = (Total Cost − Subsidy) ÷ ((Monthly Bill{netMeteringEnabled ? ' + Net Metering Credits' : ''}) × 12)</p>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="glass-card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
        <div className="flex items-start gap-4">
          <div className="p-3 icon-glow-amber rounded-lg animate-float">
            <Sun className="text-amber-300" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-white">Recommended System Size for {cityInfo.name}</h2>
            <p className="text-slate-200 mt-1">
              Based on your monthly consumption of <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{stats.totalConsumption.toFixed(1)} kWh</span> and
              <span className="text-amber-300 font-bold drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]"> {cityInfo.sunHours} sun hours/day</span>,
              we recommend a <span className="text-amber-300 font-bold neon-amber">{requiredCapacity.toFixed(2)} kW</span> solar system.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg hover-lift border border-white/5">
                <span className="text-slate-400 font-medium">Daily Need:</span>
                <span className="text-white font-semibold ml-2">{(stats.totalConsumption / 30).toFixed(2)} kWh</span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg hover-lift border border-white/5">
                <span className="text-slate-400 font-medium">Sun Hours:</span>
                <span className="text-white font-semibold ml-2">{cityInfo.sunHours} hrs/day</span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg hover-lift border border-white/5">
                <span className="text-slate-400 font-medium">City:</span>
                <span className="text-white font-semibold ml-2">{cityInfo.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {[
          { icon: Sun, glowClass: 'icon-glow-amber', iconColor: 'text-amber-300', label: 'System Size', value: requiredCapacity.toFixed(2), unit: 'kW', isAmber: true },
          { icon: Battery, glowClass: 'icon-glow-blue', iconColor: 'text-blue-400', label: 'Panels Needed', value: panelsNeeded, unit: `× ${panelWattage}W` },
          { icon: IndianRupee, glowClass: 'icon-glow-cyan', iconColor: 'text-cyan-400', label: 'Net Cost (After Subsidy)', value: formatInLakhs(netCost), unit: '', highlight: true },
          { icon: Calendar, glowClass: 'icon-glow-purple', iconColor: 'text-purple-400', label: 'Years to Break Even', value: paybackYears === Infinity ? '—' : paybackYears.toFixed(1), unit: 'years', extra: netMeteringEnabled ? 'Including net metering' : undefined },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.label}
              className="glass-card rounded-xl p-5 card-hover animate-slide-in-bottom"
              style={{ animationDelay: `${300 + index * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${metric.glowClass} rounded-lg`}>
                  <Icon className={metric.iconColor} size={20} />
                </div>
                <span className="text-slate-300 text-sm font-semibold">{metric.label}</span>
              </div>
              <p className={`text-2xl font-extrabold number-transition ${metric.highlight ? 'neon-cyan' : metric.isAmber ? 'text-white drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]' : 'text-white drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]'}`}>
                {metric.value} <span className="text-sm text-slate-400 font-medium">{metric.unit}</span>
              </p>
              {metric.extra && <p className="text-xs text-cyan-400 mt-1 font-medium">{metric.extra}</p>}
            </div>
          );
        })}
      </div>

      {/* Cost & Subsidy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Installation Cost */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-left" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Installation Cost Breakdown</h2>
            <div className="icon-glow-cyan p-1 rounded-full">
              <IndianRupee className="text-cyan-400" size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-lg hover-lift border border-white/5">
              <div>
                <span className="text-slate-200 font-medium">System Capacity</span>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{requiredCapacity.toFixed(2)} kW × ₹{COST_PER_KW.toLocaleString('en-IN')}/kW</p>
              </div>
              <span className="text-white font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{formatIndianCurrency(installationCost)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg hover-lift">
              <div>
                <span className="text-cyan-300 font-semibold">PM Surya Ghar 2026 Subsidy</span>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{subsidyBreakdown.calculation}</p>
              </div>
              <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">− {formatIndianCurrency(subsidy)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-cyan-400/15 border border-cyan-400/25 rounded-lg animate-pulse-glow">
              <span className="text-white font-bold">Net Cost (Your Investment)</span>
              <span className="text-xl font-extrabold neon-cyan">{formatIndianCurrency(netCost)}</span>
            </div>
          </div>
        </div>

        {/* PM Surya Ghar 2026 Subsidy Details */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-right" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">PM Surya Ghar 2026 Subsidy</h2>
            <div className="icon-glow-amber p-1 rounded-full">
              <Award className="text-amber-300" size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border transition-all duration-300 ${requiredCapacity <= 2 ? 'bg-amber-400/10 border-amber-400/25 scale-[1.02]' : 'bg-white/[0.03] border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {requiredCapacity <= 2 && <CheckCircle2 className="text-amber-300 animate-bounce-gentle" size={16} />}
                <span className={`font-semibold ${requiredCapacity <= 2 ? 'text-amber-200' : 'text-slate-300'}`}>Up to 2 kW Systems</span>
              </div>
              <p className="text-white text-lg font-bold drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]">₹{PM_SURYA_GHAR_2026.upTo2kW.toLocaleString('en-IN')}/kW</p>
              <p className="text-slate-400 text-sm mt-1 font-medium">Maximum subsidy: ₹60,000 for 2kW</p>
            </div>
            
            <div className={`p-4 rounded-lg border transition-all duration-300 ${requiredCapacity > 2 ? 'bg-amber-400/10 border-amber-400/25 scale-[1.02]' : 'bg-white/[0.03] border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {requiredCapacity > 2 && <CheckCircle2 className="text-amber-300 animate-bounce-gentle" size={16} />}
                <span className={`font-semibold ${requiredCapacity > 2 ? 'text-amber-200' : 'text-slate-300'}`}>3 kW and Above</span>
              </div>
              <p className="text-white text-lg font-bold drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]">₹{PM_SURYA_GHAR_2026.above3kW.toLocaleString('en-IN')} Fixed</p>
              <p className="text-slate-400 text-sm mt-1 font-medium">Fixed subsidy regardless of system size</p>
            </div>
            
            <div className="p-4 bg-white/[0.03] rounded-lg border border-cyan-500/15">
              <p className="text-slate-200 text-sm">
                <span className="text-white font-bold">Your Subsidy: </span>
                {subsidyBreakdown.category} = <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{formatIndianCurrency(subsidy)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Projection & System Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Savings Projection */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-left" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Savings Projection</h2>
            <div className="icon-glow-cyan p-1 rounded-full">
              <TrendingDown className="text-cyan-400" size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Monthly Generation', value: `${monthlyGeneration.toFixed(0)} kWh` },
              { label: 'Monthly Bill Savings', value: formatIndianCurrency(stats.monthlyBill), highlight: 'cyan' },
            ].map((item, index) => (
              <div 
                key={item.label}
                className="flex justify-between items-center p-4 bg-white/[0.03] rounded-lg hover-lift border border-white/5 animate-fade-in"
                style={{ animationDelay: `${500 + index * 50}ms`, animationFillMode: 'both' }}
              >
                <span className="text-slate-200 font-medium">{item.label}</span>
                <span className={`${item.highlight ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-white'} font-bold`}>{item.value}</span>
              </div>
            ))}
            
            {netMeteringEnabled && (
              <div className="flex justify-between items-center p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg hover-lift animate-scale-in">
                <span className="text-amber-200 font-semibold">Monthly Net Metering Credits</span>
                <span className="text-amber-300 font-bold drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]">+{formatIndianCurrency(monthlyNetMeteringCredits)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-lg hover-lift border border-white/5">
              <span className="text-slate-200 font-medium">Annual Savings</span>
              <span className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{formatIndianCurrency(annualSavings)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg animate-pulse-glow">
              <span className="text-slate-200 font-medium">25-Year Lifetime Savings</span>
              <span className="text-lg font-extrabold neon-cyan">{formatInLakhs(lifetimeSavings)}</span>
            </div>
          </div>

          {/* ROI Calculation */}
          <div className="mt-4 p-4 bg-purple-400/10 border border-purple-400/20 rounded-lg backdrop-blur-sm">
            <p className="text-purple-300 text-sm font-bold mb-1">Break-Even Calculation</p>
            <p className="text-slate-200 text-sm">
              ({formatIndianCurrency(installationCost)} − {formatIndianCurrency(subsidy)}) ÷ ({formatIndianCurrency(effectiveMonthlyBill)} × 12) 
              = <span className="text-purple-300 font-extrabold drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]">{paybackYears === Infinity ? '—' : paybackYears.toFixed(1)} years</span>
            </p>
          </div>
        </div>

        {/* System Requirements */}
        <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-right" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">System Requirements</h2>
            <div className="icon-glow-amber p-1 rounded-full">
              <Zap className="text-amber-300" size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Panel Wattage', value: `${panelWattage}W each` },
              { label: 'Number of Panels', value: `${panelsNeeded} panels` },
              { label: 'Roof Space Needed', value: `${roofArea} sq.m` },
              { label: 'Inverter Size', value: `${requiredCapacity.toFixed(1)} kW` },
            ].map((item, index) => (
              <div 
                key={item.label}
                className="flex justify-between items-center p-4 bg-white/[0.03] rounded-lg hover-lift border border-white/5 animate-fade-in"
                style={{ animationDelay: `${500 + index * 50}ms`, animationFillMode: 'both' }}
              >
                <span className="text-slate-200 font-medium">{item.label}</span>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg hover-lift">
              <span className="text-blue-300 font-semibold">Location</span>
              <span className="text-white font-bold">{cityInfo.name}, {cityInfo.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Standard System Sizes */}
      <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-slate-100 mb-6">Standard System Sizes & Subsidies (2026)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemSizes.map((system, index) => {
            const isRecommended = requiredCapacity <= system.size && requiredCapacity > (system.size - 2);
            const cost = system.size * COST_PER_KW;
            const systemSubsidy = system.size <= 2 
              ? system.size * PM_SURYA_GHAR_2026.upTo2kW 
              : PM_SURYA_GHAR_2026.above3kW;
            const net = cost - systemSubsidy;
            
            return (
              <div 
                key={system.size}
                className={`relative p-5 rounded-xl border transition-all duration-300 hover-lift animate-fade-in backdrop-blur-sm ${
                  isRecommended 
                    ? 'bg-cyan-400/10 border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.15)]' 
                    : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/25'
                }`}
                style={{ animationDelay: `${550 + index * 100}ms`, animationFillMode: 'both' }}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-cyan-400 text-slate-950 text-xs font-bold rounded animate-bounce-gentle shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    Recommended
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Sun className={`${isRecommended ? 'text-cyan-400' : 'text-slate-400'} transition-colors duration-200`} size={20} />
                  <span className="text-white font-bold">{system.size} kW</span>
                </div>
                <p className="text-slate-300 text-sm font-medium mb-1">{system.label}</p>
                <p className="text-slate-400 text-xs mb-3 font-medium">{system.ideal}</p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Cost:</span>
                    <span className="text-slate-200 font-medium">{formatInLakhs(cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Subsidy:</span>
                    <span className="text-cyan-300 font-medium">−₹{(systemSubsidy / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10">
                    <span className="text-slate-300 font-medium">Net:</span>
                    <span className="text-white font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{formatInLakhs(net)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="glass-card rounded-xl p-6 card-hover animate-slide-in-bottom relative z-10" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Benefits of Going Solar in 2026</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'PM Surya Ghar subsidy up to ₹78,000',
            'Net metering: Sell excess power at ₹3.5/unit',
            '25-year panel warranty',
            'Zero electricity bills possible',
            'Increase property value by 4-6%',
            'Reduce carbon footprint significantly',
          ].map((benefit, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg hover-lift border border-white/5 animate-fade-in"
              style={{ animationDelay: `${650 + index * 50}ms`, animationFillMode: 'both' }}
            >
              <CheckCircle2 className="text-cyan-400 flex-shrink-0 drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]" size={18} />
              <span className="text-slate-200 text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

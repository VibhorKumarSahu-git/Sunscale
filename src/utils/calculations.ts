import { Appliance } from '../types';

// ============================================
// 2026 Haryana Electricity Tariff Rates
// ============================================
export const HARYANA_TARIFF_2026 = {
  tier1: { maxUnits: 150, rate: 2.95 },   // 0-150 units: ₹2.95/unit
  tier2: { maxUnits: 300, rate: 5.25 },   // 151-300 units: ₹5.25/unit
  tier3: { maxUnits: 500, rate: 6.45 },   // 301-500 units: ₹6.45/unit
  tier4: { maxUnits: Infinity, rate: 7.10 }, // Above 500 units: ₹7.10/unit
};

// ============================================
// NCR Solar Constants (2026)
// ============================================
export const NCR_SUNLIGHT_CONSTANT = 4.5; // Peak sun hours per day in NCR
export const COST_PER_KW = 65000; // ₹65,000 per kW installation cost

// ============================================
// City-based Sun Hours (Location-Based Efficiency)
// ============================================
export const CITY_DATA: Record<string, { name: string; sunHours: number; state: string }> = {
  gurugram: { name: 'Gurugram', sunHours: 4.5, state: 'Haryana' },
  jaipur: { name: 'Jaipur', sunHours: 5.5, state: 'Rajasthan' },
  bengaluru: { name: 'Bengaluru', sunHours: 4.2, state: 'Karnataka' },
};

// ============================================
// PM Surya Ghar 2026 Subsidy Scheme
// ============================================
export const PM_SURYA_GHAR_2026 = {
  upTo2kW: 30000,     // ₹30,000 per kW for systems up to 2kW
  above3kW: 78000,    // Fixed ₹78,000 for 3kW and above
};

// ============================================
// Carbon Emission Factor (Indian Grid 2026)
// ============================================
export const CO2_PER_KWH = 0.85; // kg CO2 per kWh from Indian grid (updated 2026)
export const CO2_PER_TREE_YEARLY = 21; // kg CO2 absorbed by one mature tree per year

// ============================================
// Net Metering Constants
// ============================================
export const NET_METERING_EXPORT_PERCENT = 0.20; // 20% of generated power exported
export const NET_METERING_RATE = 3.5; // ₹ per unit for exported power

/**
 * Calculate monthly units (kWh) from appliances
 * Formula: (Total Watts × Hours × 30) / 1000
 */
export function calculateMonthlyUnits(appliances: Appliance[]): number {
  return appliances.reduce((sum, appliance) => {
    const totalWatts = appliance.wattage * appliance.quantity;
    const monthlyKwh = (totalWatts * appliance.hoursPerDay * 30) / 1000;
    return sum + monthlyKwh;
  }, 0);
}

/**
 * Calculate daily units (kWh) from appliances
 */
export function calculateDailyUnits(appliances: Appliance[]): number {
  return appliances.reduce((sum, appliance) => {
    const totalWatts = appliance.wattage * appliance.quantity;
    const dailyKwh = (totalWatts * appliance.hoursPerDay) / 1000;
    return sum + dailyKwh;
  }, 0);
}

/**
 * Calculate monthly electricity bill using Haryana 2026 tiered rates
 */
export function calculateMonthlyBill(monthlyUnits: number): number {
  let bill = 0;
  let remainingUnits = monthlyUnits;

  // Tier 1: 0-150 units @ ₹2.95
  if (remainingUnits > 0) {
    const tier1Units = Math.min(remainingUnits, HARYANA_TARIFF_2026.tier1.maxUnits);
    bill += tier1Units * HARYANA_TARIFF_2026.tier1.rate;
    remainingUnits -= tier1Units;
  }

  // Tier 2: 151-300 units @ ₹5.25
  if (remainingUnits > 0) {
    const tier2Units = Math.min(remainingUnits, HARYANA_TARIFF_2026.tier2.maxUnits - HARYANA_TARIFF_2026.tier1.maxUnits);
    bill += tier2Units * HARYANA_TARIFF_2026.tier2.rate;
    remainingUnits -= tier2Units;
  }

  // Tier 3: 301-500 units @ ₹6.45
  if (remainingUnits > 0) {
    const tier3Units = Math.min(remainingUnits, HARYANA_TARIFF_2026.tier3.maxUnits - HARYANA_TARIFF_2026.tier2.maxUnits);
    bill += tier3Units * HARYANA_TARIFF_2026.tier3.rate;
    remainingUnits -= tier3Units;
  }

  // Tier 4: Above 500 units @ ₹7.10
  if (remainingUnits > 0) {
    bill += remainingUnits * HARYANA_TARIFF_2026.tier4.rate;
  }

  return bill;
}

/**
 * Get bill breakdown by tier
 */
export function getBillBreakdown(monthlyUnits: number): {
  tier: string;
  units: number;
  rate: number;
  amount: number;
}[] {
  const breakdown: { tier: string; units: number; rate: number; amount: number }[] = [];
  let remainingUnits = monthlyUnits;

  // Tier 1
  if (remainingUnits > 0) {
    const units = Math.min(remainingUnits, 150);
    breakdown.push({
      tier: '0-150 units',
      units: Math.round(units * 100) / 100,
      rate: HARYANA_TARIFF_2026.tier1.rate,
      amount: units * HARYANA_TARIFF_2026.tier1.rate,
    });
    remainingUnits -= units;
  }

  // Tier 2
  if (remainingUnits > 0) {
    const units = Math.min(remainingUnits, 150);
    breakdown.push({
      tier: '151-300 units',
      units: Math.round(units * 100) / 100,
      rate: HARYANA_TARIFF_2026.tier2.rate,
      amount: units * HARYANA_TARIFF_2026.tier2.rate,
    });
    remainingUnits -= units;
  }

  // Tier 3
  if (remainingUnits > 0) {
    const units = Math.min(remainingUnits, 200);
    breakdown.push({
      tier: '301-500 units',
      units: Math.round(units * 100) / 100,
      rate: HARYANA_TARIFF_2026.tier3.rate,
      amount: units * HARYANA_TARIFF_2026.tier3.rate,
    });
    remainingUnits -= units;
  }

  // Tier 4
  if (remainingUnits > 0) {
    breakdown.push({
      tier: 'Above 500 units',
      units: Math.round(remainingUnits * 100) / 100,
      rate: HARYANA_TARIFF_2026.tier4.rate,
      amount: remainingUnits * HARYANA_TARIFF_2026.tier4.rate,
    });
  }

  return breakdown;
}

/**
 * Calculate required solar system size
 * Formula: System Size (kW) = (Monthly Units / 30) / 4.5 (NCR Sunlight Constant)
 */
export function calculateSolarSystemSize(monthlyUnits: number): number {
  const dailyUnits = monthlyUnits / 30;
  return dailyUnits / NCR_SUNLIGHT_CONSTANT;
}

/**
 * Calculate solar installation cost
 * Flat ₹65,000 per kW
 */
export function calculateInstallationCost(systemSizeKw: number): number {
  return systemSizeKw * COST_PER_KW;
}

/**
 * Calculate PM Surya Ghar 2026 subsidy
 * Up to 2kW: ₹30,000/kW
 * For 3kW and above: Fixed ₹78,000
 */
export function calculateSubsidy(systemSizeKw: number): number {
  if (systemSizeKw <= 0) return 0;
  
  if (systemSizeKw <= 2) {
    // Up to 2kW: ₹30,000 per kW
    return systemSizeKw * PM_SURYA_GHAR_2026.upTo2kW;
  } else {
    // 3kW and above: Fixed ₹78,000
    return PM_SURYA_GHAR_2026.above3kW;
  }
}

/**
 * Calculate subsidy breakdown for display
 */
export function getSubsidyBreakdown(systemSizeKw: number): {
  category: string;
  calculation: string;
  amount: number;
} {
  if (systemSizeKw <= 0) {
    return { category: 'No System', calculation: '-', amount: 0 };
  }
  
  if (systemSizeKw <= 2) {
    return {
      category: `Up to 2kW (${systemSizeKw.toFixed(2)} kW)`,
      calculation: `${systemSizeKw.toFixed(2)} kW × ₹30,000`,
      amount: systemSizeKw * PM_SURYA_GHAR_2026.upTo2kW,
    };
  } else {
    return {
      category: `3kW and above (${systemSizeKw.toFixed(2)} kW)`,
      calculation: 'Fixed subsidy',
      amount: PM_SURYA_GHAR_2026.above3kW,
    };
  }
}

/**
 * Calculate years to break even (ROI)
 * Formula: (Total Cost - Subsidy) / (Current Monthly Bill × 12)
 */
export function calculatePaybackYears(
  installationCost: number,
  subsidy: number,
  monthlyBill: number
): number {
  if (monthlyBill <= 0) return Infinity;
  const netCost = installationCost - subsidy;
  const annualSavings = monthlyBill * 12;
  return netCost / annualSavings;
}

/**
 * Calculate carbon saved if using solar
 * 0.82 kg CO2 per kWh from Indian grid
 */
export function calculateCarbonSaved(monthlyUnits: number): number {
  return monthlyUnits * CO2_PER_KWH;
}

/**
 * Calculate annual carbon saved
 */
export function calculateAnnualCarbonSaved(monthlyUnits: number): number {
  return calculateCarbonSaved(monthlyUnits) * 12;
}

/**
 * Get effective electricity rate based on consumption
 */
export function getEffectiveRate(monthlyUnits: number): number {
  if (monthlyUnits <= 0) return 0;
  return calculateMonthlyBill(monthlyUnits) / monthlyUnits;
}

/**
 * Calculate number of solar panels needed
 * Assuming 400W panels
 */
export function calculatePanelsNeeded(systemSizeKw: number, panelWattage: number = 400): number {
  return Math.ceil((systemSizeKw * 1000) / panelWattage);
}

/**
 * Calculate roof area needed
 * Approximately 2 sq meters per panel
 */
export function calculateRoofArea(panelsNeeded: number): number {
  return panelsNeeded * 2;
}

/**
 * Calculate monthly solar generation
 */
export function calculateMonthlyGeneration(systemSizeKw: number): number {
  return systemSizeKw * NCR_SUNLIGHT_CONSTANT * 30;
}

/**
 * Format currency in Indian format
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency in Lakhs
 */
export function formatInLakhs(amount: number): string {
  return `₹${(amount / 100000).toFixed(2)}L`;
}

/**
 * Calculate solar system size based on city's sun hours
 */
export function calculateSolarSystemSizeByCity(monthlyUnits: number, cityKey: string): number {
  const sunHours = CITY_DATA[cityKey]?.sunHours || NCR_SUNLIGHT_CONSTANT;
  const dailyUnits = monthlyUnits / 30;
  return dailyUnits / sunHours;
}

/**
 * Calculate monthly solar generation based on city
 */
export function calculateMonthlyGenerationByCity(systemSizeKw: number, cityKey: string): number {
  const sunHours = CITY_DATA[cityKey]?.sunHours || NCR_SUNLIGHT_CONSTANT;
  return systemSizeKw * sunHours * 30;
}

/**
 * Calculate trees equivalent for carbon saved
 * Total CO2 / 21 (Kg CO2 absorbed by one mature tree per year)
 */
export function calculateTreesEquivalent(annualCO2Saved: number): number {
  return annualCO2Saved / CO2_PER_TREE_YEARLY;
}

/**
 * Calculate CO2 saved with updated 0.85 emission factor
 */
export function calculateCO2SavedAnnual(monthlyUnits: number): number {
  return monthlyUnits * 12 * CO2_PER_KWH;
}

/**
 * Calculate net metering credits
 * 20% of generated solar power exported back to grid at ₹3.5/unit
 */
export function calculateNetMeteringCredits(monthlyGeneration: number): number {
  const exportedUnits = monthlyGeneration * NET_METERING_EXPORT_PERCENT;
  return exportedUnits * NET_METERING_RATE;
}

/**
 * Calculate annual net metering credits
 */
export function calculateAnnualNetMeteringCredits(monthlyGeneration: number): number {
  return calculateNetMeteringCredits(monthlyGeneration) * 12;
}

/**
 * Calculate monthly cost comparison (Grid vs Solar)
 */
export function calculateMonthlyCostComparison(
  monthlyBill: number,
  systemSizeKw: number,
  installationCost: number,
  subsidy: number,
  netMeteringEnabled: boolean = false,
  cityKey: string = 'gurugram'
): { month: number; gridCost: number; solarCost: number }[] {
  const monthlyGeneration = calculateMonthlyGenerationByCity(systemSizeKw, cityKey);
  const netMeteringMonthly = netMeteringEnabled ? calculateNetMeteringCredits(monthlyGeneration) : 0;
  const netCost = installationCost - subsidy;
  
  // EMI calculation (assuming 7 year loan at 8% interest for simplicity)
  const monthlyEMI = netCost / 84; // Simplified EMI over 7 years
  
  const comparison = [];
  let cumulativeGridCost = 0;
  let cumulativeSolarCost = 0;
  
  for (let month = 1; month <= 12; month++) {
    cumulativeGridCost += monthlyBill;
    // Solar cost = EMI - net metering credits (if any)
    cumulativeSolarCost += Math.max(0, monthlyEMI - netMeteringMonthly);
    
    comparison.push({
      month,
      gridCost: Math.round(cumulativeGridCost),
      solarCost: Math.round(cumulativeSolarCost),
    });
  }
  
  return comparison;
}

/**
 * Get appliance-wise consumption breakdown for charts
 */
export function getApplianceConsumptionBreakdown(appliances: Appliance[]): {
  labels: string[];
  data: number[];
  colors: string[];
}[] {
  const colors = [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ];

  const sortedAppliances = [...appliances].sort((a, b) => {
    const consumptionA = (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000;
    const consumptionB = (b.wattage * b.quantity * b.hoursPerDay * 30) / 1000;
    return consumptionB - consumptionA;
  });

  return [{
    labels: sortedAppliances.map(a => a.name),
    data: sortedAppliances.map(a => (a.wattage * a.quantity * a.hoursPerDay * 30) / 1000),
    colors: sortedAppliances.map((_, i) => colors[i % colors.length]),
  }];
}

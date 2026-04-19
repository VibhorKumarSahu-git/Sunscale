export interface Appliance {
  id: string;
  name: string;
  wattage: number;
  hoursPerDay: number;
  quantity: number;
}

export type TabType = 'Dashboard' | 'Calculator' | 'Solar Planner' | 'Environmental Impact';

export interface StatsData {
  totalConsumption: number;
  monthlyBill: number;
  solarCapacityNeeded: number;
  carbonSaved: number;
}

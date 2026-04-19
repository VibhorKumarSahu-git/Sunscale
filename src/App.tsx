import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import SolarPlanner from './components/SolarPlanner';
import EnvironmentalImpact from './components/EnvironmentalImpact';
import { Appliance, TabType, StatsData } from './types';
import {
  calculateMonthlyUnits,
  calculateMonthlyBill,
  calculateSolarSystemSizeByCity,
  calculateCarbonSaved,
} from './utils/calculations';

// Default appliances for demonstration
const defaultAppliances: Appliance[] = [
  { id: '1', name: 'LED Bulb', wattage: 10, hoursPerDay: 6, quantity: 8 },
  { id: '2', name: 'Ceiling Fan', wattage: 75, hoursPerDay: 10, quantity: 4 },
  { id: '3', name: 'Refrigerator', wattage: 150, hoursPerDay: 24, quantity: 1 },
  { id: '4', name: 'Television', wattage: 100, hoursPerDay: 5, quantity: 2 },
  { id: '5', name: 'Air Conditioner', wattage: 1500, hoursPerDay: 8, quantity: 2 },
  { id: '6', name: 'Washing Machine', wattage: 500, hoursPerDay: 1, quantity: 1 },
];

// Cursor trail particle
interface Particle {
  x: number;
  y: number;
  id: number;
  opacity: number;
  scale: number;
}

function CursorTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const throttle = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (throttle.current) return;
      throttle.current = true;
      setTimeout(() => { throttle.current = false; }, 40);

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) return;

      lastPos.current = { x: e.clientX, y: e.clientY };

      const id = nextId.current++;
      const newParticle: Particle = {
        x: e.clientX,
        y: e.clientY,
        id,
        opacity: 0.7,
        scale: 1,
      };

      setParticles(prev => [...prev.slice(-12), newParticle]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] print:hidden">
      {particles.map((p, i) => {
        const age = (particles.length - i) / particles.length;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.x - 3,
              top: p.y - 3,
              width: 6 * (1 - age * 0.6),
              height: 6 * (1 - age * 0.6),
              background: `rgba(34, 211, 238, ${0.6 * (1 - age)})`,
              boxShadow: `0 0 ${8 * (1 - age)}px rgba(34, 211, 238, ${0.4 * (1 - age)})`,
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              transform: `scale(${1 - age * 0.5})`,
            }}
          />
        );
      })}
    </div>
  );
}

function App() {
  // Shared state
  const [applianceList, setApplianceList] = useState<Appliance[]>(defaultAppliances);
  const [currentTab, setCurrentTab] = useState<TabType>('Dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Location-based efficiency state
  const [selectedCity, setSelectedCity] = useState<string>('gurugram');

  // Net metering state
  const [netMeteringEnabled, setNetMeteringEnabled] = useState<boolean>(false);

  // Calculate stats based on appliance list using 2026 Haryana rates
  const stats: StatsData = useMemo(() => {
    const totalConsumption = calculateMonthlyUnits(applianceList);
    const monthlyBill = calculateMonthlyBill(totalConsumption);
    const solarCapacityNeeded = calculateSolarSystemSizeByCity(totalConsumption, selectedCity);
    const carbonSaved = calculateCarbonSaved(totalConsumption);

    return {
      totalConsumption,
      monthlyBill,
      solarCapacityNeeded,
      carbonSaved,
    };
  }, [applianceList, selectedCity]);

  // Appliance handlers
  const handleAddAppliance = useCallback((appliance: Appliance) => {
    setApplianceList(prev => [...prev, appliance]);
  }, []);

  const handleUpdateAppliance = useCallback((updatedAppliance: Appliance) => {
    setApplianceList(prev =>
      prev.map(a => a.id === updatedAppliance.id ? updatedAppliance : a)
    );
  }, []);

  const handleDeleteAppliance = useCallback((id: string) => {
    setApplianceList(prev => prev.filter(a => a.id !== id));
  }, []);

  // Print handler for Solar Feasibility Report
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Render current tab content
  const renderContent = () => {
    switch (currentTab) {
      case 'Dashboard':
        return <Dashboard stats={stats} applianceList={applianceList} />;
      case 'Calculator':
        return (
          <Calculator
            appliances={applianceList}
            onAddAppliance={handleAddAppliance}
            onUpdateAppliance={handleUpdateAppliance}
            onDeleteAppliance={handleDeleteAppliance}
            totalUnits={stats.totalConsumption}
            monthlyBill={stats.monthlyBill}
          />
        );
      case 'Solar Planner':
        return (
          <SolarPlanner
            stats={stats}
            applianceList={applianceList}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            netMeteringEnabled={netMeteringEnabled}
            setNetMeteringEnabled={setNetMeteringEnabled}
          />
        );
      case 'Environmental Impact':
        return (
          <EnvironmentalImpact
            stats={stats}
            applianceList={applianceList}
            selectedCity={selectedCity}
            netMeteringEnabled={netMeteringEnabled}
            onPrint={handlePrint}
          />
        );
      default:
        return <Dashboard stats={stats} applianceList={applianceList} />;
    }
  };

  return (
    <div className="min-h-screen bg-animated relative overflow-hidden text-slate-100">
      {/* Cursor Trail */}
      <CursorTrail />

      {/* Animated Background Particles */}
      <div className="particles print:hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              opacity: 0.08 + Math.random() * 0.15,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-blue-500/[0.03] pointer-events-none print:hidden z-0" />

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content */}
      {/* Main Content */}
      <main className="min-h-screen relative z-10 w-full lg:pl-64 transition-all duration-300">
        <div className="p-4 lg:p-8 xl:p-10 pt-16 lg:pt-8 max-w-[1600px] mx-auto">
          <div className="tab-content">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

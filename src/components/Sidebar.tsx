import {
  LayoutDashboard,
  Calculator,
  Sun,
  Leaf,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const navItems: { label: TabType; icon: React.ReactNode }[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Calculator', icon: <Calculator size={20} /> },
  { label: 'Solar Planner', icon: <Sun size={20} /> },
  { label: 'Environmental Impact', icon: <Leaf size={20} /> },
];

export default function Sidebar({ currentTab, setCurrentTab, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const handleNavClick = (tab: TabType) => {
    setCurrentTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
    
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`lg:hidden fixed top-3 left-3 z-50 w-10 h-10 sm:w-12 sm:h-12 glass-card rounded-lg text-slate-200 hover:text-cyan-400 transition-all duration-300 print:hidden btn-press hover:scale-105 electric-hover flex items-center justify-center`}
      >
        <div className={`transition-transform duration-300 ${isMobileOpen ? 'rotate-180' : ' '}`}>
          {isMobileOpen ? <X size={18} className="sm:size-5" /> : <Menu size={18} className="sm:size-5" />}
        </div>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        absolute top-0 left-0 z-40 h-screen
        w-64 bg-black/60 backdrop-blur-xl border-r border-cyan-500/10
        transform transition-all duration-300 ease-out sidebar-glow
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col print:hidden
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-cyan-500/10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2 icon-glow-cyan rounded-lg transition-all duration-300 group-hover:scale-110">
              <Zap className="text-cyan-400 transition-transform duration-300 group-hover:rotate-12" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">SunScale</h1>
              <p className="text-xs text-slate-400">Energy Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li
                key={item.label}
                className="animate-slide-in-left"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <button
                  onClick={() => handleNavClick(item.label)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-300 text-left relative overflow-hidden
                    btn-press group
                    ${currentTab === item.label
                      ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 sidebar-active-glow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {currentTab === item.label && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full animate-fade-in shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  )}

                  {/* Icon with glow */}
                  <span className={`transition-transform duration-300 ${currentTab === item.label ? 'scale-110 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>

                  <span className="font-medium text-[15px]">{item.label}</span>

                  {/* Hover glow effect */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${currentTab === item.label ? 'opacity-100' : ''}
                  `} />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Energy Tip */}
        <div className="p-4">
          <div className="p-4 bg-cyan-500/5 backdrop-blur-sm rounded-xl border border-cyan-500/15 animate-pulse-glow">
            <p className="text-xs text-cyan-400 font-semibold mb-1">💡 Energy Tip</p>
            <p className="text-xs text-slate-300">Switch to LED bulbs to save up to 80% on lighting costs!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/10">
          <div className="px-4 py-3 bg-white/[0.03] rounded-lg">
            <p className="text-xs text-slate-400">Version 2026.1</p>
            <p className="text-xs text-slate-400">© 2026 SunScale</p>
          </div>
        </div>
      </aside>
    </>
  );
}

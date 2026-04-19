import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  glowColor?: 'cyan' | 'amber';
}

export default function StatsCard({ title, value, unit, icon: Icon, trend, delay = 0, glowColor = 'cyan' }: StatsCardProps) {
  const isCyan = glowColor === 'cyan';

  return (
    <div 
      className="glass-card rounded-xl p-6 card-hover group relative z-10 animate-slide-in-bottom overflow-hidden"
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-slate-300 text-sm font-semibold mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl lg:text-3xl font-bold text-white number-transition ${isCyan ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]'}`}>
              {value}
            </span>
            <span className="text-slate-400 text-sm font-medium">{unit}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-cyan-400' : 'text-red-400'}`}>
              <span className={`transition-transform duration-300 inline-block ${trend.isPositive ? 'group-hover:-translate-y-1' : 'group-hover:translate-y-1'}`}>
                {trend.isPositive ? '↑' : '↓'}
              </span>
              <span className="font-medium">{Math.abs(trend.value)}%</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isCyan ? 'icon-glow-cyan' : 'icon-glow-amber'}`}>
          <Icon className={`${isCyan ? 'text-cyan-400' : 'text-amber-300'} transition-transform duration-300 group-hover:scale-110`} size={24} />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isCyan ? 'from-transparent via-cyan-500/50 to-transparent' : 'from-transparent via-amber-400/50 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl`} />
    </div>
  );
}

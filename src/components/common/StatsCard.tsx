import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'blue' | 'peach' | 'mint' | 'lavender' | 'amber';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'blue',
  onClick,
}) => {
  // Styles matching the reference claymorphic 3D pastel cards
  const variantStyles = {
    mint: {
      cardClass: 'clay-pastel-mint',
      iconBox: 'bg-[#BCE9D1] text-[#1E5C45] dark:bg-[#1E4A3A] dark:text-[#A7F3D0]',
      titleClass: 'text-[#2D6A4F] dark:text-emerald-300',
      valueClass: 'text-[#1B4332] dark:text-white',
      trendClass: 'text-[#2D6A4F] dark:text-emerald-300',
    },
    peach: {
      cardClass: 'clay-pastel-peach',
      iconBox: 'bg-[#FACBC0] text-[#9A3423] dark:bg-[#522E23] dark:text-[#FECDD3]',
      titleClass: 'text-[#8C3A2B] dark:text-rose-300',
      valueClass: 'text-[#682117] dark:text-white',
      trendClass: 'text-[#8C3A2B] dark:text-rose-300',
    },
    amber: {
      cardClass: 'clay-pastel-amber',
      iconBox: 'bg-[#FCE6B3] text-[#A16207] dark:bg-[#533E1A] dark:text-[#FDE68A]',
      titleClass: 'text-[#854D0E] dark:text-amber-300',
      valueClass: 'text-[#713F12] dark:text-white',
      trendClass: 'text-[#854D0E] dark:text-amber-300',
    },
    blue: {
      cardClass: 'clay-pastel-blue',
      iconBox: 'bg-[#CBE4FE] text-[#1D4ED8] dark:bg-[#1F3A66] dark:text-[#BFDBFE]',
      titleClass: 'text-[#1E40AF] dark:text-sky-300',
      valueClass: 'text-[#172554] dark:text-white',
      trendClass: 'text-[#1E40AF] dark:text-sky-300',
    },
    lavender: {
      cardClass: 'bg-[#F1EBFD] dark:bg-[#251A3E] border border-[#E1D4FB] dark:border-[#3C2A63] text-[#4C1D95]',
      iconBox: 'bg-[#E3D3FB] text-[#6D28D9] dark:bg-[#3C2A63] dark:text-[#DDD6FE]',
      titleClass: 'text-[#5B21B6] dark:text-purple-300',
      valueClass: 'text-[#3B0764] dark:text-white',
      trendClass: 'text-[#5B21B6] dark:text-purple-300',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-[26px] p-5 sm:p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
        variantStyles.cardClass
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top 3D Squircle Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-13 h-13 p-3.5 clay-squircle ${variantStyles.iconBox}`}>
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>

        {trend && (
          <span
            className={`text-xs font-bold ${variantStyles.trendClass}`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Title & Large Value */}
      <div className="space-y-1">
        <p className={`text-xs sm:text-sm font-semibold tracking-tight ${variantStyles.titleClass}`}>
          {title}
        </p>
        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${variantStyles.valueClass}`}>
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11px] opacity-80 pt-0.5 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

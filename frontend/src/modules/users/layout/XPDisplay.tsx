import React from "react";
import { Star } from "lucide-react";

interface XPDisplayProps {
  xpBalance: number;
  className?: string;
  showTooltip?: boolean;
}

interface TooltipContentProps {
  title?: string;
  description?: string;
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  title = "Your Experience Points",
  description = "Members Only !!",
}) => (
  <div className="flex flex-col gap-1">
    <span className="font-semibold">{title}</span>
    <div className="text-gray-400 text-[10px]">{description}</div>
  </div>
);

const XPDisplay: React.FC<XPDisplayProps> = ({
  xpBalance,
  className = "",
  showTooltip = true,
}) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 border border-emerald-600 rounded-full hover:from-emerald-600 hover:to-green-700 transition-all duration-300">
        <div className="relative">
          <Star
            size={18}
            className="text-white animate-pulse"
            fill="rgba(253, 224, 71, 0.2)"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-white/80 font-medium">XP BALANCE</span>
          <span className="text-sm font-bold text-white">
            {xpBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {showTooltip && (
        <div className="absolute hidden group-hover:block top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-emerald-900 text-white text-xs rounded-lg whitespace-nowrap z-50 border border-emerald-700">
          <TooltipContent />
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-emerald-900 rotate-45 border-l border-t border-emerald-700"></div>
        </div>
      )}
    </div>
  );
};

export default XPDisplay;

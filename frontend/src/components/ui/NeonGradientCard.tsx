import React from "react";

interface NeonGradientCardProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  children,
  color = "#6EE5A8",
  className = "",
}) => {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Gradient Border */}
      <div
        className="absolute inset-0 blur-sm opacity-70"
        style={{
          background: `radial-gradient(circle at top left, ${color}, transparent 70%)`,
          zIndex: -1,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 bg-gray-800/80 backdrop-blur rounded-xl h-full border border-gray-700/50 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default NeonGradientCard;

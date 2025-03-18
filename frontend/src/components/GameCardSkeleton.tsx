import { motion } from "framer-motion";

interface GameCardSkeletonProps {
  index?: number;
}

const GameCardSkeleton: React.FC<GameCardSkeletonProps> = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative h-[320px] rounded-2xl bg-[#111111] border-2 border-gamer-green/10 hover:border-gamer-green/50 transition-all duration-300 overflow-hidden"
    >
      {/* Skeleton Image Container */}
      <div className="relative w-full h-44 overflow-hidden bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
      </div>

      {/* Skeleton Content Container */}
      <div className="relative p-4">
        {/* Skeleton Title */}
        <div className="h-6 w-3/4 bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a] animate-pulse rounded-md"></div>

        {/* Skeleton Rating */}
        <div className="flex items-center mt-2">
          <div className="h-4 w-24 bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a] animate-pulse rounded-md"></div>
        </div>

        {/* Skeleton Genres */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="h-6 w-16 bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a] animate-pulse rounded-full"></div>
          <div className="h-6 w-20 bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a] animate-pulse rounded-full"></div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-gamer-green/20 group-hover:ring-gamer-green/50 transition-all duration-300" />
    </motion.div>
  );
};

export default GameCardSkeleton; 
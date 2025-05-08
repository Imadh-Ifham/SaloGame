import React from "react";
import { motion } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface GameCardProps {
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
  index: number;
}

// Memoized GameCard component to prevent unnecessary re-renders
const GameCard = React.memo<GameCardProps>(({
  image,
  name,
  rating,
  genres,
  index,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      if (roundedRating >= i) {
        stars.push(<FaStar key={i} className="w-3 h-3 text-gamer-green" />);
      } else if (roundedRating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="w-3 h-3 text-gamer-green" />);
      } else {
        stars.push(<FaRegStar key={i} className="w-3 h-3 text-gamer-green" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative h-[320px] rounded-2xl bg-[#111111] border-2 border-gamer-green/10 hover:border-gamer-green/50 transition-all duration-300 overflow-hidden"
    >
      {/* Game Image Container */}
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative p-4">
        {/* Title */}
        <h3 className="text-sm font-press text-white group-hover:text-gamer-green transition-colors truncate">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {renderStars(rating)}
            <span className="ml-2 text-xs text-gamer-green">({rating.toFixed(1)})</span>
          </div>
        </div>

        {/* Genres - Limited to 2 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs font-medium text-gamer-green bg-gamer-green/10 rounded-full border border-gamer-green/20"
            >
              {genre}
            </span>
          ))}
          {genres.length > 2 && (
            <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-800/50 rounded-full">
              +{genres.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-gamer-green/20 group-hover:ring-gamer-green/50 transition-all duration-300" />
    </motion.div>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard; 
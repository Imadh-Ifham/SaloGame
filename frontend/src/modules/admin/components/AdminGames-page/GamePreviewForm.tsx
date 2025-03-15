import React from "react";
import { Button } from "@headlessui/react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface GamePreviewProps {
  gameData: {
    name: string;
    description: string;
    rating: number;
    image?: string;
    background_image?: string;
    genres: string[];
  };
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const GamePreviewForm: React.FC<GamePreviewProps> = ({
  gameData,
  onConfirm,
  onCancel,
  loading
}) => {
  // Get the correct image URL
  const imageUrl = gameData.background_image || gameData.image;

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
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={gameData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-press text-white">{gameData.name}</h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(gameData.rating)}
          </div>
          <span className="text-gamer-green text-sm">({gameData.rating.toFixed(1)})</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {gameData.genres.map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 text-xs font-medium text-gamer-green bg-gamer-green/10 rounded-full border border-gamer-green/20"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="prose prose-invert max-w-none prose-sm">
          <p className="text-gray-300 leading-relaxed text-sm max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gamer-green/20 scrollbar-track-transparent">
            {gameData.description}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-3 border-t border-gray-700">
        <Button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-3 py-1.5 text-sm bg-gamer-green text-white rounded-lg hover:bg-gamer-green/90 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding Game..." : "Add Game"}
        </Button>
      </div>
    </div>
  );
};

export default GamePreviewForm; 
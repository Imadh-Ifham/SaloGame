import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Importing star icons from react-icons

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
}

interface GameCardProps {
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
  index: number;
}

const GameCard: React.FC<GameCardProps> = ({
  image,
  name,
  rating,
  description,
  genres,
  index,
}) => {
  // Function to truncate the description
  const truncateText = (text: string, limit: number) => {
    if (text.length > limit) {
      return text.slice(0, limit) + "...";
    }
    return text;
  };

  // Function to render star icons based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      if (roundedRating >= i) {
        // Full Star
        stars.push(<FaStar key={i} className="w-4 h-4 text-gamer-green" />);
      } else if (roundedRating >= i - 0.5) {
        // Half Star
        stars.push(
          <FaStarHalfAlt key={i} className="w-4 h-4 text-gamer-green" />
        );
      } else {
        // Empty Star
        stars.push(<FaRegStar key={i} className="w-4 h-4 text-gamer-green" />);
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
      className="flex group relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background dark:bg-background-dark border border-border-primary"
    >
      {/* Game Image */}
      <div className="w-1/3 h-40 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Content */}
      <div className="ml-6 flex flex-col justify-between w-2/3">
        <div>
          <h3 className="text-xl font-poppins font-semibold mb-2 text-text-primary">
            {name}
          </h3>
          <p className="text-sm font-poppins text-text-secondary dark:text-neutral-50 mb-4">
            {truncateText(description, 100)} {/* Truncated Description */}
          </p>
          {/* Genres as Pill-Shaped Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 text-xs font-medium dark:text-white text-gamer-green-dark bg-transparent border border-gamer-green rounded-full shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center text-base font-poppins text-gamer-green mt-4">
          {/* Render Stars */}
          <div className="flex items-center">
            {renderStars(rating)}
            <span className="ml-2 text-xs">({rating.toFixed(2)})</span>
          </div>
        </div>
      </div>

      {/* Glowing Outline */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-2xl transition-all duration-300" />
    </motion.div>
  );
};

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]); // State to hold game data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [showMore, setShowMore] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setScreenSize("desktop"); // lg and above
      else if (width >= 768) setScreenSize("tablet"); // md
      else setScreenSize("mobile"); // sm and below
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/games");
        if (response.data.success) {
          setGames(response.data.data);
        } else {
          setError("Failed to fetch games.");
        }
      } catch (err) {
        setError((err as Error).message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Determine visible games based on screen size and "showMore" state
  const visibleGames = (() => {
    if (showMore) return games; // Show all cards if "showMore" is true
    if (screenSize === "desktop") return games; // Show all cards for desktop by default
    if (screenSize === "tablet") return games.slice(0, 4); // Show 4 cards for tablet
    return games.slice(0, 2); // Show 2 cards for mobile
  })();

  const showMoreButton = screenSize === "mobile" || screenSize === "tablet"; // Only show the button for mobile and tablet screens

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
            Explore Our{" "}
            <span className="text-gray-900 dark:text-white">
              Top <span className="text-primary-dark">Games</span>
            </span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        {/* Handling Loading and Error States */}
        {loading ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading games...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          // Game Cards
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mt-16">
            {visibleGames.map((game, index) => (
              <GameCard
                key={game._id} // Use unique ID as key
                image={game.image}
                name={game.name}
                rating={game.rating}
                description={game.description}
                genres={game.genres} // Pass genres to GameCard
                index={index}
              />
            ))}
          </div>
        )}

        {/* Show More Button */}
        {!loading &&
          !error &&
          showMoreButton &&
          games.length > (screenSize === "mobile" ? 2 : 4) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-8"
            >
              <Button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all duration-300"
              >
                {showMore ? "Show Less" : "Show More"}
                {showMore ? (
                  <ChevronUpIcon className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                )}
              </Button>
            </motion.div>
          )}
      </div>
    </HomeLayout>
  );
};

export default GamesPage;

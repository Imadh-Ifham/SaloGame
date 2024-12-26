import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid"; // Icons for show more/less button
import { Button } from "@headlessui/react"; // Button Component
import HomeLayout from "../layout/HomeLayout";

interface GameCardProps {
  image: string;
  name: string;
  rating: number;
  description: string;
  index: number;
}

const GameCard: React.FC<GameCardProps> = ({
  image,
  name,
  rating,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex group relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background border border-border-primary"
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
          <p className="text-sm font-poppins text-text-secondary mb-4">
            {description}
          </p>
        </div>
        <div className="flex items-center text-base font-poppins text-green-500">
          {/* SVG Star */}
          {rating}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Glowing Outline */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-2xl transition-all duration-300" />
    </motion.div>
  );
};

const GamesPage: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  const games = [
    {
      image:
        "https://cdn.kobo.com/book-images/0a77b6ba-f48f-4cfa-ae54-c6eef1767779/353/569/90/False/red-dead-redemption-1.jpg",
      name: "Red Dead Redemption 1",
      rating: 4.8,
      description:
        "Journey across the sprawling expanses of the American West and Mexico in Red Dead Redemption, and its zombie-horror companion, Undead Nightmare.",
    },
    {
      image:
        "https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg",
      name: "God of War",
      rating: 4.9,
      description:
        "Follow Kratos and Atreus on a mythical journey in this critically acclaimed action-adventure game.",
    },
    {
      image:
        "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
      name: "The Witcher 3: Wild Hunt",
      rating: 4.9,
      description:
        "Dive into an epic fantasy world as Geralt of Rivia, a monster slayer for hire.",
    },
    {
      image:
        "https://image.api.playstation.com/vulcan/ap/rnd/202008/0416/6Bo40lnWU0BhgrOUm7Cb6by3.png?w=440",
      name: "Cyberpunk 2077",
      rating: 4.6,
      description:
        "Immerse yourself in the neon-lit streets of Night City in this open-world RPG.",
    },
    {
      image:
        "https://m.media-amazon.com/images/M/MV5BNjQzMDlkNDctYmE3Yi00ZWFiLTlmOWYtMjI4MzQ4Y2JhZjY2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      name: "Minecraft",
      rating: 4.7,
      description:
        "Unleash your creativity and build anything you can imagine in this block-building sandbox game.",
    },
    {
      image:
        "https://cdn.europosters.eu/image/1300/canvas-print-the-legend-of-zelda-breath-of-the-wild-view-i111579.jpg",
      name: "The Legend of Zelda: Breath of the Wild",
      rating: 4.9,
      description:
        "Explore the vast open world of Hyrule and save the kingdom in this masterpiece of adventure.",
    },
  ];

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
            <span className="text-gray-900">
              Top <span className="text-primary-dark">Games</span>
            </span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        {/* Game Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mt-16">
          {visibleGames.map((game, index) => (
            <GameCard
              key={index}
              image={game.image}
              name={game.name}
              rating={game.rating}
              description={game.description}
              index={index}
            />
          ))}
        </div>

        {/* Show More Button */}
        {showMoreButton && (
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

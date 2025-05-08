import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";

import fifa from "../../../assets/fifa.jpg";
import Leona from "../../../assets/Leona.jpg";
import clancy from "../../../assets/clancy.jpg";
import red from "../../../assets/red.jpg";
import bros from "../../../assets/bros.jpg";
import kids1 from "../../../assets/kids1.jpg";
import kids2 from "../../../assets/kids2.jpg";
import kids3 from "../../../assets/kids3.jpg";

import offer1 from "../../../assets/offer1.jpg";
import offer2 from "../../../assets/offer2.jpg";
import offer3 from "../../../assets/offer3.jpg";
import offer4 from "../../../assets/offer4.jpg";

const HomePage: React.FC = () => {
  return (
    <HomeLayout>
      <HeroSection />
      <FeaturedGamesSection />
      <OffersSection />
      <StatsSection />
      <NewsSection />
    </HomeLayout>
  );
};

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [Leona, clancy, fifa, red, bros];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 font-press">
            Welcome To SaloGame
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
            Discover, Play, and Conquer in the Ultimate Gaming Universe
          </p>
          <button
            onClick={() => navigate("/bookings")}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-lg font-semibold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg shadow-green-500/20"
          >
            Book Now
          </button>
        </motion.div>

        {/* Platform Stats */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8">
          {["50K+ Games", "10M+ Players", "Live Support"].map((stat) => (
            <div
              key={stat}
              className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-white/90">{stat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedGamesSection: React.FC = () => {
  const featuredGames = [
    { id: 1, title: "FIFA 2", genre: "FPS", image: fifa },
    { id: 2, title: "Call of Duty4", genre: "RPG", image: Leona },
    { id: 3, title: "Call of Duty4", genre: "Strategy", image: clancy },
    { id: 4, title: "Red Dead Dedumption", genre: "MMORPG", image: red },
    { id: 5, title: "Neon Racing", genre: "Sports", image: bros },
    { id: 6, title: "Kids1", genre: "kids", image: kids1 },
    { id: 6, title: "Kids2", genre: "kids", image: kids2 },
    { id: 6, title: "Kids1", genre: "kids", image: kids3 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10,
      },
    },
  };

  const chainVariants = {
    animate: {
      x: ["0%", "-100%"],
      transition: {
        x: {
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        },
      },
    },
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12 text-white"
        >
          Trending <span className="text-green-500">Games</span>
        </motion.h2>

        {/* Animated Chain Container */}
        <div className="relative h-[400px] overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 flex gap-8"
            variants={chainVariants}
            animate="animate"
            whileHover={{ animationPlayState: "paused" }}
          >
            {[...featuredGames, ...featuredGames].map((game, index) => (
              <motion.div
                key={`${game.id}-${index}`}
                className="w-[300px] h-[350px] relative overflow-hidden rounded-2xl bg-gray-800 cursor-pointer group"
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {game.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {game.genre}
                    </span>
                    <motion.span
                      className="text-white/80 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ★★★★☆
                    </motion.span>
                  </div>
                </div>

                {/* Chain Link Effect */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-400 opacity-40 group-hover:opacity-80 transition-opacity">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-900 to-transparent z-20" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-900 to-transparent z-20" />
        </div>
      </div>
    </section>
  );
};

const OffersSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const offers = [
    {
      image: offer1,
      description: "General Offer : Special offers available to all users",
    },
    {
      image: offer2,
      description:
        " Membership Offer : Exclusive deals for different membership tiers",
    },
    {
      image: offer3,
      description:
        "Time Based offer: Lmited-time discounts and seasonal promotions",
    },

    {
      image: offer4,
      description: "Seasonal offer: Premium deals for VIP members",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [offers.length]);

  return (
    <section className="relative w-full max-w-7xl mx-auto my-20 px-4">
      <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOfferIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${offers[currentOfferIndex].image})`,
            }}
          />
        </AnimatePresence>

        {/* Transparent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent" />

        <div className="relative z-10 h-full flex flex-col items-start justify-end p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOfferIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 font-press">
                Special Offers
              </h2>
              <p className="text-xl md:text-2xl text-white font-semibold drop-shadow-lg">
                {offers[currentOfferIndex].description}
              </p>
              <motion.button
                onClick={() => navigate("/offers")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-lg font-semibold rounded-lg shadow-lg shadow-green-500/30 hover:shadow-xl transition-all"
              >
                Claim Offer Now →
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentOfferIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentOfferIndex
                  ? "bg-green-400 scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Offer ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { number: "500+", label: "Active Players" },
    { number: "20+", label: "Tournaments" },
    { number: "99%", label: "Uptime" },
  ];

  return (
    <section className="py-16 bg-black/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center p-6 bg-gray-800/30 rounded-xl backdrop-blur-sm"
            >
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300 uppercase text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsSection: React.FC = () => {
  const newsItems = [
    { title: "New Tournament Announcement", date: "2024-03-15" },
    { title: "Game of the Year Awards", date: "2024-03-12" },
    { title: "Server Maintenance Update", date: "2024-03-10" },
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Latest <span className="text-green-500">News</span>
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {newsItems.map((news, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 10 }}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div>
                <h3 className="text-white font-semibold">{news.title}</h3>
                <p className="text-gray-400 text-sm">{news.date}</p>
              </div>
              <span className="text-green-400">→</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePage;

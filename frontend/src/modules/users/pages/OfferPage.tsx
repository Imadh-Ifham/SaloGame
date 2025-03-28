import React from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import { motion } from "framer-motion";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import {
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

// Custom neon colors for different offer types
const offerTypeColors = {
  timeBased: { firstColor: "#FF6B6B", secondColor: "#FF8E53" }, // Red-Orange
  membership: { firstColor: "#00FF8E", secondColor: "#00D1B2" }, // Green
  general: { firstColor: "#4A90E2", secondColor: "#6AADF4" }, // Blue
  seasonal: { firstColor: "#BD10E0", secondColor: "#B24BF3" }, // Purple
};

const OfferCategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "TIME-BASED Offers",
      path: "/offers/time-based",
      description: "Limited-time discounts and seasonal promotions",
      neonColors: offerTypeColors.timeBased,
      icon: <ClockIcon className="w-9 h-9" />,
      bgPattern:
        "radial-gradient(circle, rgba(255,107,107,0.1) 10%, transparent 80%)",
    },
    {
      name: "MEMBERSHIP Offers",
      path: "/offers/membership-based",
      description: "Exclusive deals for different membership tiers",
      neonColors: offerTypeColors.membership,
      icon: <UserGroupIcon className="w-9 h-9" />,
      bgPattern:
        "radial-gradient(circle, rgba(0,255,142,0.1) 10%, transparent 80%)",
    },
    {
      name: "GENERAL Offers",
      path: "/offers/general",
      description: "Special offers available to all users",
      neonColors: offerTypeColors.general,
      icon: <GiftIcon className="w-9 h-9" />,
      bgPattern:
        "radial-gradient(circle, rgba(74,144,226,0.1) 10%, transparent 80%)",
    },
    {
      name: "SEASONAL Offers",
      path: "/offers/exclusive",
      description: "Premium deals for VIP members",
      neonColors: offerTypeColors.seasonal,
      icon: <SparklesIcon className="w-9 h-9" />,
      bgPattern:
        "radial-gradient(circle, rgba(189,16,224,0.1) 10%, transparent 80%)",
    },
  ];

  return (
    <HomeLayout>
      {/* Overlay Background Pattern */}
      <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.png')] bg-repeat opacity-5 pointer-events-none"></div>

      <div className="container relative mx-auto px-4 py-12 my-12">
        {/* Section Intro with Gaming Elements */}
        <div className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-8 -left-2 md:-left-8 w-16 h-16 md:w-20 md:h-20 blur-sm bg-primary/30 rounded-full z-0"
          />

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-3xl sm:text-4xl font-press font-normal mb-4 text-center"
          >
            <span className="text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              Exclusive
            </span>{" "}
            <span className="text-gray-900 dark:text-white">Gaming Offers</span>
          </motion.h2>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "180px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-1 bg-primary/70 mx-auto rounded-full mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-text-secondary dark:text-gray-300 mb-12 text-center px-4 max-w-2xl mx-auto"
          >
            Level up your gaming experience with our exclusive promotions and
            special deals. Use these offers to save on bookings, earn bonus XP,
            and unlock premium perks.
          </motion.p>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-8 w-full max-w-7xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group h-full"
            >
              <NeonGradientCard
                className="w-full h-full flex"
                neonColors={category.neonColors}
                borderSize={1.5}
                borderRadius={25}
              >
                <div
                  className="flex flex-col h-full w-full p-6 justify-between cursor-pointer relative overflow-hidden z-10"
                  onClick={() => navigate(category.path)}
                  style={{ background: category.bgPattern }}
                >
                  {/* Category Content */}
                  <div>
                    <div
                      className="text-4xl mb-4 transform transition-all duration-300 text-primary/90 dark:text-white/90 
                      group-hover:scale-110 group-hover:text-primary dark:group-hover:text-white"
                    >
                      {category.icon}
                    </div>
                    <h3
                      className="text-xl font-extrabold text-text-primary dark:text-white mb-2 
                      group-hover:text-primary dark:group-hover:text-primary-light transition-colors"
                    >
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary dark:text-gray-300">
                      {category.description}
                    </p>
                  </div>

                  {/* Floating elements - gaming style decorations */}
                  <div
                    className="absolute -right-4 -top-4 w-12 h-12 rounded-full border border-primary/10 
                    opacity-30 group-hover:opacity-70 transition-opacity duration-500"
                  ></div>
                  <div
                    className="absolute -left-2 -bottom-2 w-8 h-8 rounded-full border border-primary/20
                    opacity-20 group-hover:opacity-50 transition-opacity duration-500"
                  ></div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 w-full inline-flex items-center justify-center relative overflow-hidden py-3 px-4 rounded-xl
                      text-white bg-primary hover:bg-primary-dark transition-colors duration-200
                      shadow-md hover:shadow-lg text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(category.path);
                    }}
                  >
                    <span>Explore Offers</span>
                    <svg
                      className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </motion.button>
                </div>
              </NeonGradientCard>
            </motion.div>
          ))}
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NeonGradientCard
                className="w-full flex"
                neonColors={category.neonColors}
                borderSize={1.5}
                borderRadius={25}
              >
                <div
                  className="flex flex-col w-full p-6 justify-between cursor-pointer"
                  onClick={() => navigate(category.path)}
                  style={{ background: category.bgPattern }}
                >
                  <div className="flex items-center">
                    <div className="text-primary/90 dark:text-white/90 mr-4">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-xs text-text-secondary dark:text-gray-300">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 ml-auto px-4 py-2 bg-primary/90 hover:bg-primary text-white rounded-lg
                      shadow-lg transition-all duration-300 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(category.path);
                    }}
                  >
                    <span className="flex items-center">
                      Explore
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </motion.button>
                </div>
              </NeonGradientCard>
            </motion.div>
          ))}
        </div>

        {/* Gaming Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 flex justify-center gap-4 md:gap-12 flex-wrap"
        >
          {["NEW OFFERS WEEKLY", "UP TO 75% OFF", "MEMBER EXCLUSIVE DEALS"].map(
            (stat) => (
              <div
                key={stat}
                className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <span className="text-primary text-lg">✓</span>
                <span className="text-white/90 text-sm font-press">{stat}</span>
              </div>
            )
          )}
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default OfferCategoriesPage;

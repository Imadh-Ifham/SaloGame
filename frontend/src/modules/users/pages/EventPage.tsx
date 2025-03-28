import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { useNavigate } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";

const EventPage: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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
            Upcoming <span className="text-primary-dark">Events</span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Single Battle Card - Existing code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="group relative min-h-[200px] w-full bg-background/80 dark:bg-background-dark/80 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="relative z-10 text-center p-6">
                <h3 className="text-2xl font-semibold font-press text-primary mb-3 group-hover:text-primary-dark transition-colors duration-300">
                  Single Battle
                </h3>
                <button
                  onClick={() => navigate("/single-battle")}
                  className="px-6 py-2 bg-primary/90 hover:bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-poppins text-sm font-medium"
                >
                  View Events
                </button>
              </div>
            </div>
          </motion.div>

          {/* Team Battle Card - Existing code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="group relative min-h-[200px] w-full bg-background/80 dark:bg-background-dark/80 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="relative z-10 text-center p-6">
                <h3 className="text-2xl font-semibold font-press text-primary mb-3 group-hover:text-primary-dark transition-colors duration-300">
                  Team Battle
                </h3>
                <button
                  onClick={() => navigate("/team-battle")}
                  className="px-6 py-2 bg-primary/90 hover:bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-poppins text-sm font-medium"
                >
                  View Events
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Leaderboard Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 1 
          }}
          whileHover={{ scale: 1.1 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={() => navigate("/events/leaderboard")}
          className="relative"
        >
          {/* Pulsing background effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 0.15 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
              />
            )}
          </AnimatePresence>

          {/* Button with floating particles effect */}
          <motion.div 
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg relative overflow-hidden"
            animate={{ 
              boxShadow: isHovered 
                ? "0 0 25px 5px rgba(245, 158, 11, 0.6)" 
                : "0 5px 15px rgba(0, 0, 0, 0.3)" 
            }}
          >
            {/* Animated particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: [0, Math.random() * 40 - 20],
                  y: [0, Math.random() * -40 - 10],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
                style={{
                  left: `${50 + (Math.random() * 20 - 10)}%`,
                  top: '60%',
                  display: isHovered ? 'block' : 'none'
                }}
              />
            ))}

            {/* Trophy Icon with animation */}
            <motion.div
              animate={{ 
                y: [0, -3, 0],
                rotate: isHovered ? [0, -5, 5, -5, 0] : 0 
              }}
              transition={{ 
                y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                rotate: { duration: 0.5 } 
              }}
            >
              <FaTrophy className="text-white w-7 h-7" />
            </motion.div>
          </motion.div>

          {/* Tooltip - Updated to appear on the left side */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.8 }}
                animate={{ opacity: 1, x: -10, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1/2 right-full transform -translate-y-1/2 mr-4 whitespace-nowrap bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
              >
                View Leaderboard
                {/* Arrow pointing to the right */}
                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-gray-900 rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default EventPage;
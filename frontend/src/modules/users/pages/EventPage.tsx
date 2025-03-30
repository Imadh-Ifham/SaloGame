import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { useNavigate } from "react-router-dom";
import { FaTrophy, FaUserAlt, FaUsers, FaArrowRight, FaBolt, FaGamepad } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import EventChatbot from "../pages/EventPages/chatbot";

const EventPage: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Function to handle card navigation with animation
  const handleCardNavigation = (path: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Add a small delay before navigation to allow animation to complete
    setTimeout(() => {
      navigate(path);
    }, 400);
  };

  return (
    <HomeLayout>
      {/* Particle background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/60"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block relative"
          >
            <HiSparkles className="absolute -top-6 -left-6 text-primary text-xl animate-pulse" />
            <HiSparkles className="absolute -top-4 -right-4 text-primary text-lg animate-pulse" style={{ animationDelay: "0.5s" }} />
            <h2 className="text-3xl sm:text-5xl font-press font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-primary">
              BATTLE ARENA
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto mt-4"
          >
            Choose your battlefield and prove your skills in competitive gaming
          </motion.p>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "180px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-primary/70 mx-auto mt-6 rounded-full"
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Single Battle Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -10 }}
            className="flex flex-col items-center"
            onMouseEnter={() => setActiveCard("single")}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div 
              onClick={() => handleCardNavigation("/single-battle")}
              className="group relative w-full min-h-[300px] bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-800 overflow-hidden cursor-pointer transition-all duration-500"
            >
              {/* Animated border glow effect */}
              <AnimatePresence>
                {activeCard === "single" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-2xl border-2 border-primary/50 z-10"
                    style={{ boxShadow: "0 0 20px 2px rgba(16, 185, 129, 0.3)" }}
                  />
                )}
              </AnimatePresence>
              
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.png')] bg-repeat opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              
              {/* Glowing icon */}
              <div className="absolute top-6 left-6 p-4 bg-green-900/30 rounded-2xl backdrop-blur-sm border border-green-500/30">
                <motion.div
                  animate={{ 
                    rotate: activeCard === "single" ? [0, -5, 5, -3, 0] : 0,
                    scale: activeCard === "single" ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 1.5, repeat: activeCard === "single" ? Infinity : 0 }}
                >
                  <FaUserAlt className="text-primary w-8 h-8" />
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center p-8 flex flex-col h-full justify-center">
                <h3 className="text-3xl font-press font-bold mb-5 text-white group-hover:text-primary transition-colors duration-300">
                  SINGLE BATTLE
                </h3>
                <p className="text-gray-300 mb-6 max-w-sm mx-auto">
                  Test your individual skill in one-on-one competition. 
                  Every victory is earned by your skill alone.
                </p>
                <div className="mt-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300"
                  >
                    <span className="mr-2 font-medium">ENTER ARENA</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.div>
                </div>
              </div>
              
              {/* Stats badge */}
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white border border-green-500/20">
                <span className="text-primary">25+</span> active players
              </div>
            </div>
          </motion.div>

          {/* Team Battle Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10 }}
            className="flex flex-col items-center"
            onMouseEnter={() => setActiveCard("team")}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div 
              onClick={() => handleCardNavigation("/team-battle")}
              className="group relative w-full min-h-[300px] bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-800 overflow-hidden cursor-pointer transition-all duration-500"
            >
              {/* Animated border glow effect */}
              <AnimatePresence>
                {activeCard === "team" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-2xl border-2 border-blue-500/50 z-10"
                    style={{ boxShadow: "0 0 20px 2px rgba(59, 130, 246, 0.3)" }}
                  />
                )}
              </AnimatePresence>
              
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.png')] bg-repeat opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
              
              {/* Glowing icon */}
              <div className="absolute top-6 left-6 p-4 bg-blue-900/30 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <motion.div
                  animate={{ 
                    rotate: activeCard === "team" ? [0, -5, 5, -3, 0] : 0,
                    scale: activeCard === "team" ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 1.5, repeat: activeCard === "team" ? Infinity : 0 }}
                >
                  <FaUsers className="text-blue-400 w-8 h-8" />
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center p-8 flex flex-col h-full justify-center">
                <h3 className="text-3xl font-press font-bold mb-5 text-white group-hover:text-blue-400 transition-colors duration-300">
                  TEAM BATTLE
                </h3>
                <p className="text-gray-300 mb-6 max-w-sm mx-auto">
                  Join forces with fellow gamers to dominate the competition. 
                  Strategy and teamwork are the path to victory.
                </p>
                <div className="mt-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                  >
                    <span className="mr-2 font-medium">FORM SQUAD</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.div>
                </div>
              </div>
              
              {/* Stats badge */}
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white border border-blue-500/20">
                <span className="text-blue-400">5+</span> active teams
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Game highlights section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
            {[
              { icon: FaBolt, text: "INSTANT MATCHMAKING", color: "text-yellow-400" },
              { icon: FaGamepad, text: "SKILL-BASED COMPETITION", color: "text-primary" },
              { icon: FaTrophy, text: "REAL-TIME LEADERBOARDS", color: "text-amber-500" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + (i * 0.2) }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur-sm rounded-lg border border-gray-800"
              >
                <item.icon className={`${item.color} text-lg`} />
                <span className="text-white text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating UI Elements */}
      <div className="fixed bottom-8 left-8 z-50">
        {/* Chatbot button is already positioned here */}
        <EventChatbot />
      </div>
      
      {/* Leaderboard floating button - right side */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.5
          }}
          whileHover={{ scale: 1.05 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={() => navigate("/events/leaderboard")}
          className="relative"
        >
          {/* Enhanced background effect */}
          <motion.div
            animate={{
              boxShadow: isHovered 
                ? [
                    "0 0 15px 5px rgba(245, 158, 11, 0.3)",
                    "0 0 20px 5px rgba(245, 158, 11, 0.6)",
                    "0 0 15px 5px rgba(245, 158, 11, 0.3)"
                  ]
                : "0 0 10px 2px rgba(245, 158, 11, 0.2)"
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0 rounded-full"
          />

          <motion.div 
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full overflow-hidden relative shadow-lg"
          >
            {/* Particle effects */}
            {isHovered && [...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white rounded-full"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 50,
                  y: (Math.random() - 0.5) * 50,
                  opacity: [0, 1, 0],
                  scale: [0, Math.random() + 0.5, 0]
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 0.5
                }}
              />
            ))}

            {/* Trophy icon with animation */}
            <motion.div
              animate={{
                y: [0, -3, 0],
                rotate: isHovered ? [0, -5, 5, -3, 0] : 0 
              }}
              transition={{ 
                y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                rotate: { duration: 0.5 } 
              }}
              className="relative z-10"
            >
              <FaTrophy className="text-white w-7 h-7 drop-shadow-lg" />
            </motion.div>
          </motion.div>
          
          {/* Enhanced tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.8 }}
                animate={{ opacity: 1, x: -10, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1/2 right-full transform -translate-y-1/2 mr-4 whitespace-nowrap"
              >
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 rounded-lg text-white font-medium shadow-lg border border-amber-500/20 flex items-center">
                  <span>VIEW CHAMPIONS</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="ml-2"
                  >
                    <FaArrowRight className="text-amber-400" />
                  </motion.div>
                  
                  {/* Connecting arrow */}
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-gray-900 rotate-45 border-t border-r border-amber-500/20"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default EventPage;
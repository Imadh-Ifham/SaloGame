import React from "react";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { useNavigate } from "react-router-dom";

const EventPage: React.FC = () => {
  const navigate = useNavigate();

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
    </HomeLayout>
  );
};

export default EventPage;
import React from "react";
import { motion } from "framer-motion";

const UserBookingDashboard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
    >
      <h2 className="text-xl font-semibold text-white mb-4">UserBookingDashboard</h2>
    </motion.div>
  );
};

export default UserBookingDashboard;

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiUsers } from "react-icons/fi";
import { GiTrophyCup } from "react-icons/gi";

interface Tournament {
  id: string;
  name: string;
  date: string;
  position: number;
  team: string;
}

const UserEventDashboard: React.FC = () => {
  const navigate = useNavigate();
  const tournaments: Tournament[] = []; // Replace with actual data

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <GiTrophyCup className="text-yellow-400" />
            <span>Tournaments & Events</span>
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="px-3 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
          >
            <FiCalendar size={12} />
            View All
          </button>
        </div>

        {tournaments.length > 0 ? (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="bg-gray-900/30 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-100">{tournament.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(tournament.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <FiUsers className="w-3 h-3" />
                      {tournament.team}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tournament.position <= 3 ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 bg-gray-500/10'
                  }`}>
                    #{tournament.position}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <GiTrophyCup className="mx-auto text-4xl text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No tournament history yet</p>
            <button
              onClick={() => navigate('/tournaments')}
              className="mt-3 px-4 py-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
            >
              Join a Tournament
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserEventDashboard;
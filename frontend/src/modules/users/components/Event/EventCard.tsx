import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon, UsersIcon, ClockIcon } from "@heroicons/react/24/outline";
import { format, differenceInDays } from "date-fns";

interface EventCardProps {
  event: {
    _id: string;
    eventName: string;
    category: string;
    startDateTime: string;
    endDateTime: string;
    description: string;
    numberOfTeams?: number;
    participationPerTeam?: number;
    totalSpots?: number;
    image: string;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isTeamBattle = event.category === "team-battle";
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  const daysToEvent = differenceInDays(startDate, new Date());
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg border border-gray-700 hover:border-primary/30 transition-all duration-300"
    >
      {/* Category Banner */}
      <div className={`h-1.5 w-full ${isTeamBattle ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}></div>
      
      {/* Event Image with Overlays */}
      <div className="relative h-48">
        <img
          src={event.image}
          alt={event.eventName}
          className="w-full h-full object-cover brightness-90"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        
        {/* Event Timer Pill */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 
                         ${daysToEvent > 0 
                           ? 'bg-gray-900/80 text-primary border border-primary/30' 
                           : 'bg-green-900/80 text-green-300 border border-green-500/30'}`}>
            <CalendarIcon className="w-4 h-4" />
            {daysToEvent > 0 
              ? `${daysToEvent} days left` 
              : "Starts today!"}
          </div>
        </div>
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide
                         ${isTeamBattle 
                           ? 'bg-blue-900/80 text-blue-300 border border-blue-500/30' 
                           : 'bg-green-900/80 text-green-300 border border-green-500/30'}`}>
            {event.category}
          </div>
        </div>
        
        {/* Event Main Info (bottom overlay) */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{event.eventName}</h3>
          <div className="flex items-center text-gray-300 text-sm mb-1">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{format(startDate, 'MMM dd, h:mm a')}</span>
          </div>
        </div>
      </div>
      
      {/* Event Details */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2 h-10">
          {event.description}
        </p>
        
        {/* Highlight for Team or Solo Details */}
        <div className={`p-3 rounded-lg ${
          isTeamBattle ? 'bg-blue-900/20 border border-blue-900/30' : 'bg-green-900/20 border border-green-900/30'
        }`}>
          {isTeamBattle ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-400" />
                <span className="text-gray-200 text-sm font-medium">Teams</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold">{event.numberOfTeams}</span>
                <span className="text-gray-400 text-xs ml-1">available</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-200 text-sm font-medium">Spots</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold">{event.totalSpots}</span>
                <span className="text-gray-400 text-xs ml-1">available</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Team Size Detail (for team battles only) */}
        {isTeamBattle && event.participationPerTeam && (
          <div className="flex items-center justify-between px-3 pt-1">
            <span className="text-gray-400 text-sm">Team Size</span>
            <span className="text-white font-medium text-sm">{event.participationPerTeam} players</span>
          </div>
        )}
        
        {/* Event Dates */}
        <div className="pt-2 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-400">
          <div>
            <span className="block">Start: {format(startDate, 'MMM dd, yyyy')}</span>
            <span className="block">End: {format(endDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center
                         ${isTeamBattle ? 'bg-blue-900/30' : 'bg-green-900/30'}`}>
            <span className="text-white font-bold">{format(startDate, 'd')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
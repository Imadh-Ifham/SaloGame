import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';

interface UpcomingEvent {
  _id: string;
  eventName: string;
  image: string;
  startDateTime: string;
  endDateTime: string;
  description: string;
  category: "team-battle" | "single-battle";
  numberOfTeams?: number;
  participationPerTeam?: number;
  totalSpots?: number;
}

interface UpcomingEventsSectionProps {
  events: UpcomingEvent[];
}

const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({ events }) => {
  const upcomingEvents = events
    .filter(event => new Date(event.startDateTime) > new Date())
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
          <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
          Upcoming Events
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
                  <img
                    src={event.image}
                    alt={event.eventName}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-1 bg-primary/80 text-white text-xs rounded-full">
                        {event.category}
                      </span>
                      <div className="bg-black/60 px-3 py-1 rounded-full">
                        <span className="text-white text-sm">
                          {differenceInDays(new Date(event.startDateTime), new Date())} days left
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg mb-1">
                        {event.eventName}
                      </h4>
                      <p className="text-gray-200 text-sm mb-1">
                        {format(new Date(event.startDateTime), 'MMM dd, yyyy')}
                      </p>
                      
                      {/* Category-specific details */}
                      {event.category === 'team-battle' ? (
                        <p className="text-gray-300 text-xs bg-black/40 px-2 py-1 rounded inline-block">
                          {event.numberOfTeams} teams ({event.participationPerTeam} players/team)
                        </p>
                      ) : (
                        <p className="text-gray-300 text-xs bg-black/40 px-2 py-1 rounded inline-block">
                          {event.totalSpots} spots available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300" />
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-400">
              No upcoming events scheduled
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UpcomingEventsSection;
import React, { useState, useEffect } from "react";
import HomeLayout from "../../layout/HomeLayout";
import { motion } from "framer-motion";
import axiosInstance from "@/axios.config";
import EventCard from "../../components/Event/EventCard";
import TeamRegistrationForm from "../../components/Event/TeamRegistrationForm";
import TeamEventRegistrationForm from "../../components/Event/TeamEventRegistrationForm";

interface Event {
  _id: string;
  eventName: string;
  category: string;
  startDateTime: string;
  endDateTime: string;
  description: string;
  participationType: string;
  numberOfTeams?: number;
  participationPerTeam?: number;
  image: string;
}

const TeamBattle: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isTeamRegOpen, setIsTeamRegOpen] = useState(false);
  const [isEventRegOpen, setIsEventRegOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events/category/team-battle");
        if (response.data.success) {
          setEvents(response.data.data);
        } else {
          setError("Failed to fetch events. Please try again later.");
        }
      } catch (error) {
        setError("An error occurred while fetching events.");
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleTeamRegistration = () => {
    setIsTeamRegOpen(true);
  };

  const handleEventRegistration = (event: Event) => {
    setSelectedEvent(event);
    setIsEventRegOpen(true);
  };
  
    return (
      <HomeLayout>
        {/* Main content with conditional blur */}
        <div className={`${isTeamRegOpen || isEventRegOpen ? 'blur-sm' : ''} transition-all duration-300`}>
          <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-7xl mx-auto text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
                Team Battle <span className="text-primary-dark">Events</span>
              </h2>
              <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
            </motion.div>
  
            {/* Create Team Button */}
            <div className="fixed top-20 right-4 z-10">
              <button
                onClick={handleTeamRegistration}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                Create New Team
              </button>
            </div>
  
            {error ? (
              <div className="text-red-500 text-center mt-8">{error}</div>
            ) : (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event._id} className="relative">
                    <EventCard event={event} />
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => handleEventRegistration(event)}
                        className="px-6 py-2 bg-primary/90 hover:bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-poppins text-sm font-medium"
                      >
                        Register for Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
  
        {/* Forms rendered on top of blurred content */}
        {isTeamRegOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsTeamRegOpen(false)} />
            <div className="relative z-50 w-full max-w-md">
              <TeamRegistrationForm
                isOpen={isTeamRegOpen}
                onClose={() => setIsTeamRegOpen(false)}
              />
            </div>
          </div>
        )}
  
        {isEventRegOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => {
              setIsEventRegOpen(false);
              setSelectedEvent(null);
            }} />
            <div className="relative z-50 w-full max-w-md">
              <TeamEventRegistrationForm
                isOpen={isEventRegOpen}
                onClose={() => {
                  setIsEventRegOpen(false);
                  setSelectedEvent(null);
                }}
                eventId={selectedEvent?._id || ''}
                participationPerTeam={selectedEvent?.participationPerTeam || 1}
                eventName={selectedEvent?.eventName || ''}
              />
            </div>
          </div>
        )}
      </HomeLayout>
    );
  };

export default TeamBattle;
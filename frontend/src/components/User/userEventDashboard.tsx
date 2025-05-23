import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiUsers, FiClock } from "react-icons/fi";
import { GiTrophyCup } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { FaUsers, FaMedal, FaTrophy, FaAward } from "react-icons/fa";
import { format } from "date-fns";
import axiosInstance from "@/axios.config";

interface UserEvent {
  id: string;
  eventName: string;
  startDateTime: string;
  endDateTime: string;
  category: "single-battle" | "team-battle";
  status: "upcoming" | "ongoing" | "completed";
  teamName?: string;
  placement?: number;
  verified: boolean;
}

const UserEventDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        
        // Get token and set headers if available
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You need to be logged in to view your registered events");
          setLoading(false);
          return;
        }
        
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Get user email - critical for identifying user's events
        let userEmail = localStorage.getItem("userEmail");
        
        try {
          // This API call should return the current user's profile including email
          const userResponse = await axiosInstance.get('/users/profile');
          userEmail = userResponse.data.email;
          if (userEmail) {
            localStorage.setItem("userEmail", userEmail);
          }
        } catch (err) {
          console.info("Using stored email information");
          if (!userEmail) {
            console.error("No user email available");
            setError("User information unavailable. Please try logging in again.");
            setLoading(false);
            return;
          }
        }
        
        // Fetch all events the user might be registered for
        let allEvents = [];
        try {
          const eventsResponse = await axiosInstance.get('/events');
          allEvents = eventsResponse.data.data || [];
          if (!Array.isArray(allEvents) || allEvents.length === 0) {
            console.info("No events found or unexpected data format");
          }
        } catch (err) {
          console.error("Error fetching events:", err);
          setError("Could not load events. Please try again later.");
          setLoading(false);
          return;
        }
        
        // Fetch user's team registrations
        let userTeams = [];
        try {
          const teamsResponse = await axiosInstance.get('/teams/my-teams');
          userTeams = teamsResponse.data.data || [];
          console.log("User teams data:", userTeams); // Debug log for team data
        } catch (err) {
          console.info("Team data unavailable - continuing without team events");
          userTeams = [];
        }
        
        const userRegistrations: UserEvent[] = [];
        
        // Process single battle registrations
        if (userEmail && Array.isArray(allEvents)) {
          allEvents.forEach((event: any) => {
            if (!event) return;
            
            if (event.category === "single-battle" && Array.isArray(event.registeredEmails)) {
              // Check if user is registered for this event
              const userReg = event.registeredEmails.find(
                (reg: any) => reg && reg.email === userEmail
              );
              
              if (userReg) {
                const now = new Date();
                const startDate = new Date(event.startDateTime);
                const endDate = new Date(event.endDateTime);
                
                let status: "upcoming" | "ongoing" | "completed" = "upcoming";
                if (now > endDate) status = "completed";
                else if (now >= startDate) status = "ongoing";
                
                userRegistrations.push({
                  id: event._id,
                  eventName: event.eventName || "Unnamed Event",
                  startDateTime: event.startDateTime || new Date().toISOString(),
                  endDateTime: event.endDateTime || new Date().toISOString(),
                  category: "single-battle",
                  status,
                  verified: !!userReg.verified,
                });
              }
            }
          });
        }
        
        // Process team battle registrations
        if (Array.isArray(userTeams) && userTeams.length > 0) {
          userTeams.forEach((team: any) => {
            if (!team) return;
            
            if (Array.isArray(team.eventRegistrations) && team.eventRegistrations.length > 0) {
              team.eventRegistrations.forEach((reg: any) => {
                if (!reg || !reg.eventId) return;
                
                // Find matching event
                const event = allEvents.find((e: any) => e && e._id === reg.eventId);
                
                if (event) {
                  const now = new Date();
                  const startDate = new Date(event.startDateTime);
                  const endDate = new Date(event.endDateTime);
                  
                  let status: "upcoming" | "ongoing" | "completed" = "upcoming";
                  if (now > endDate) status = "completed";
                  else if (now >= startDate) status = "ongoing";
                  
                  // Check for placement in completed events
                  let placement;
                  if (Array.isArray(event.placements) && event.placements.length > 0) {
                    const teamPlacement = event.placements.find(
                      (p: any) => p && p.teamId === team._id
                    );
                    if (teamPlacement) {
                      placement = teamPlacement.placement;
                    }
                  }
                  
                  // Debug log for team event matches
                  console.log("Team event match:", {
                    teamId: team._id,
                    teamName: team.teamName,
                    eventId: reg.eventId,
                    foundEvent: !!event
                  });
                  
                  userRegistrations.push({
                    id: event._id,
                    eventName: event.eventName || "Unnamed Event",
                    startDateTime: event.startDateTime || new Date().toISOString(),
                    endDateTime: event.endDateTime || new Date().toISOString(),
                    category: "team-battle",
                    status,
                    teamName: team.teamName || "Unknown Team",
                    placement,
                    verified: true, // Team registrations are pre-verified
                  });
                }
              });
            }
          });
        }
        
        // Sort events by date (upcoming first, then ongoing, then completed)
        userRegistrations.sort((a, b) => {
          // First by status priority
          const statusPriority = { upcoming: 0, ongoing: 1, completed: 2 };
          if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
          }
          
          // Then by start date (newest first for upcoming/ongoing)
          if (a.status !== 'completed') {
            return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
          }
          
          // For completed events, sort by placement if available (winners first)
          if (a.placement && b.placement) {
            return a.placement - b.placement;
          } else if (a.placement) {
            return -1;
          } else if (b.placement) {
            return 1;
          }
          
          // Finally by end date (most recently completed first)
          return new Date(b.endDateTime).getTime() - new Date(a.endDateTime).getTime();
        });
        
        console.log("User registered events:", userRegistrations);
        setUserEvents(userRegistrations);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching user events:", err);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchUserEvents();
  }, [navigate]);

  const getEventStatusBadge = (event: UserEvent) => {
    if (!event.verified) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
          Awaiting verification
        </span>
      );
    }
    
    switch (event.status) {
      case "upcoming":
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
            Upcoming
          </span>
        );
      case "ongoing":
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 animate-pulse">
            Live now
          </span>
        );
      case "completed":
        return event.placement ? (
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
            event.placement === 1 ? 'bg-yellow-500/20 text-yellow-400' : 
            event.placement === 2 ? 'bg-gray-300/20 text-gray-300' : 
            event.placement === 3 ? 'bg-amber-700/20 text-amber-600' : 
            'bg-gray-500/10 text-gray-400'
          }`}>
            {event.placement === 1 ? <FaTrophy className="text-yellow-400" /> :
             event.placement === 2 ? <FaMedal className="text-gray-300" /> :
             event.placement === 3 ? <FaAward className="text-amber-600" /> : null}
            #{event.placement}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
            Completed
          </span>
        );
    }
  };

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
            <span>My Registered Events</span>
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="px-3 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
          >
            <FiCalendar size={12} />
            View All Events
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-1.5 bg-gray-700 rounded-lg text-white text-xs hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : userEvents.length > 0 ? (
          <div className="space-y-3">
            {userEvents.map((event) => (
              <div 
                key={`${event.id}-${event.category}`} 
                className={`bg-gray-900/30 rounded-lg p-3 border-l-4 ${
                  event.category === "team-battle" 
                    ? "border-blue-500" 
                    : "border-green-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-100">{event.eventName}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 mt-1">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {format(new Date(event.startDateTime), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {format(new Date(event.startDateTime), "h:mm a")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 mt-1">
                      {event.category === "team-battle" ? (
                        <p className="text-xs text-blue-400 flex items-center gap-1">
                          <FaUsers className="w-3 h-3" />
                          {event.teamName || "Team Battle"}
                        </p>
                      ) : (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <IoMdPerson className="w-3 h-3" />
                          Individual Event
                        </p>
                      )}
                    </div>
                  </div>
                  {getEventStatusBadge(event)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <GiTrophyCup className="mx-auto text-4xl text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No registered events found</p>
            <button
              onClick={() => navigate('/events')}
              className="mt-3 px-4 py-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
            >
              Browse Events
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserEventDashboard;
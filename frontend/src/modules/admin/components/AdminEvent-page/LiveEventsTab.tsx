import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCrown, FaPlay, FaPause, FaStop, FaUser, 
  FaUserTie, FaTrophy, FaClock, FaUsers 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/axios.config';

interface TeamMember {
  email: string;
  verified: boolean;
}

interface EventRegistration {
  eventId: string;
  memberEmails: string[];
  registrationDate: Date;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  logo?: string;
  score: number;
  rank: number;
  isTeam: boolean;
}

interface LiveEvent {
  _id: string;
  eventName: string;
  category: 'team-battle' | 'single-battle';
  startDateTime: string;
  endDateTime: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  teams?: {
    teamId: string;
    teamName: string;
    teamLogo: string;
    score?: number;
    isWinner?: boolean;
    members?: TeamMember[]; // Added members to show in the UI
  }[];
  participants?: {
    email: string;
    score?: number;
    isWinner?: boolean;
  }[];
  referee?: string;
}

const LiveEventsTab = () => {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRefereeModal, setShowRefereeModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [refereeEmail, setRefereeEmail] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState<1 | 2 | 3>(1);


  useEffect(() => {
    fetchLiveEvents();
    // Set up real-time updates
    const interval = setInterval(fetchLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveEvents = async () => {
    try {
      // Get all events and teams
      const eventsResponse = await axiosInstance.get('/events');
      const teamsResponse = await axiosInstance.get('/teams');
      
      const events = eventsResponse.data.data;
      const teams = teamsResponse.data.data;
      
      // Transform events into LiveEvent format
      const liveEvents = events.map((event: any) => {
        // Find teams registered for this event
        const registeredTeams = teams.filter((team: any) => 
          team.eventRegistrations && 
          team.eventRegistrations.some((reg: EventRegistration) => reg.eventId === event._id)
        );
        
        return {
          _id: event._id,
          eventName: event.eventName,
          category: event.category,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          status: event.status || 'not_started',
          
          // For team battles, map registered teams with members
          teams: event.category === 'team-battle' ? registeredTeams.map((team: any) => ({
            teamId: team.teamId,
            teamName: team.teamName,
            teamLogo: team.teamLogo || 'https://via.placeholder.com/80',
            score: team.score || 0,
            isWinner: team.isWinner || false,
            members: [
              // Add team leader as first member
              { email: team.teamLeaderEmail, verified: true },
              // Add other team members
              ...(team.memberEmails || []).map((member: any) => ({
                email: member.email,
                verified: member.verified || false
              }))
            ]
          })) : undefined,
          
          // For single battles, map registered participants
          participants: event.category === 'single-battle' ? 
            (event.registeredEmails || []).map((registration: any) => ({
              email: registration.email,
              score: registration.score || 0,
              isWinner: registration.isWinner || false
            })) : undefined,
            
          referee: event.referee
        };
      });
  
      setLiveEvents(liveEvents);
      console.log('Live events fetched:', liveEvents);
    } catch (error) {
      console.error('Error fetching live events:', error);
      toast.error('Failed to fetch live events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventControl = async (eventId: string, action: 'start' | 'pause' | 'end') => {
    try {
      await axiosInstance.post(`/events/${eventId}/${action}`);
      fetchLiveEvents();
      toast.success(`Event ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} event`);
    }
  };

  const handlePlacementSelection = async (eventId: string, teamId: string) => {
    try {
      await axiosInstance.post(`/events/${eventId}/placement`, { 
        teamId, 
        placement: selectedPlacement 
      });
      fetchLiveEvents();
      setShowWinnerModal(false);
      toast.success(`Team placed at position ${selectedPlacement} successfully`);
    } catch (error) {
      toast.error('Failed to update placement');
    }
  };
  
  const calculateTimeRemaining = (endDateTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endDateTime).getTime();
    const remaining = end - now;

    if (remaining < 0) return 'Event Ended';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };
  
  const handleAddReferee = async (eventId: string) => {
    try {
      await axiosInstance.post(`/events/${eventId}/referee`, { email: refereeEmail });
      toast.success('Referee assigned successfully');
      setShowRefereeModal(false);
      fetchLiveEvents();
    } catch (error) {
      toast.error('Failed to assign referee');
    }
  };
  
  const handleSelectWinner = (event: LiveEvent, teamId: string) => {
    setSelectedEvent(event);
    setSelectedTeam(teamId);
    setShowWinnerModal(true);
  };
  
  const handleAssignReferee = (event: LiveEvent) => {
    setSelectedEvent(event);
    setShowRefereeModal(true);
  };
  
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Live Events</h3>
            <p className="text-2xl font-bold text-white">
              {liveEvents.filter(e => e.status === 'in_progress').length}
            </p>
          </div>
          <FaPlay className="text-green-500 text-2xl" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Active Participants</h3>
            <p className="text-2xl font-bold text-white">
              {liveEvents.reduce((acc, event) => {
                // Count all team members for team battles
                const teamMembersCount = event.teams?.reduce((teamAcc, team) => 
                  teamAcc + (team.members?.length || 0), 0) || 0;
                  
                // Count individual participants
                const individualCount = event.participants?.length || 0;
                
                return acc + teamMembersCount + individualCount;
              }, 0)}
            </p>
          </div>
          <FaUsers className="text-blue-500 text-2xl" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Total Matches</h3>
            <p className="text-2xl font-bold text-white">{liveEvents.length}</p>
          </div>
          <FaTrophy className="text-yellow-500 text-2xl" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-400 text-sm">Referees Active</h3>
            <p className="text-2xl font-bold text-white">
              {liveEvents.filter(e => e.referee).length}
            </p>
          </div>
          <FaUserTie className="text-purple-500 text-2xl" />
        </div>
      </motion.div>
    </div>
  );
  
  const EventCard = ({ event }: { event: LiveEvent }) => {
    const hasParticipants = event.category === 'team-battle' ? 
      (event.teams?.length || 0) > 0 : 
      (event.participants?.length || 0) > 0;
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Status Badge */}
        <div className={`w-full h-1 ${
          !hasParticipants ? 'bg-gray-500' :
          event.status === 'in_progress' ? 'bg-green-500' :
          event.status === 'paused' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
  
        {/* Event Header */}
        <div className="p-4 bg-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{event.eventName}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                event.category === 'team-battle' ? 
                'bg-blue-900 text-blue-200' : 
                'bg-green-900 text-green-200'
              }`}>
                {event.category === 'team-battle' ? 'Team Battle' : 'Single Battle'}
              </span>
              {hasParticipants && (
                <span className="text-xs text-gray-400">
                  {event.category === 'team-battle' ? 
                    `${event.teams?.length} teams` : 
                    `${event.participants?.length} participants`}
                </span>
              )}
            </div>
          </div>
          
          <EventControls event={event} />
        </div>
  
        {/* Event Content */}
        <div className="p-6">
          {!hasParticipants ? (
            <div className="text-center py-8 text-gray-400">
              <p>Waiting for registrations</p>
              <p className="text-sm mt-2">
                {event.category === 'team-battle' ? 
                  'No teams registered yet' : 
                  'No participants registered yet'}
              </p>
            </div>
          ) : event.category === 'team-battle' ? (
            <div className="grid grid-cols-1 gap-4">
              {event.teams?.map(team => (
                <motion.div
                  key={team.teamId}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg ${
                    team.isWinner ? 'bg-green-900/30' : 'bg-gray-700'
                  } cursor-pointer group relative`}
                  onClick={() => handleSelectWinner(event, team.teamId)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative">
                      <img
                        src={team.teamLogo}
                        alt={team.teamName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                      />
                      {team.isWinner && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <FaCrown className="text-yellow-400 w-6 h-6" />
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">{team.teamName}</h4>
                      {team.score !== undefined && (
                        <p className="text-green-400 font-semibold">Score: {team.score}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                    <h5 className="text-gray-300 text-sm font-semibold mb-2 border-b border-gray-700 pb-1">
                      Team Members
                    </h5>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {team.members?.map((member, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center">
                            <FaUser className="w-3 h-3 text-gray-400 mr-2" />
                            <span className="text-gray-200">{member.email}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            member.verified 
                              ? 'bg-green-900/40 text-green-300' 
                              : 'bg-yellow-900/40 text-yellow-300'
                          }`}>
                            {member.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {event.participants?.map(participant => (
                <motion.div
                  key={participant.email}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg ${
                    participant.isWinner ? 'bg-green-900/30' : 'bg-gray-700'
                  } flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    <FaUser className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-white">{participant.email}</span>
                  </div>
                  {participant.score !== undefined && (
                    <span className="text-green-400">{participant.score}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
  
          {/* Time Remaining and Referee */}
          <div className="mt-4 space-y-2">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <FaClock className="text-green-400" />
                <motion.p 
                  className="text-lg text-white font-mono"
                  key={calculateTimeRemaining(event.endDateTime)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {calculateTimeRemaining(event.endDateTime)}
                </motion.p>
              </div>
            </div>
            
            {/* Referee section */}
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FaUserTie className="text-purple-400 mr-2" />
                <span className="text-sm text-gray-300">Referee:</span>
              </div>
              
              {event.referee ? (
                <span className="text-white text-sm">{event.referee}</span>
              ) : (
                <button
                  onClick={() => handleAssignReferee(event)}
                  className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded text-xs text-white"
                >
                  Assign Referee
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EventControls = ({ event }: { event: LiveEvent }) => (
    <div className="flex space-x-2">
      {event.status === 'not_started' && (
        <button
          onClick={() => handleEventControl(event._id, 'start')}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaPlay className="w-4 h-4" />
        </button>
      )}
      {event.status === 'in_progress' && (
        <>
          <button
            onClick={() => handleEventControl(event._id, 'pause')}
            className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <FaPause className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEventControl(event._id, 'end')}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaStop className="w-4 h-4" />
          </button>
        </>
      )}
      {event.status === 'paused' && (
        <button
          onClick={() => handleEventControl(event._id, 'start')}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaPlay className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards />
    
      {/* Live Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveEvents.length > 0 ? (
          liveEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))
        ) : (
          <div className="col-span-2 bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No live events scheduled</p>
          </div>
        )}
      </div>

      {/* Winner Selection Modal */}
      {showWinnerModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold text-white mb-4">
            Select Placement
          </h3>
          <div className="mb-6">
            <p className="text-gray-300 mb-3">
              Choose position for this team:
            </p>
            <div className="flex space-x-4">
              {[1, 2, 3].map((place) => (
                <button
                  key={place}
                  onClick={() => setSelectedPlacement(place as 1 | 2 | 3)}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    selectedPlacement === place
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {place === 1 ? '🥇 First' : place === 2 ? '🥈 Second' : '🥉 Third'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowWinnerModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePlacementSelection(selectedEvent?._id || '', selectedTeam)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      )}
      
      {/* Referee Assignment Modal */}
      {showRefereeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              Assign Referee
            </h3>
            <input
              type="email"
              placeholder="Enter referee email"
              value={refereeEmail}
              onChange={(e) => setRefereeEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRefereeModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddReferee(selectedEvent?._id || '')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Assign
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveEventsTab;
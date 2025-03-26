import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCrown, FaPlay, FaPause, FaStop, FaUser, 
  FaUserTie, FaTrophy, FaClock, FaUsers 
 } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/axios.config';

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


  useEffect(() => {
    fetchLiveEvents();
    // Set up real-time updates
    const interval = setInterval(fetchLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveEvents = async () => {
    try {
      // Get all events
      const eventsResponse = await axiosInstance.get('/events');
      const teamsResponse = await axiosInstance.get('/teams');
      
      // Transform events into LiveEvent format
      const events = eventsResponse.data.data.map((event: any) => ({
        _id: event._id,
        eventName: event.eventName,
        category: event.category,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        status: event.status || 'not_started',
        // For team battles, map registered teams
        teams: event.category === 'team-battle' ? teamsResponse.data.data
          .filter((team: any) => team.eventId === event._id)
          .map((team: any) => ({
            teamId: team.teamId,
            teamName: team.teamName,
            teamLogo: team.teamLogo,
            score: team.score || 0,
            isWinner: team.isWinner || false
          })) : undefined,
        // For single battles, map registered participants
        participants: event.category === 'single-battle' ? 
          event.registeredEmails.map((registration: any) => ({
            email: registration.email,
            score: registration.score || 0,
            isWinner: registration.isWinner || false
          })) : undefined,
        referee: event.referee
      }));
  
      setLiveEvents(events);
    } catch (error) {
      console.error('Error fetching live events:', error);
      toast.error('Failed to fetch live events');
    } finally {
      setLoading(false);
    }
  };

 /* const handleEventControl = async (eventId: string, action: 'start' | 'pause' | 'end') => {
    try {
      await axiosInstance.post(`/events/${eventId}/${action}`);
      fetchLiveEvents();
      toast.success(`Event ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} event`);
    }
  };*/

  /*const handleWinnerSelection = async (eventId: string, teamId: string) => {
    try {
      await axiosInstance.post(`/events/${eventId}/winner`, { teamId });
      fetchLiveEvents();
      setShowWinnerModal(false);
      toast.success('Winner updated successfully');
    } catch (error) {
      toast.error('Failed to update winner');
    }
  };*/
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
              {liveEvents.reduce((acc, event) => 
                acc + (event.teams?.length || 0) + (event.participants?.length || 0), 0
              )}
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
            <div className="grid grid-cols-2 gap-4">
              {event.teams?.map(team => (
                <motion.div
                  key={team.teamId}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg ${
                    team.isWinner ? 'bg-green-900/30' : 'bg-gray-700'
                  } cursor-pointer group`}
                >
                  <div className="relative">
                    <img
                      src={team.teamLogo}
                      alt={team.teamName}
                      className="w-16 h-16 mx-auto rounded-full mb-2 group-hover:opacity-75 transition-opacity"
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
                  <h4 className="text-center text-white font-medium">{team.teamName}</h4>
                  {team.score !== undefined && (
                    <p className="text-center text-2xl text-green-400">{team.score}</p>
                  )}
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
  
          {/* Time Remaining */}
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards />
    
      {/* Live Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveEvents.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

      {/* Winner Selection Modal */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Winner
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to declare this team as the winner?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowWinnerModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWinnerSelection(selectedEvent?._id || '', selectedTeam)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
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

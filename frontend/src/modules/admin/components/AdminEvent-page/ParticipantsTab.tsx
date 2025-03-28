import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaEnvelope, 
  FaSearch,
  FaFilter 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/axios.config';

interface Participant {
  _id: string;
  email: string;
  eventName: string;
  eventType: 'team-battle' | 'single-battle';
  teamName?: string;
  verified: boolean;
  registeredAt: string;
}

interface ParticipantStats {
  totalParticipants: number;
  verifiedCount: number;
  unverifiedCount: number;
  teamParticipants: number;
  individualParticipants: number;
  pendingVerifications: number;
}

const ParticipantsTab = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<ParticipantStats>({
    totalParticipants: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    teamParticipants: 0,
    individualParticipants: 0,
    pendingVerifications: 0
  });
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterType, setFilterType] = useState<'all' | 'team' | 'individual'>('all');

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      // Fetch both events and teams
      const [eventsResponse, teamsResponse] = await Promise.all([
        axiosInstance.get('/events'),
        axiosInstance.get('/teams')
      ]);

      const events = eventsResponse.data.data;
      const teams = teamsResponse.data.data;

      const participantsList: Participant[] = [];
      let statsData = {
        totalParticipants: 0,
        verifiedCount: 0,
        unverifiedCount: 0,
        teamParticipants: 0,
        individualParticipants: 0,
        pendingVerifications: 0
      };
      
      // Process individual participants from events
      events.forEach((event: any) => {
        if (event.category === 'single-battle' && event.registeredEmails) {
          event.registeredEmails.forEach((registration: any) => {
            participantsList.push({
              _id: registration._id || registration.email,
              email: registration.email,
              eventName: event.eventName,
              eventType: 'single-battle',
              verified: registration.verified,
              registeredAt: registration.registeredAt || event.createdAt
            });
            statsData.totalParticipants++;
            statsData.individualParticipants++;
            if (registration.verified) {
              statsData.verifiedCount++;
            } else {
              statsData.unverifiedCount++;
              statsData.pendingVerifications++;
            }
          });
        }
      });
      
      // Process team participants
      teams.forEach((team: any) => {
        // Check if team has event registrations
        if (team.eventRegistrations && team.eventRegistrations.length > 0) {
          // Add team leader
          participantsList.push({
            _id: team._id + '-leader',
            email: team.teamLeaderEmail,
            eventName: 'Team Event',
            eventType: 'team-battle',
            teamName: team.teamName,
            verified: true, // Team leaders are always verified
            registeredAt: team.createdAt
          });
          statsData.totalParticipants++;
          statsData.teamParticipants++;
          statsData.verifiedCount++;

          // Add team members from memberEmails array
          if (team.memberEmails && Array.isArray(team.memberEmails)) {
            team.memberEmails.forEach((member: any) => {
              participantsList.push({
                _id: member._id || `${team._id}-${member.email}`,
                email: member.email,
                eventName: 'Team Event',
                eventType: 'team-battle',
                teamName: team.teamName,
                verified: member.verified || false,
                registeredAt: team.createdAt
              });
              statsData.totalParticipants++;
              statsData.teamParticipants++;
              if (member.verified) {
                statsData.verifiedCount++;
              } else {
                statsData.unverifiedCount++;
                statsData.pendingVerifications++;
              }
            });
          }
        }
      });
      
      setParticipants(participantsList);
      setFilteredParticipants(participantsList);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setError('Failed to fetch participants data');
      toast.error('Error loading participants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    applyFilters(participants, searchTerm, filterStatus, filterType);
  };

  const applyFilters = (data: Participant[], searchTerm: string, status: string, type: string) => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(p => status === 'verified' ? p.verified : !p.verified);
    }

    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(p => type === 'team' ? p.eventType === 'team-battle' : p.eventType === 'single-battle');
    }

    setFilteredParticipants(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-900/20 border border-red-800 rounded-lg">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchParticipants}
          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-blue-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Total Participants</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalParticipants}</h3>
              <p className="text-sm text-gray-400">
                Team: {stats.teamParticipants} | Individual: {stats.individualParticipants}
              </p>
            </div>
            <div className="text-blue-500 text-xl">
              <FaUserCheck />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-green-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Verified Participants</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.verifiedCount}
                <span className="text-sm text-gray-400 ml-2">
                  ({stats.totalParticipants > 0 
                    ? ((stats.verifiedCount / stats.totalParticipants) * 100).toFixed(1) 
                    : 0}%)
                </span>
              </h3>
            </div>
            <div className="text-green-500 text-xl">
              <FaUserCheck />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-yellow-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Pending Verifications</p>
              <h3 className="text-2xl font-bold text-white">{stats.pendingVerifications}</h3>
            </div>
            <div className="text-yellow-500 text-xl">
              <FaEnvelope />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-800 p-4 rounded-lg">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Filters */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as any);
            applyFilters(participants, search, e.target.value, filterType);
          }}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as any);
            applyFilters(participants, search, filterStatus, e.target.value);
          }}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Types</option>
          <option value="team">Team</option>
          <option value="individual">Individual</option>
        </select>
      </div>

      {/* Participants Table */}
      <div className="overflow-x-auto">
        {filteredParticipants.length > 0 ? (
          <table className="min-w-full bg-gray-800 rounded-lg">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredParticipants.map((participant) => (
                <tr key={participant._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {participant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {participant.eventName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {participant.eventType === 'team-battle' ? 'Team' : 'Individual'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {participant.teamName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      participant.verified 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {participant.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No participants match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsTab;
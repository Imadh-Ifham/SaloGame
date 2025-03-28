import React, { useState, useEffect } from 'react';
import axiosInstance from '@/axios.config';
import Modal from '@/components/Modal';
import { toast } from 'react-hot-toast';

interface TeamEventRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  participationPerTeam: number;
  eventName: string;
}

interface TeamMember {
  email: string;
  verified: boolean;
}

interface Team {
  _id: string;
  teamName: string;
  teamId: string;
  teamLogo: string;
  teamLeaderEmail: string;
  memberEmails: TeamMember[];
  isVerified: boolean;
}

const TeamEventRegistrationForm: React.FC<TeamEventRegistrationFormProps> = ({
  isOpen,
  onClose,
  eventId,
  participationPerTeam,
  eventName
}) => {
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);


  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log('Fetching teams...');
        const response = await axiosInstance.get('/teams');
        console.log('Teams response:', response.data);
        
        if (Array.isArray(response.data?.data)) {
          setTeams(response.data.data);
          console.log('Teams set:', response.data.data);
        } else {
          console.error('Invalid response format:', response.data);
          toast.error('Invalid Team data received');
        }
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError('Failed to fetch teams');
        toast.error('Failed to load teams');
      }
    };
  
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

   // Update team members when a team is selected
   useEffect(() => {
    if (selectedTeam) {
      const team = teams.find(t => t.teamId === selectedTeam);
      if (team) {
        setTeamMembers(team.memberEmails || []);
        // Reset selected members when team changes
        setSelectedMembers([]);
      }
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeam, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }
  
    // Validate selected members
    if (selectedMembers.length < participationPerTeam - 1) {
      setError(`Please select ${participationPerTeam - 1} team members`);
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const response = await axiosInstance.post(`/teams/${eventId}/register-team`, {
        teamId: selectedTeam,
        memberEmails: selectedMembers
      });
  
      if (response.data.success) {
        toast.success('Team registered for event successfully!', {
          duration: 3000,
          position: 'top-center'
        });
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to register team');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to register team for event';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (index: number, email: string) => {
    const newSelectedMembers = [...selectedMembers];
    newSelectedMembers[index] = email;
    setSelectedMembers(newSelectedMembers);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register for ${eventName}`}
    >
      <div className="mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="" className="text-gray-500">Choose a team</option>
              {teams && teams.length > 0 ? (
                teams.map(team => (
                  <option 
                    key={team._id} 
                    value={team.teamId}
                    className="text-gray-900 dark:text-white"
                  >
                    {team.teamName} (ID: {team.teamId})
                  </option>
                ))
              ) : (
                <option value="" disabled>No teams available</option>
              )}
            </select>
            {teams.length === 0 && (
              <p className="mt-1 text-sm text-red-500">No teams found</p>
            )}
          </div>
          
          {/* Team Leader Info */}
          {selectedTeam && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Team Leader:</span> {teams.find(t => t.teamId === selectedTeam)?.teamLeaderEmail}
              </p>
            </div>
          )}
            
          {/* Member Selection Dropdowns */}
          {selectedTeam && Array(participationPerTeam - 1).fill(null).map((_, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Member {index + 1}
              </label>
              <select
                value={selectedMembers[index] || ''}
                onChange={(e) => handleMemberSelect(index, e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a team member</option>
                {teamMembers.map((member, i) => (
                  <option 
                    key={i} 
                    value={member.email}
                    disabled={selectedMembers.includes(member.email)} // Prevent selecting the same member twice
                  >
                    {member.email} {member.verified ? '(Verified)' : '(Pending)'}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                     hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 
                     dark:hover:bg-gray-500 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTeam || selectedMembers.length < participationPerTeam - 1}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md
                ${loading || !selectedTeam || selectedMembers.length < participationPerTeam - 1
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark'} 
              transition-colors`}
            >
              {loading ? 'Registering...' : 'Register Team'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TeamEventRegistrationForm;
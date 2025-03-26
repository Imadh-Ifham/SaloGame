import React, { useState, useEffect } from 'react';
import axiosInstance from '@/axios.config';
import Modal from '@/components/Modal';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  username: string;
}

interface TeamRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamRegistrationForm: React.FC<TeamRegistrationFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeaderEmail: '',
    contactNumber: '',
    teamLogo: null as File | null,
  });

  const [memberEmails, setMemberEmails] = useState<string[]>(['']); 
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<{show: boolean; teamId: string} | null>(null);

    // Add member email field
    const addMemberEmail = () => {
      setMemberEmails([...memberEmails, '']);
    };
  
    // Remove member email field
    const removeMemberEmail = (index: number) => {
      const newEmails = memberEmails.filter((_, i) => i !== index);
      setMemberEmails(newEmails);
    };

    /*useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axiosInstance.get('/users');
          if (Array.isArray(response.data)) {
            setUsers(response.data);
          } else {
            setError('Invalid user data received');
          }
        } catch (err) {
          console.error('Error fetching users:', err);
          setError('Failed to load users');
        }
      };
    
      if (isOpen) fetchUsers();
    }, [isOpen]);*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.teamName || !formData.teamLeaderEmail || !formData.contactNumber) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate member emails
    const validEmails = memberEmails.filter(email => email.trim() !== '');
    if (validEmails.length === 0) {
      setError('Please add at least one team member');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('teamName', formData.teamName);
      formDataToSend.append('teamLeaderEmail', formData.teamLeaderEmail);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('memberEmails', JSON.stringify(validEmails));
      if (formData.teamLogo) {
        formDataToSend.append('teamLogo', formData.teamLogo);
      }
    
      const response = await axiosInstance.post('/teams/register', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSuccessMessage({
          show: true,
          teamId: response.data.data.teamId
        });
        
        toast.success('Team created! Members will receive verification emails.');
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 5000);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      console.error('Error creating team:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create team';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <div className="mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Name
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, teamName: e.target.value }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white"
              placeholder="Team Name"
              required
            />
          </div>

          {/* Team Leader Selection 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Leader
            </label>
            <select
                value={formData.teamLeaderId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, teamLeaderId: e.target.value }))
                }
                className="w-full p-2 border rounded 
                        border-gray-300 dark:border-gray-600 
                        bg-white dark:bg-gray-700 
                        text-gray-900 dark:text-white"
                required
              >
              <option value="" disabled>
                Select a Team Leader
              </option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
*/}

            {/* Team Leader Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Leader Email
              </label>
              <input
                type="email"
                value={formData.teamLeaderEmail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, teamLeaderEmail: e.target.value }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 
                          rounded-md shadow-sm p-2 
                          bg-white dark:bg-gray-700 
                          text-gray-900 dark:text-white"
                placeholder="Team Leader Email"
                required
              />
            </div>
            {/* Member Emails */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Members
              </label>
              {memberEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...memberEmails];
                      newEmails[index] = e.target.value;
                      setMemberEmails(newEmails);
                    }}
                    className="flex-1 p-2 border rounded-md border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Member email"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeMemberEmail(index)}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMemberEmail}
                className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Member
              </button>
            </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white"
              placeholder="Contact Number"
              required
            />
          </div>

          {/* Team Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData((prev) => ({ ...prev, teamLogo: file }));
                }
              }}
              className="w-full border border-gray-300 dark:border-gray-600 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      dark:file:bg-blue-900 dark:file:text-blue-200
                      hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              />
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md 
                          transform transition-all duration-500 ease 
                          animate-[fadeIn_0.5s_ease-in]">
              <div className="flex items-center">
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <div>
                  <p className="font-medium">Team created successfully!</p>
                  <p className="text-sm mt-1">Team ID: {successMessage.teamId}</p>
                </div>
                </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TeamRegistrationForm;

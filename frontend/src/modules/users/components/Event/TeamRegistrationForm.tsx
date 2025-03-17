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
    teamLeaderId: '',
    contactNumber: '',
    teamLogo: null as File | null,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<{show: boolean; teamId: string} | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          toast.error('Invalid user data received');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      }
    };

    if (isOpen) fetchUsers();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.teamName || !formData.teamLeaderId || !formData.contactNumber) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('teamName', formData.teamName);
      formDataToSend.append('teamLeaderId', formData.teamLeaderId);
      formDataToSend.append('contactNumber', formData.contactNumber);
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
        
        // Auto hide after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 5000);
      }  else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      console.error('Error creating team:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create team';
      setError(errorMessage);
      toast.error(errorMessage);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, teamName: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"
              required
            />
          </div>

          {/* Team Leader Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Leader
            </label>
            <select
              value={formData.teamLeaderId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, teamLeaderId: e.target.value }))
              }
              className="w-full p-2 border rounded bg-white text-gray-900"
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

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"
              required
            />
          </div>

          {/* Team Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900"
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

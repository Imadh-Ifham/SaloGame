import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUpload, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import axiosInstance from '../../axios.config';

interface UserProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentImage?: string;
  onUpdate: (newData: { name?: string; profileImage?: string }) => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  isOpen,
  onClose,
  currentName,
  currentImage,
  onUpdate,
}) => {
  const [name, setName] = useState(currentName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      if (name !== currentName) {
        formData.append('name', name);
      }
      if (image) {
        formData.append('profileImage', image);
      }

      const response = await axiosInstance.patch('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpdate({
        name: response.data.name,
        profileImage: response.data.profileImage,
      });
      onClose();
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800/90 rounded-xl p-6 w-full max-w-md border border-gray-700/50"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 clip-polygon bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 p-1 glow-effect">
                <div className="w-full h-full clip-polygon bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl || currentImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
              >
                <FiUpload className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Gamer Tag</label>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:border-emerald-500 outline-none"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="flex-1 px-3 py-2 bg-gray-700/50 rounded-lg text-white">
                  {name}
                </div>
              )}
              <button
                onClick={() => setIsEditingName(!isEditingName)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {isEditingName ? (
                  <FiCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <FiEdit2 className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 text-center">{error}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfileSettings;
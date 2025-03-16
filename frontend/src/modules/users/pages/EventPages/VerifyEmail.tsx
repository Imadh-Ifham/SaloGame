import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/axios.config';
import HomeLayout from '../../layout/HomeLayout';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      try {
        const response = await axiosInstance.get(`/events/verify/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          // Redirect after 3 seconds
          setTimeout(() => navigate('/events'), 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'An error occurred during verification. Please try again.'
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <HomeLayout>
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Verifying your email...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Success!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Redirecting to events page...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">×</div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <button
                onClick={() => navigate('/events')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                Return to Events
              </button>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
};

export default VerifyEmail;
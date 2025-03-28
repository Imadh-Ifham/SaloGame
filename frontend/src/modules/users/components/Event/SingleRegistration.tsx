import React from 'react';

interface SingleRegistrationProps {
  event: {
    eventName: string;
    totalSpots: number;
    availableSpots?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  email: string;
  countdown: string;
  isSubmitting: boolean;
  submitError: string | null;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const SingleRegistration: React.FC<SingleRegistrationProps> = ({
  event,
  isOpen,
  onClose,
  email,
  countdown,
  isSubmitting,
  submitError,
  onEmailChange,
  onSubmit,
}) => {
  if (!isOpen || !event) return null;

  // Parse the countdown string to extract individual values
  const getCountdownValues = () => {
    if (countdown === "Event has started!") {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    // Parse the countdown string like "5d 12h 36m 20s"
    const days = parseInt(countdown.match(/(\d+)d/)?.[1] || "0");
    const hours = parseInt(countdown.match(/(\d+)h/)?.[1] || "0");
    const minutes = parseInt(countdown.match(/(\d+)m/)?.[1] || "0");
    const seconds = parseInt(countdown.match(/(\d+)s/)?.[1] || "0");
    
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = getCountdownValues();

  // Format numbers to always have two digits
  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };
  
  // Calculate available spots (or use provided value)
  const availableSpots = event.availableSpots !== undefined ? event.availableSpots : event.totalSpots;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Content */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              {event.eventName}
            </h3>
            
            {/* Countdown UI */}
            <div className="mb-4">
              {countdown === "Event has started!" ? (
                <p className="text-lg font-semibold text-primary">Event has started!</p>
              ) : (
                <div className="flex justify-center space-x-4 bg-gray-900 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white">
                      {formatNumber(days)}
                    </div>
                    <div className="text-xs uppercase text-white mt-1">
                      days
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white">
                      {formatNumber(hours)}
                    </div>
                    <div className="text-xs uppercase text-white mt-1">
                      hours
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white">
                      {formatNumber(minutes)}
                    </div>
                    <div className="text-xs uppercase text-white mt-1">
                      minutes
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white">
                      {formatNumber(seconds)}
                    </div>
                    <div className="text-xs uppercase text-white mt-1">
                      seconds
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Total Spots UI - in the same style as countdown */}
            <div className="mb-6">
              <div className="flex justify-center space-x-4 bg-gray-900 p-4 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-white">
                    {formatNumber(event.totalSpots)}
                  </div>
                  <div className="text-xs uppercase text-white mt-1">
                    total spots
                  </div>
                </div>
              </div>
            </div>
            
            {/* Registration Form */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
              <input
                  type="email"
                  value={email}
                  onChange={onEmailChange}
                  placeholder="Enter your email"
                  className="px-4 py-2 border rounded 
                  focus:ring-2 focus:ring-primary focus:border-primary
                  bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white 
                  border-gray-300 dark:border-gray-600
                  placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isSubmitting}
                />
                {submitError && (
                  <p className="text-red-500 text-sm">{submitError}</p>
                )}
              </div>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleRegistration;
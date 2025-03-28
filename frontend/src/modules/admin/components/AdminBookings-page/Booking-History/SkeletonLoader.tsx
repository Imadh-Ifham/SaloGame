import React from "react";

const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full p-4">
      <div className="w-full max-w-3xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="mt-6">
          <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
          <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;

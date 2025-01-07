// src/components/MembershipSkeleton.tsx

import React from "react";

interface MembershipSkeletonProps {
  count: number; // Number of skeleton cards to display
}

const MembershipSkeleton: React.FC<MembershipSkeletonProps> = ({ count }) => {
  const skeletonCardClasses = `
    bg-gray-200 dark:bg-gray-700 
    animate-pulse 
    rounded-lg 
    p-6 
    w-full 
    max-w-sm 
    flex 
    flex-col 
    justify-between
  `;

  const skeletonTextClasses = "bg-gray-300 dark:bg-gray-600 rounded";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-8 w-full max-w-7xl">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonCardClasses}>
          <div className="flex flex-col h-full w-full justify-between">
            <div>
              {/* Title Skeleton */}
              <div className={`${skeletonTextClasses} h-6 w-3/4 mb-4`}></div>

              {/* Tagline Skeleton */}
              <div className={`${skeletonTextClasses} h-4 w-2/3 mb-6`}></div>

              {/* Price Skeleton */}
              <div className={`${skeletonTextClasses} h-5 w-1/3 mb-4`}></div>

              {/* Benefits Skeleton */}
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`${skeletonTextClasses} h-4 w-full`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="mt-6">
              <div className={`${skeletonTextClasses} h-10 w-1/2`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MembershipSkeleton;

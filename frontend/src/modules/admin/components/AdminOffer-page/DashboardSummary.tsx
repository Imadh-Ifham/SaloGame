import React, { useEffect } from "react";
import { FiPercent, FiClock, FiMonitor } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchOfferData } from "@/store/slices/offerSlice";

const DashboardSummary: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { totalActiveOffers, mostUsedOffer, loading } = useSelector(
    (state: RootState) => state.offer
  );

  useEffect(() => {
    dispatch(fetchOfferData());
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Promotions
            </p>
            {loading ? (
              <div className="h-8 w-20 mt-2 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {totalActiveOffers}
              </h3>
            )}
          </div>
          <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
            <FiPercent className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Top Gaming Deal
            </p>
            {loading ? (
              <div className="h-8 w-24 mt-2 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {mostUsedOffer}
              </h3>
            )}
          </div>
          <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
            <FiMonitor className="text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Expiring Soon
            </p>
            {loading ? (
              <div className="h-8 w-20 mt-2 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                3
              </h3>
            )}
          </div>
          <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700">
            <FiClock className="text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;

import { FaPercent, FaClock, FaGamepad } from "react-icons/fa";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchOfferData } from "@/store/slices/offerSlice";

const DashboardSummary = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { totalActiveOffers, mostUsedOffer, loading } = useSelector(
    (state: RootState) => state.offer
  );

  useEffect(() => {
    dispatch(fetchOfferData());
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-purple-500 transition-all hover:shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg mr-4">
            <FaPercent className="text-3xl text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Active Promotions
            </h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalActiveOffers}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-amber-500 transition-all hover:shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg mr-4">
            <FaGamepad className="text-3xl text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Top Gaming Deal
            </h2>
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {mostUsedOffer}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500 transition-all hover:shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
            <FaClock className="text-3xl text-green-600 dark:text-green-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Expiring Soon
            </h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                3
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;

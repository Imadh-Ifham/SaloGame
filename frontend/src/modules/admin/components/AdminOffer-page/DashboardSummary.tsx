import { FaPercent, FaClock, FaTrophy } from "react-icons/fa";

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
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FaPercent className="text-3xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Total Active Offers</h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">{totalActiveOffers}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FaTrophy className="text-3xl text-yellow-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Most Used Offer</h2>
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">{mostUsedOffer}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FaClock className="text-3xl text-green-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Expiring Soon</h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <p className="text-3xl font-bold"></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;

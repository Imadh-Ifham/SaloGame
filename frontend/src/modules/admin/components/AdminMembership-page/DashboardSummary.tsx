import { useEffect } from "react";
import { FaUsers, FaTrophy, FaDollarSign, FaClock } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMembershipData } from "../../../../store/slices/membershipSlice";

function DashBoardSummary() {
  const dispatch = useDispatch<AppDispatch>();
  const { totalActiveMembers, mostPopularMembership, loading, error } =
    useSelector((state: RootState) => state.membership);

  useEffect(() => {
    dispatch(fetchMembershipData());
  }, [dispatch]);

  if (error) {
    return (
      <div className="text-red-500 bg-gray-800 p-4 rounded-lg shadow">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-b-2 border-blue-500 transition-all duration-300 hover:translate-y-1 hover:shadow-xl">
        <div className="flex items-center">
          <FaUsers className="text-3xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-300">
              Active Gamers
            </h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-blue-400">
                {totalActiveMembers}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-b-2 border-purple-500 transition-all duration-300 hover:translate-y-1 hover:shadow-xl">
        <div className="flex items-center">
          <FaTrophy className="text-3xl text-purple-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-300">Top Tier</h2>
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-purple-400">
                {mostPopularMembership}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-b-2 border-green-500 transition-all duration-300 hover:translate-y-1 hover:shadow-xl">
        <div className="flex items-center">
          <FaDollarSign className="text-3xl text-green-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-300">Revenue</h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-green-400">
                LKR {loading ? "" : "84,250"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-b-2 border-red-500 transition-all duration-300 hover:translate-y-1 hover:shadow-xl">
        <div className="flex items-center">
          <FaClock className="text-3xl text-red-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-300">
              Gaming Hours
            </h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-700 rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-red-400">1,248</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoardSummary;

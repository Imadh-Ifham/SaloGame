import { useEffect } from "react";
import { FaUsers, FaTrophy, FaDollarSign } from "react-icons/fa";

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
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FaUsers className="text-3xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Total Active Members</h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">{totalActiveMembers}</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FaTrophy className="text-3xl text-yellow-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Most Popular Membership</h2>
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">{mostPopularMembership}</p>
            )}
          </div>
        </div>
      </div>

      {/* New Revenue Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FaDollarSign className="text-3xl text-green-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Total Revenue</h2>
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <p className="text-3xl font-bold">LKR {}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBoardSummary;

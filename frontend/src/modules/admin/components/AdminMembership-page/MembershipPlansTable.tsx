import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMembershipData,
  updateMembership,
  createMembership,
  deprecateMembershipPlan,
} from "@/store/slices/membershipSlice";
import EditMembershipTypeModal from "./EditMembershipTypeModal";
import DeprecatePlanModal from "./DeprecatePlanModal";
import { FiEdit, FiPlus, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axiosInstance from "@/axios.config";

interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  xpRate: number;
  benefits: string[];
  subscriberCount: number;
  isActive: boolean;
}

const MembershipPlansTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { memberships, loading, error } = useSelector(
    (state: RootState) => state.membership
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeprecateModalOpen, setIsDeprecateModalOpen] = useState(false);
  const [planToDeprecate, setPlanToDeprecate] = useState<MembershipPlan | null>(
    null
  );
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const rowsPerPage = 5;

  useEffect(() => {
    // Fetch membership plans using Redux action
    dispatch(fetchMembershipData());
  }, [dispatch]);

  const totalPages = Math.ceil(memberships.length / rowsPerPage);
  const paginatedPlans = memberships.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Event handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEdit = async (plan: MembershipPlan) => {
    try {
      // Fetch complete membership data
      const response = await axiosInstance.get(`/memberships/${plan._id}`);
      setEditingPlan(response.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to load membership details");
    }
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleDeprecateClick = (plan: MembershipPlan) => {
    setPlanToDeprecate(plan);
    setIsDeprecateModalOpen(true);
  };

  const handleDeprecatePlan = async (
    planId: string,
    migrationPlanId?: string
  ) => {
    try {
      await dispatch(
        deprecateMembershipPlan({
          planId,
          migrationPlanId,
          disableAutoRenewal: true,
        })
      ).unwrap();

      toast.success("Membership plan successfully deprecated");
      dispatch(fetchMembershipData()); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to deprecate membership plan");
      throw error; // Re-throw to be caught by the modal
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg">
        Failed to load membership plans: {error}
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Membership Plans
        </h2>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow"
        >
          <FiPlus className="mr-2" />
          Add New Plan
        </button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 scrollbar-hide rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 scrollbar-hide">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Plan Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Price (LKR)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                XP Rate
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Member Count
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedPlans.length > 0 ? (
              paginatedPlans.map((plan) => (
                <tr
                  key={plan._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {plan.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {plan.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {plan.xpRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      {plan.subscriberCount}
                    </span>
                  </td>
                  {/*Status column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {plan.isActive ? (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
                        Deprecated
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit Membership"
                      >
                        <FiEdit size={16} />
                      </button>
                      {plan.isActive && (
                        <button
                          onClick={() => handleDeprecateClick(plan)}
                          className="p-1.5 rounded-full text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                          title="Deprecate Membership Plan"
                        >
                          <FiAlertTriangle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No membership plans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {paginatedPlans.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Math.min(rowsPerPage, paginatedPlans.length)} of{" "}
            {memberships.length} plans
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Membership Modal */}
      {isModalOpen && (
        <EditMembershipTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (formData) => {
            try {
              if (editingPlan) {
                // Update existing membership
                await dispatch(
                  updateMembership({
                    id: editingPlan._id,
                    data: formData,
                  })
                ).unwrap();
                toast.success("Membership plan updated successfully");
              } else {
                // Create new membership
                await dispatch(createMembership(formData)).unwrap();
                toast.success("Membership plan created successfully");
              }
              // Refresh data after operation
              dispatch(fetchMembershipData());
              setIsModalOpen(false);
              return Promise.resolve();
            } catch (error: any) {
              toast.error(error.message || "Operation failed");
              return Promise.reject(error);
            }
          }}
          membershipType={
            editingPlan
              ? {
                  _id: editingPlan._id,
                  name: editingPlan.name,
                  price: editingPlan.price,
                  xpRate: editingPlan.xpRate,
                  tagline: "",
                  benefits: editingPlan.benefits,
                  isActive: true,
                }
              : undefined
          }
        />
      )}

      {/* Deprecate Membership Modal */}
      {isDeprecateModalOpen && planToDeprecate && (
        <DeprecatePlanModal
          isOpen={isDeprecateModalOpen}
          onClose={() => {
            setIsDeprecateModalOpen(false);
            setPlanToDeprecate(null);
          }}
          planId={planToDeprecate._id}
          planName={planToDeprecate.name}
          subscriberCount={planToDeprecate.subscriberCount}
          onDeprecate={handleDeprecatePlan}
          availablePlans={memberships.filter(
            (m) => m.isActive && m._id !== planToDeprecate._id
          )}
        />
      )}
    </div>
  );
};

export default MembershipPlansTable;

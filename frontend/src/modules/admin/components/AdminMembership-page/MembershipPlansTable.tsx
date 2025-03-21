import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMembershipData,
  deleteMembership,
  updateMembership,
  createMembership,
} from "@/store/slices/membershipSlice";
import EditMembershipTypeModal from "./EditMembershipTypeModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  xpRate: number;
  subscriberCount: number;
}

const MembershipPlansTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { memberships, loading, error } = useSelector(
    (state: RootState) => state.membership
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (confirm("Are you sure you want to delete this membership plan?")) {
      try {
        await dispatch(deleteMembership(planId)).unwrap();
        toast.success("Membership plan deleted successfully.");
        dispatch(fetchMembershipData()); // Refresh data
      } catch (error: any) {
        toast.error(error.message || "Failed to delete membership plan.");
      }
    }
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load membership plans: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">Membership Plans</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Add New Plan
        </button>
      </div>
      <table className="w-full text-left text-gray-300">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-4 py-2">Plan Name</th>
            <th className="px-4 py-2">Price (LKR)</th>
            <th className="px-4 py-2">XP Rewards</th>
            <th className="px-4 py-2">Member Count</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPlans.map((plan) => (
            <tr key={plan._id} className="border-b border-gray-700">
              <td className="px-4 py-2">{plan.name}</td>
              <td className="px-4 py-2">{plan.price.toFixed(2)}</td>
              <td className="px-4 py-2">{plan.xpRate}</td>
              <td className="px-4 py-2">{plan.subscriberCount}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-blue-400 hover:text-blue-300 mr-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
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
                  tagline: "", // You should fetch the full membership data instead
                  benefits: [], // These should come from your API
                  isActive: true, // This should reflect the actual state
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default MembershipPlansTable;

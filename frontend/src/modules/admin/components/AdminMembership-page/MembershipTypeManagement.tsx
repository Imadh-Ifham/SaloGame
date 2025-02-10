import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import EditMembershipTypeModal from "./EditMembershipTypeModal";
import ConfirmationDialog from "./ConfirmationDialog";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMembershipData,
  deleteMembership,
  updateMembership,
  createMembership,
  toggleMembershipActive,
} from "../../../../store/slices/membershipSlice";

interface MembershipType {
  _id: string;
  name: string;
  price: number;
  benefits: string[];
  subscriberCount: number;
  isActive: boolean;
}

function MembershipTypeManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { memberships, loading, error } = useSelector(
    (state: RootState) => state.membership
  );

  const [editingMembership, setEditingMembership] =
    useState<MembershipType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] =
    useState<MembershipType | null>(null);

  // Fetch memberships when the component mounts
  useEffect(() => {
    dispatch(fetchMembershipData());
  }, [dispatch]);

  const handleEdit = (membership: MembershipType) => {
    setEditingMembership(membership);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMembership(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = (membership: MembershipType) => {
    setMembershipToDelete(membership);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!membershipToDelete?._id) return;

    try {
      await dispatch(deleteMembership(membershipToDelete._id)).unwrap();
      toast.success("Membership deleted successfully");
      setIsDeleteDialogOpen(false);
      setMembershipToDelete(null);
      dispatch(fetchMembershipData());
    } catch (error: any) {
      toast.error(error.message || "Failed to delete membership");
    }
  };

  const handleSaveMembership = async (
    formData: Partial<MembershipType & { price: string | number }>
  ) => {
    try {
      if (editingMembership?._id) {
        await dispatch(
          updateMembership({
            id: editingMembership._id,
            data: formData,
          })
        ).unwrap();
        toast.success("Membership updated successfully");
      } else {
        await dispatch(createMembership(formData)).unwrap();
        toast.success("Membership created successfully");
      }
      setIsEditModalOpen(false);
      setEditingMembership(null);
      dispatch(fetchMembershipData());
    } catch (error: any) {
      toast.error(error.message || "Failed to save membership");
    }
  };

  const handleToggleActive = async (membership: MembershipType) => {
    try {
      await dispatch(
        toggleMembershipActive({
          id: membership._id,
          isActive: !membership.isActive,
        })
      ).unwrap();
      toast.success("Membership status updated successfully");
      dispatch(fetchMembershipData());
    } catch (error: any) {
      toast.error(error.message || "Failed to update membership status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Membership Types</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Membership
        </button>
      </div>

      <div className="grid gap-6">
        {memberships.map((membership) => (
          <div key={membership._id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{membership.name}</h3>
                <p className="text-gray-600">
                  LKR {membership.price.toFixed(2)} / month
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(membership)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(membership)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => handleToggleActive(membership)}
                  className={
                    membership.isActive ? "text-green-500" : "text-gray-400"
                  }
                >
                  {membership.isActive ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>
            <ul className="list-disc list-inside mb-2">
              {membership.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-600">
                  {benefit}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">
              Active Subscribers: {membership.subscriberCount}
            </p>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <EditMembershipTypeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveMembership}
          membership={editingMembership}
        />
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Membership"
        message="Are you sure you want to delete this membership type? This action cannot be undone."
      />
    </div>
  );
}

export default MembershipTypeManagement;

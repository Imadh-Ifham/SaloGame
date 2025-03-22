import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaGamepad,
} from "react-icons/fa";
import { GiLevelThree, GiLevelTwo, GiLevelFour } from "react-icons/gi";
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
  tagline?: string;
  price: number;
  xpRate?: number;
  benefits: string[];
  subscriberCount: number;
  isActive: boolean;
}

// Helper function to get appropriate icon for membership tier
function getMembershipIcon(name: string) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("pro") || lowercaseName.includes("premium")) {
    return <GiLevelFour className="text-purple-400 text-2xl mr-2" />;
  } else if (
    lowercaseName.includes("standard") ||
    lowercaseName.includes("plus")
  ) {
    return <GiLevelThree className="text-blue-400 text-2xl mr-2" />;
  } else {
    return <GiLevelTwo className="text-green-400 text-2xl mr-2" />;
  }
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
      toast.success("Gaming tier deleted successfully");
      setIsDeleteDialogOpen(false);
      setMembershipToDelete(null);
      dispatch(fetchMembershipData());
    } catch (error: any) {
      toast.error(error.message || "Failed to delete gaming tier");
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
        toast.success("Gaming tier updated successfully");
      } else {
        await dispatch(createMembership(formData)).unwrap();
        toast.success("Gaming tier created successfully");
      }
      setIsEditModalOpen(false);
      setEditingMembership(null);
      dispatch(fetchMembershipData());
    } catch (error: any) {
      toast.error(error.message || "Failed to save gaming tier");
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
      toast.success("Gaming tier status updated successfully");
      dispatch(fetchMembershipData());
    } catch (error: any) {
      toast.error(error.message || "Failed to update gaming tier status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-gray-800 rounded-lg shadow-lg">
        {error}
      </div>
    );
  }

  // Sample data for demo purposes
  const membershipTiers =
    memberships.length > 0
      ? memberships
      : [
          {
            _id: "1",
            name: "Casual Gamer",
            price: 1500,
            benefits: [
              "10 hours gaming time",
              "Basic peripherals",
              "Standard seats",
            ],
            subscriberCount: 145,
            isActive: true,
          },
          {
            _id: "2",
            name: "Pro Gamer",
            price: 3500,
            benefits: [
              "50 hours gaming time",
              "Premium peripherals",
              "Priority booking",
              "Snack discount",
            ],
            subscriberCount: 89,
            isActive: true,
          },
          {
            _id: "3",
            name: "Elite Gamer",
            price: 6000,
            benefits: [
              "100 hours gaming time",
              "Elite peripherals",
              "Tournament entry",
              "Snacks included",
              "Reserved stations",
            ],
            subscriberCount: 42,
            isActive: true,
          },
        ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FaGamepad className="mr-2 text-blue-500" /> Gaming Tiers
        </h2>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow transition-all duration-300"
        >
          Add New Gaming Tier
        </button>
      </div>

      <div className="grid gap-6">
        {membershipTiers.map((membership) => (
          <div
            key={membership._id}
            className="border border-gray-700 bg-gray-900 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                {getMembershipIcon(membership.name)}
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">
                    {membership.name}
                  </h3>
                  <p className="text-gray-400">
                    LKR {membership.price.toFixed(2)} / month
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(membership)}
                  className="text-blue-400 hover:text-blue-300 bg-gray-800 p-2 rounded-lg transition-colors duration-200"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(membership)}
                  className="text-red-400 hover:text-red-300 bg-gray-800 p-2 rounded-lg transition-colors duration-200"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => handleToggleActive(membership)}
                  className={`${
                    membership.isActive
                      ? "text-green-400 hover:text-green-300"
                      : "text-gray-500 hover:text-gray-400"
                  } bg-gray-800 p-2 rounded-lg transition-colors duration-200`}
                >
                  {membership.isActive ? (
                    <FaToggleOn size={18} />
                  ) : (
                    <FaToggleOff size={18} />
                  )}
                </button>
              </div>
            </div>
            <ul className="space-y-1 mb-2">
              {membership.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-400 flex items-center">
                  <span className="text-yellow-500 mr-2">➤</span> {benefit}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500 mt-2 border-t border-gray-700 pt-2">
              Active Gamers:{" "}
              <span className="text-blue-400 font-medium">
                {membership.subscriberCount}
              </span>
            </p>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <EditMembershipTypeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveMembership}
          membershipType={editingMembership || undefined}
        />
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Gaming Tier"
        message="Are you sure you want to delete this gaming tier? All members with this tier will lose their benefits."
      />
    </div>
  );
}

export default MembershipTypeManagement;

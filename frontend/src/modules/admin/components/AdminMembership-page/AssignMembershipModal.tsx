// src/modules/admin/components/AdminMembership-page/AssignMembershipModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  email: string;
}

interface MembershipType {
  _id: string;
  name: string;
}

interface AssignMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: () => void;
}

const AssignMembershipModal: React.FC<AssignMembershipModalProps> = ({
  isOpen,
  onClose,
  onAssignmentComplete,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMembership, setSelectedMembership] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, membershipsResponse] = await Promise.all([
          axiosInstance.get("/users"),
          axiosInstance.get("/memberships"),
        ]);
        setUsers(usersResponse.data);
        setMembershipTypes(membershipsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load users or memberships");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/subscriptions/assign", {
        userId: selectedUser,
        membershipId: selectedMembership,
      });
      toast.success("Membership assigned successfully");
      onAssignmentComplete();
      onClose();
    } catch (error) {
      console.error("Error assigning membership:", error);
      toast.error("Failed to assign membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Membership">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
          </button>
          <label
            htmlFor="user"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select User
          </label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="membership"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Membership Type
          </label>
          <select
            id="membership"
            value={selectedMembership}
            onChange={(e) => setSelectedMembership(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a membership</option>
            {membershipTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign Membership"}
        </button>
      </form>
    </Modal>
  );
};

export default AssignMembershipModal;

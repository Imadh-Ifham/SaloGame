import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";

interface ExpiringMember {
  _id: string;
  //name: string;
  email: string;
  defaultMembershipId: {
    name: string;
  };
  subscription: {
    endDate: string;
  };
}

interface RenewMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RenewMembershipModal: React.FC<RenewMembershipModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch expiring memberships when modal opens
  useEffect(() => {
    const fetchExpiringMemberships = async () => {
      if (!isOpen) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/subscriptions/expiring");
        setExpiringMembers(response.data.data);
      } catch (error) {
        console.error("Error fetching expiring memberships:", error);
        setError("Failed to fetch expiring memberships");
        toast.error("Failed to load expiring memberships");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringMemberships();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) return;

    setLoading(true);
    try {
      await axiosInstance.post("/subscriptions/renew-multiple", {
        memberIds: selectedMembers,
      });
      toast.success("Selected memberships renewed successfully");
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Error renewing memberships:", error);
      toast.error("Failed to renew memberships");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renew Expiring Memberships">
      <div className="p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
        </button>
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && <div className="text-red-500 text-center py-4">{error}</div>}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Select members to renew:
              </h3>
              {expiringMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No memberships expiring soon
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {expiringMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        id={`member-${member._id}`}
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => toggleMember(member._id)}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <label
                        htmlFor={`member-${member._id}`}
                        className="flex flex-col flex-1 cursor-pointer"
                      >
                        {/*<span className="font-medium">{member.name}</span>*/}
                        <span className="text-sm text-gray-500">
                          {member.email} | {member.defaultMembershipId.name} |
                          Expires:{" "}
                          {new Date(
                            member.subscription.endDate
                          ).toLocaleDateString()}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={loading || selectedMembers.length === 0}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Renewing..." : "Renew Selected Memberships"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default RenewMembershipModal;

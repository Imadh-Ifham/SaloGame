import React, { useEffect, useState, Fragment } from "react";
import { Dialog, DialogTitle, Transition, Switch } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import axiosInstance from "@/axios.config";
import ConfirmationDialog from "@/components/confirmationDialog";

interface Membership {
  _id: string;
  name: string;
  tagline?: string;
  price: number;
  xpRate: number;
  benefits: string[];
  isActive: boolean;
}

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog
              className="fixed inset-0 bg-black bg-opacity-30"
              onClose={onClose}
            />
          </Transition.Child>

          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-primary" />
            </div>
            <Dialog.Title className="text-lg font-medium text-center leading-6 text-gray-900 dark:text-white">
              Success
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-center text-gray-500 dark:text-gray-300">
                {message}
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const AdminMembershipPage: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null); // General error state
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] =
    useState<Membership | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null); // Separate error state for deletion
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    tagline?: string;
    price: number;
    xpRate: number;
    benefits: string;
    isActive: boolean;
  }>({
    name: "",
    tagline: "",
    price: 0,
    xpRate: 0,
    benefits: "",
    isActive: true,
  });

  /**
   * Fetch memberships from the server.
   */
  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/memberships");
      setMemberships(response.data);
    } catch (error) {
      console.error("Error fetching memberships:", error);
      setError("Failed to fetch memberships.");
    }
    setLoading(false);
  };

  /**
   * Handle input changes in the form.
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  /**
   * Handle form submission for creating or updating a membership.
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || formData.price === 0) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      if (selectedMembership) {
        await axiosInstance.put(`/memberships/${selectedMembership._id}`, {
          ...formData,
          benefits: formData.benefits.split(",").map((b) => b.trim()),
        });
        setSuccessMessage("Membership updated successfully!");
      } else {
        await axiosInstance.post("/memberships", {
          ...formData,
          benefits: formData.benefits.split(",").map((b) => b.trim()),
        });
        setSuccessMessage("Membership created successfully!");
      }
      fetchMemberships();
      closeModal();
      setError(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Detailed Error:", error.response?.data);
    }
  };

  /**
   * Open the modal for creating or editing a membership.
   */
  const openModal = (membership: Membership | null = null) => {
    setSelectedMembership(membership);
    if (membership) {
      setFormData({
        name: membership.name,
        tagline: membership.tagline || "",
        price: membership.price,
        xpRate: membership.xpRate,
        benefits: membership.benefits.join(", "),
        isActive: membership.isActive,
      });
    } else {
      setFormData({
        name: "",
        tagline: "",
        price: 0,
        xpRate: 0,
        benefits: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
    setError(null); // Reset general error when opening modal
  };

  /**
   * Close the modal and reset form data and errors.
   */
  const closeModal = () => {
    setSelectedMembership(null);
    setIsModalOpen(false);
    setError(null);
  };

  /**
   * Toggle the active status of a membership.
   */
  const toggleActive = async (membershipId: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/memberships/${membershipId}/toggle-active`, {
        isActive: !currentStatus,
      });
      fetchMemberships();
    } catch (error) {
      console.error("Error toggling active state:", error);
      setError("Failed to toggle active status.");
    }
  };

  /**
   * Open the delete confirmation dialog.
   */
  const openDeleteDialog = (membership: Membership) => {
    setMembershipToDelete(membership);
    setIsDeleteDialogOpen(true);
    setDeleteError(null); // Reset delete-specific error
  };

  /**
   * Close the delete confirmation dialog.
   */
  const closeDeleteDialog = () => {
    setMembershipToDelete(null);
    setIsDeleteDialogOpen(false);
    setDeleteError(null);
  };

  /**
   * Confirm and execute the deletion of a membership.
   */
  const confirmDelete = async () => {
    if (!membershipToDelete) return;
    try {
      await axiosInstance.delete(`/memberships/${membershipToDelete._id}`);
      fetchMemberships();
      closeDeleteDialog();
      setSuccessMessage("Membership deleted successfully!");
    } catch (error) {
      console.error("Error deleting membership:", error);
      setDeleteError("Failed to delete membership.");
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  return (
    <section>
      <div className="container mx-auto px-4 py-8 my-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-press text-primary">
            Manage Memberships
          </h1>
          <button
            onClick={() => openModal(null)}
            className="mt-2 sm:mt-0 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark"
          >
            Create Membership
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          /* Memberships Table */
          <div className="overflow-x-auto my-10 font-poppins bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Active</th>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Price</th>
                  <th className="px-4 py-2 text-left font-semibold">XP Rate</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Benefits
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {memberships.map((membership) => (
                  <tr
                    key={membership._id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">
                      <Switch
                        checked={membership.isActive}
                        onChange={() =>
                          toggleActive(membership._id, membership.isActive)
                        }
                        className={`${
                          membership.isActive
                            ? "bg-primary"
                            : "bg-gray-200 dark:bg-gray-600"
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            membership.isActive
                              ? "translate-x-6"
                              : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    </td>
                    <td className="px-4 py-2">{membership.name}</td>
                    <td className="px-4 py-2">
                      ${membership.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{membership.xpRate}</td>
                    <td className="px-4 py-2">
                      {membership.benefits.join(", ")}
                    </td>
                    <td className="px-4 py-2 flex gap-x-2">
                      <button
                        onClick={() => openModal(membership)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteDialog(membership)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Membership Modal */}
        {isModalOpen && (
          <Transition appear show={isModalOpen} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-10 overflow-y-auto"
              onClose={closeModal}
            >
              <div className="min-h-screen px-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {selectedMembership
                        ? "Edit Membership"
                        : "Create Membership"}
                    </DialogTitle>

                    <form className="mt-4 space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* Tagline */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Tagline
                        </label>
                        <input
                          type="text"
                          name="tagline"
                          value={formData.tagline}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* XP Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          XP Rate
                        </label>
                        <input
                          type="number"
                          name="xpRate"
                          value={formData.xpRate}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          min="0"
                        />
                      </div>

                      {/* Benefits */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Benefits (comma-separated){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="benefits"
                          value={formData.benefits}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* Active Switch */}
                      <div className="flex items-center">
                        <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                          Active
                        </label>
                        <Switch
                          checked={formData.isActive}
                          onChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: checked,
                            }))
                          }
                          className={`${
                            formData.isActive
                              ? "bg-primary"
                              : "bg-gray-200 dark:bg-gray-600"
                          } relative inline-flex h-6 w-11 items-center rounded-full`}
                        >
                          <span
                            className={`${
                              formData.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                          />
                        </Switch>
                      </div>

                      {/* Display general error if any */}
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                    </form>

                    {/* Modal Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        )}

        {/* Delete Confirmation Dialog using ConfirmationDialog Component */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the membership "${membershipToDelete?.name}"? This action cannot be undone.`}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          confirmButtonClassName="bg-red-600 hover:bg-red-700"
          cancelButtonClassName="bg-gray-300 hover:bg-gray-400"
        >
          {/* Display delete-specific error if any */}
          {deleteError && (
            <p className="text-red-500 text-sm mt-2">{deleteError}</p>
          )}
        </ConfirmationDialog>

        {/* Success Dialog */}
        <SuccessDialog
          isOpen={!!successMessage}
          onClose={() => setSuccessMessage(null)}
          message={successMessage || ""}
        />
      </div>
    </section>
  );
};

export default AdminMembershipPage;

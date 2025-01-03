import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import axiosInstance from "@/axios.config";
import HomeLayout from "@/modules/users/layout/HomeLayout";
import ConfirmationDialog from "@/components/confirmationDialog";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface Offer {
  _id: string;
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate: string;
  endDateTime: string;
  usageLimit?: number;
  usageCount: number;
}

// SuccessDialog component
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

const AdminOfferPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null); // General error state
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null); // Separate error state for deletion

  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    isActive: boolean;
    startDate: string;
    endDateTime: string;
    usageLimit?: number;
  }>({
    title: "",
    code: "",
    discountType: "percentage",
    discountValue: 0,
    isActive: true,
    startDate: "",
    endDateTime: "",
    usageLimit: undefined,
  });

  /**
   * Fetch offers from the server.
   */
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/offer");
      setOffers(response.data.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError("Failed to fetch offers.");
    }
    setLoading(false);
  };

  /**
   * Handle input changes in the form.
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value, // Handle number inputs appropriately
    }));
  };

  /**
   * Handle form submission for creating or updating an offer.
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.title ||
      !formData.code ||
      formData.discountValue === 0 ||
      !formData.startDate ||
      !formData.endDateTime
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate dates
    const currentDate = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDateTime);

    // Remove time portion from current date for comparison
    currentDate.setHours(0, 0, 0, 0);

    if (startDate < currentDate) {
      setError("Start date cannot be in the past.");
      return;
    }

    if (startDate > endDate) {
      setError("End date must be after start date.");
      return;
    }

    try {
      if (selectedOffer) {
        await axiosInstance.put(`/offer/${selectedOffer._id}`, {
          ...formData,
          endDate: formData.endDateTime, // Ensure correct field names match backend
        });
        setSuccessMessage("Offer updated successfully.");
      } else {
        await axiosInstance.post("/offer", {
          ...formData,
          endDate: formData.endDateTime, // Ensure correct field names match backend
        });
        setSuccessMessage("Offer created successfully.");
      }
      fetchOffers();
      closeModal();
      setError(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Detailed Error:", error.response?.data);
    }
  };

  /**
   * Open the modal for creating or editing an offer.
   */
  const openModal = (offer: Offer | null = null) => {
    setSelectedOffer(offer);
    if (offer) {
      setFormData({
        title: offer.title,
        code: offer.code,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        isActive: offer.isActive,
        startDate: offer.startDate,
        endDateTime: offer.endDateTime,
        usageLimit: offer.usageLimit,
      });
    } else {
      setFormData({
        title: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        isActive: true,
        startDate: "",
        endDateTime: "",
        usageLimit: undefined,
      });
    }
    setIsModalOpen(true);
    setError(null); // Reset general error when opening modal
  };

  /**
   * Close the modal and reset form data and errors.
   */
  const closeModal = () => {
    setSelectedOffer(null);
    setIsModalOpen(false);
    setError(null);
  };

  /**
   * Toggle the active status of an offer.
   */
  const toggleActive = async (offerId: string, isActive: boolean) => {
    try {
      await axiosInstance.patch(`/offer/${offerId}/toggle-active`, {
        isActive: !isActive,
      });
      fetchOffers();
    } catch (error) {
      console.error("Error toggling active state:", error);
      setError("Failed to toggle active status.");
    }
  };

  /**
   * Open the delete confirmation dialog.
   */
  const openDeleteDialog = (offer: Offer) => {
    setOfferToDelete(offer);
    setIsDeleteDialogOpen(true);
    setDeleteError(null); // Reset delete-specific error
  };

  /**
   * Close the delete confirmation dialog.
   */
  const closeDeleteDialog = () => {
    setOfferToDelete(null);
    setIsDeleteDialogOpen(false);
    setDeleteError(null);
  };

  /**
   * Confirm and execute the deletion of an offer.
   */
  const confirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      await axiosInstance.delete(`/offer/${offerToDelete._id}`);
      fetchOffers();
      closeDeleteDialog();
      setSuccessMessage("Offer deleted successfully!");
    } catch (error) {
      console.error("Error deleting offer:", error);
      setDeleteError("Failed to delete offer.");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-8 my-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-press text-primary">Manage Offers</h1>
          <button
            onClick={() => openModal(null)}
            className="mt-2 sm:mt-0 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark"
          >
            Create Offer
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          /* Offers Table */
          <div className="overflow-x-auto my-10 font-poppins bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Active</th>
                  <th className="px-4 py-2 text-left font-semibold">Title</th>
                  <th className="px-4 py-2 text-left font-semibold">Code</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Discount
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Dates</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {offers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">
                      <Switch
                        checked={offer.isActive}
                        onChange={() => toggleActive(offer._id, offer.isActive)}
                        className={`${
                          offer.isActive
                            ? "bg-primary"
                            : "bg-gray-200 dark:bg-gray-600"
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            offer.isActive ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    </td>
                    <td className="px-4 py-2">{offer.title}</td>
                    <td className="px-4 py-2">{offer.code}</td>
                    <td className="px-4 py-2">
                      {offer.discountType === "percentage"
                        ? `${offer.discountValue}%`
                        : `$${offer.discountValue}`}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(offer.startDate).toLocaleDateString()} -{" "}
                      {new Date(offer.endDateTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 flex gap-x-2">
                      <button
                        onClick={() => openModal(offer)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteDialog(offer)}
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

        {/* Create/Edit Offer Modal */}
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
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {selectedOffer ? "Edit Offer" : "Create Offer"}
                    </Dialog.Title>

                    <form className="mt-4 space-y-4">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* Discount Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Discount Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Discount Value <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().slice(0, 16)}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* End Date & Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          End Date & Time{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="endDateTime"
                          value={formData.endDateTime}
                          onChange={handleInputChange}
                          min={new Date().toISOString().slice(0, 16)}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Usage Limit
                        </label>
                        <input
                          type="number"
                          name="usageLimit"
                          value={formData.usageLimit ?? ""}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                          min="0"
                        />
                      </div>

                      {/* Display error if any */}
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
          message={`Are you sure you want to delete the offer "${offerToDelete?.title}"? This action cannot be undone.`}
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

        <SuccessDialog
          isOpen={!!successMessage}
          onClose={() => setSuccessMessage(null)}
          message={successMessage || ""}
        />
      </div>
    </HomeLayout>
  );
};

export default AdminOfferPage;

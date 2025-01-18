import React, { Fragment, useState } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import HomeLayout from "@/modules/users/layout/HomeLayout";
import ConfirmationDialog from "@/components/confirmationDialog";
import SuccessDialog from "../components/AdminOffer-page/SuccessDialog";
import OfferForm from "../components/AdminOffer-page/OfferForm";
import { useOffers } from "../../../hooks/useOffers";
import { Offer } from "../../../types/offer";
import axiosInstance from "@/axios.config";

const AdminOfferPage: React.FC = () => {
  const {
    offers,
    loading,
    error,
    membershipTypes,
    successMessage,
    isModalOpen,
    selectedOffer,
    formData,
    setSuccessMessage,
    setError,
    fetchOffers,
    toggleActive,
    handleSubmit,
    handleInputChange,
    openModal,
    closeModal,
  } = useOffers();

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteDialog = (offer: Offer) => {
    setOfferToDelete(offer);
    setIsDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const closeDeleteDialog = () => {
    setOfferToDelete(null);
    setIsDeleteDialogOpen(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      await axiosInstance.delete(`/offer/${offerToDelete._id}`);
      await fetchOffers();
      closeDeleteDialog();
      setSuccessMessage("Offer deleted successfully!");
    } catch (error) {
      console.error("Error deleting offer:", error);
      setDeleteError("Failed to delete offer.");
    }
  };

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

                    <OfferForm
                      formData={formData}
                      membershipTypes={membershipTypes}
                      handleInputChange={handleInputChange}
                      error={error}
                    />

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

        {/* Delete Confirmation Dialog */}
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
    </HomeLayout>
  );
};

export default AdminOfferPage;

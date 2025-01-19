import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import HomeLayout from "@/modules/users/layout/HomeLayout";
import ConfirmationDialog from "@/components/confirmationDialog";
import SuccessDialog from "../components/AdminOffer-page/SuccessDialog";
import OfferForm from "../components/AdminOffer-page/OfferForm";
import { useOffers } from "../../../hooks/useOffers";
import { Offer } from "../../../types/offer";
import axiosInstance from "@/axios.config";
import "antd/dist/reset.css";
import { Table, Tag, Space, Switch } from "antd";
import { ColumnType } from "antd/es/table";
import { Key } from "antd/es/table/interface";

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

  // Define table columns
  const columns: ColumnType<Offer>[] = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a: Offer, b: Offer) => a.title.localeCompare(b.title),
      filterSearch: true,
      filters: [...new Set(offers.map((offer) => offer.title))].map(
        (title) => ({ text: title, value: title })
      ),
      onFilter: (value: boolean | Key, record: Offer) =>
        record.title.indexOf(value as string) === 0,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "General", value: "general" },
        { text: "Time-based", value: "time-based" },
        { text: "Membership-based", value: "membership-based" },
        { text: "Exclusive", value: "exclusive" },
      ],
      onFilter: (value: boolean | Key, record: Offer) =>
        record.category === value,
      render: (category: string) => {
        if (!category) return null; // Handle undefined/null case

        const getTagColor = (cat: string) => {
          switch (cat) {
            case "exclusive":
              return "gold";
            case "time-based":
              return "blue";
            case "membership-based":
              return "green";
            default:
              return "default";
          }
        };

        return (
          <Tag color={getTagColor(category)}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Discount",
      key: "discount",
      sorter: (a: Offer, b: Offer) => a.discountValue - b.discountValue,
      render: (_: any, record: Offer) => (
        <span>
          {record.discountType === "percentage"
            ? `${record.discountValue}%`
            : `$${record.discountValue}`}
        </span>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => toggleActive(record._id, record.isActive)}
          className={`${
            record.isActive ? "bg-primary" : "bg-gray-200 dark:bg-gray-600"
          }`}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Offer) => (
        <Space>
          <button
            onClick={() => openModal(record)}
            className="text-blue-500 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteDialog(record)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </Space>
      ),
    },
  ];
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

        {/* New Ant Design Table */}
        <Table
          columns={columns}
          dataSource={offers}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 3,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} offers`,
          }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          onChange={(pagination, filters, sorter) => {
            console.log("Table params changed:", {
              pagination,
              filters,
              sorter,
            });
          }}
        />

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

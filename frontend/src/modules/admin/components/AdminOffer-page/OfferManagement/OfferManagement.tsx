import React, { useState, useMemo } from "react";
import { useOffers } from "@/hooks/useOffers";
import { Offer } from "@/types/offer";
import OfferForm from "../OfferForm";
import SuccessDialog from "../SuccessDialog";
import { SearchBar } from "./SearchBar";
import { OffersTable } from "./OfferTable.tsx/index";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

const OfferManagement: React.FC = () => {
  const {
    offers,
    loading,
    error,
    membershipTypes,
    successMessage,
    isModalOpen,
    selectedOffer,
    formData,
    categories,
    setSuccessMessage,
    toggleActive,
    handleSubmit,
    handleInputChange,
    openModal,
    closeModal,
    deleteOffer,
  } = useOffers();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Offer;
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredAndSortedOffers = useMemo(() => {
    return [...offers]
      .filter((offer) => {
        const searchMatch =
          offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.code.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch =
          categoryFilter === "all" || offer.category === categoryFilter;
        return searchMatch && categoryMatch;
      })
      .sort((a, b) => {
        if ((a[sortConfig.key] ?? "") < (b[sortConfig.key] ?? "")) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if ((a[sortConfig.key] ?? "") > (b[sortConfig.key] ?? "")) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
  }, [offers, searchTerm, sortConfig, categoryFilter]);

  const handleSort = (key: keyof Offer) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-600 dark:text-purple-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gaming Offers & Promotions
        </h2>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        categories={categories}
        setSearchTerm={setSearchTerm}
        setCategoryFilter={setCategoryFilter}
      />

      <OffersTable
        filteredAndSortedOffers={filteredAndSortedOffers}
        sortConfig={sortConfig}
        handleSort={handleSort}
        toggleActive={toggleActive}
        openModal={openModal}
        deleteOffer={deleteOffer}
      />

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {selectedOffer ? "Edit Gaming Offer" : "Create New Gaming Offer"}
            </h3>
            <OfferForm
              formData={formData}
              membershipTypes={membershipTypes}
              handleInputChange={handleInputChange}
              error={error}
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {selectedOffer ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessDialog
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        message={successMessage || ""}
      />
    </div>
  );
};

export default OfferManagement;

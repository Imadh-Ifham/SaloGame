import React, { useState, useMemo } from "react";
import { useOffers } from "@/hooks/useOffers";
import { Offer } from "@/types/offer";
import OfferForm from "../OfferForm";
import SuccessDialog from "../SuccessDialog";
import { SearchBar } from "./SearchBar";
import { OffersTable } from "./OfferTable.tsx/index";
import { FiLoader } from "react-icons/fi";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
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
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
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

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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Offers</h2>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedOffer ? "Edit Offer" : "Create New Offer"}
            </h3>
            <OfferForm
              formData={formData}
              membershipTypes={membershipTypes}
              handleInputChange={handleInputChange}
              error={error}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                {selectedOffer ? "Update" : "Create"}
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

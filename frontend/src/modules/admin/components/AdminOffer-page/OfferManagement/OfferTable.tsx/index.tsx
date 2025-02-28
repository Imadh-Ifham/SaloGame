import React from "react";
import { Offer } from "@/types/offer";
import { TableHeader } from "./TableHeader";
import { OfferRow } from "./OfferRow";

interface OffersTableProps {
  filteredAndSortedOffers: Offer[];
  sortConfig: { key: string; direction: "asc" | "desc" };
  handleSort: (key: string) => void;
  toggleActive: (id: string, isActive: boolean) => void;
  openModal: (offer: Offer) => void;
  deleteOffer: (id: string) => Promise<void>;
}

export const OffersTable: React.FC<OffersTableProps> = ({
  filteredAndSortedOffers,
  sortConfig,
  handleSort,
  toggleActive,
  openModal,
  deleteOffer,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50">
          <TableHeader
            columnKey="title"
            label="Title"
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          <TableHeader
            columnKey="code"
            label="Code"
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          <TableHeader
            columnKey="category"
            label="Category"
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          <TableHeader
            columnKey="discountValue"
            label="Discount"
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          <th className="px-6 py-3 border-b">Status</th>
          <th className="px-6 py-3 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredAndSortedOffers.map((offer) => (
          <OfferRow
            key={offer._id}
            offer={offer}
            toggleActive={toggleActive}
            openModal={openModal}
            onDelete={deleteOffer}
          />
        ))}
      </tbody>
    </table>
  </div>
);

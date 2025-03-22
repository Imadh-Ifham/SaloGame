import React from "react";
import { Offer } from "@/types/offer";
import { TableHeader } from "./TableHeader";
import { OfferRow } from "./OfferRow";
import { FiFileText } from "react-icons/fi";

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
  <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <TableHeader
            columnKey="title"
            label="Promotion Name"
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
            label="Game Category"
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          <TableHeader
            columnKey="discountValue"
            label="Discount Value"
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredAndSortedOffers.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex flex-col items-center">
                <FiFileText className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-600" />
                <p className="font-medium">No gaming offers found</p>
                <p className="text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            </td>
          </tr>
        ) : (
          filteredAndSortedOffers.map((offer) => (
            <OfferRow
              key={offer._id}
              offer={offer}
              toggleActive={toggleActive}
              openModal={openModal}
              onDelete={deleteOffer}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

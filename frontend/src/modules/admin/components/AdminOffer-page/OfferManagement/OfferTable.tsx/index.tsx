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
  <div className="overflow-x-auto rounded-lg shadow">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
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
          <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm">
            Status
          </th>
          <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredAndSortedOffers.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
            >
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
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

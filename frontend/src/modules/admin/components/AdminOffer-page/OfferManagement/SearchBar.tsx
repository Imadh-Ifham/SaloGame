import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  searchTerm: string;
  categoryFilter: string;
  categories: string[];
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (category: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  categoryFilter,
  categories,
  setSearchTerm,
  setCategoryFilter,
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          placeholder="Search by promotion name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <select
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Game Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

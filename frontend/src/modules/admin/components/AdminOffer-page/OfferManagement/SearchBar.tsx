import React from "react";
import { FiSearch } from "react-icons/fi";

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
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search offers..."
          className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <select
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
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

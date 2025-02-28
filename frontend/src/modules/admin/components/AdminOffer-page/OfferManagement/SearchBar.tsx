import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchFilterProps {
  searchTerm: string;
  categoryFilter: string;
  categories: string[];
  setSearchTerm: (value: string) => void;
  setCategoryFilter: (value: string) => void;
}

export const SearchBar: React.FC<SearchFilterProps> = ({
  searchTerm,
  categoryFilter,
  categories,
  setSearchTerm,
  setCategoryFilter,
}) => (
  <div className="mb-6 flex justify-between items-center">
    <div className="relative w-72">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search offers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="all">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </option>
      ))}
    </select>
  </div>
);

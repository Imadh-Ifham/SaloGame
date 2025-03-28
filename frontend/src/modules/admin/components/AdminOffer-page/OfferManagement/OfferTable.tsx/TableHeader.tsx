import React from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

interface TableHeaderProps {
  columnKey: string;
  label: string;
  sortConfig: { key: string; direction: "asc" | "desc" };
  handleSort: (key: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columnKey,
  label,
  sortConfig,
  handleSort,
}) => {
  const isSorted = sortConfig.key === columnKey;
  const sortDirection = isSorted ? sortConfig.direction : "asc";

  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center group">
        <span className="mr-2">{label}</span>
        <span className="flex items-center">
          {isSorted ? (
            sortDirection === "asc" ? (
              <FiChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )
          ) : (
            <div className="w-4 h-4 flex flex-col items-center justify-center opacity-0 group-hover:opacity-50">
              <FiChevronUp className="w-3 h-3 text-gray-400 dark:text-gray-600 -mb-1" />
              <FiChevronDown className="w-3 h-3 text-gray-400 dark:text-gray-600" />
            </div>
          )}
        </span>
      </div>
    </th>
  );
};

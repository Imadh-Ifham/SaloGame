import React from "react";

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
      className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm"
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center cursor-pointer group">
        <span className="mr-2">{label}</span>
        <span className="flex flex-col">
          <svg
            className={`w-2 h-2 ${
              isSorted && sortDirection === "asc"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400"
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 14l5-5 5 5H7z" />
          </svg>
          <svg
            className={`w-2 h-2 ${
              isSorted && sortDirection === "desc"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400"
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </span>
      </div>
    </th>
  );
};

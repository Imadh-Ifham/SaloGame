import React from "react";
import { FaSort } from "react-icons/fa";

interface TableHeaderProps {
  columnKey: string;
  label: string;
  sortConfig: { key: string; direction: "asc" | "desc" };
  handleSort: (key: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columnKey,
  label,
  handleSort,
}) => (
  <th
    className="px-6 py-3 border-b cursor-pointer"
    onClick={() => handleSort(columnKey)}
  >
    <div className="flex items-center space-x-2">
      <span>{label}</span>
      <FaSort className="text-gray-400" />
    </div>
  </th>
);

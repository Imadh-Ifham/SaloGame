import React, { useState, useEffect, useRef } from "react";
import { FunnelIcon } from "@heroicons/react/24/solid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface FilterButtonProps {
  onApply: (filters: {
    status: "Booked" | "Completed" | "InUse" | "Cancelled" | "";
    date: Date | null;
    filterType: "day" | "month" | "";
    count: number;
  }) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onApply }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<"day" | "month" | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<
    "Booked" | "Completed" | "InUse" | "Cancelled" | ""
  >("");
  const [count, setCount] = useState<number>(20);
  const filterRef = useRef<HTMLDivElement>(null);

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleFilterTypeChange = (type: "day" | "month") => {
    if (filterType === type) {
      setFilterType("");
      setSelectedDate(null);
    } else {
      setFilterType(type);
      setSelectedDate(null);
    }
  };

  const handleCountChange = (count: number) => {
    setCount(count);
  };

  const handleApplyClick = () => {
    onApply({ status, date: selectedDate, filterType, count });
    console.log("Apply clicked", status, selectedDate, filterType, count);
    handleFilterClick();
  };

  const handleResetAndApplyClick = () => {
    setStatus("");
    setSelectedDate(null);
    setFilterType("");
    setCount(20);
    onApply({ status: "", date: null, filterType: "", count: 20 });
    console.log("Reset and apply clicked");
    handleFilterClick();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      filterRef.current &&
      !filterRef.current.contains(event.target as Node)
    ) {
      setIsFilterOpen(false);
    }
  };

  useEffect(() => {
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <div className="relative">
      <button
        onClick={handleFilterClick}
        className="ml-4 p-2 rounded-lg border-2 dark:border-gamer-green/20 text-gamer-green hover:bg-gamer-green/10 transition-colors"
      >
        <FunnelIcon className="h-4 w-4" />
      </button>
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={filterRef}
            className="relative z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            {/* Filter options */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "Booked"
                      | "Completed"
                      | "InUse"
                      | "Cancelled"
                      | ""
                  )
                }
                className="w-full px-3 py-2 rounded-lg border-2 dark:border-gamer-green/20 dark:bg-[#111111]/60 dark:text-white"
              >
                <option value="">Select Status</option>
                <option value="Booked">Booked</option>
                <option value="InUse">InUse</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {status !== "InUse" ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Number of bookings
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleCountChange(10)}
                      className={`px-3 py-2 rounded-lg border-2 ${
                        count === 10
                          ? "text-gamer-green border-gamer-green"
                          : "text-gray-700 dark:text-gray-300 dark:border-gamer-green/20"
                      }`}
                    >
                      10
                    </button>
                    <button
                      onClick={() => handleCountChange(20)}
                      className={`px-3 py-2 rounded-lg border-2 ${
                        count === 20
                          ? "text-gamer-green border-gamer-green"
                          : "text-gray-700 dark:text-gray-300 dark:border-gamer-green/20"
                      }`}
                    >
                      20
                    </button>
                    <button
                      onClick={() => handleCountChange(30)}
                      className={`px-3 py-2 rounded-lg border-2 ${
                        count === 30
                          ? "text-gamer-green border-gamer-green"
                          : "text-gray-700 dark:text-gray-300 dark:border-gamer-green/20"
                      }`}
                    >
                      30
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    Filter By
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFilterTypeChange("day")}
                      className={`px-3 py-2 rounded-lg border-2 ${
                        filterType === "day"
                          ? "text-gamer-green border-gamer-green"
                          : "text-gray-700 dark:text-gray-300 dark:border-gamer-green/20"
                      }`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => handleFilterTypeChange("month")}
                      className={`px-3 py-2 rounded-lg border-2 ${
                        filterType === "month"
                          ? "text-gamer-green border-gamer-green"
                          : "text-gray-700 dark:text-gray-300 dark:border-gamer-green/20"
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  {filterType !== "" ? (
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                      Select Date
                    </label>
                  ) : null}
                  {filterType === "day" ? (
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select Date"
                      className="w-full px-3 py-2 rounded-lg border-2 dark:border-gamer-green/20 dark:bg-[#111111]/60 dark:text-white"
                    />
                  ) : filterType === "month" ? (
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM"
                      showMonthYearPicker
                      placeholderText="Select Month"
                      className="w-full px-3 py-2 rounded-lg border-2 dark:border-gamer-green/20 dark:bg-[#111111]/60 dark:text-white"
                    />
                  ) : null}
                </div>
              </>
            ) : null}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleApplyClick}
                className="w-full px-3 py-2 rounded-lg bg-gamer-green text-white font-semibold hover:bg-gamer-green/90 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleResetAndApplyClick}
                className="w-full px-3 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors"
              >
                Reset & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;

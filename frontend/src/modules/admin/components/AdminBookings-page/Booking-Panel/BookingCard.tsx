import React, { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Gamepad2, UserCircle, Plus } from "lucide-react";

interface BookingCardProps {
  customerName: string;
  machines: { name: string; type: "pc" | "console" }[];
  startTime: string;
  duration: string;
  status: "Confirmed" | "Pending" | "Completed";
  description: string;
  price: string;
  paymentStatus: "Paid" | "Unpaid";
}

const BookingCard: React.FC<BookingCardProps> = ({
  customerName,
  machines,
  startTime,
  duration,
  status,
  description,
  price,
  paymentStatus,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Select the first machine icon
  const firstMachine = machines[0];
  const isMultipleMachines = machines.length > 1;

  return (
    <motion.div
      initial={{ height: "90px" }}
      animate={{ height: expanded ? "auto" : "90px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="border border-gray-300 dark:border-gray-500 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[0.99] transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact View */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Profile Icon & Name */}
        <div className="flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-300" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {customerName}
          </span>
        </div>

        {/* Machines Display */}
        <div className="flex items-center">
          {firstMachine && (
            <div className="flex items-center">
              {firstMachine.type === "pc" ? (
                <Monitor className="w-5 h-5 text-blue-500" />
              ) : (
                <Gamepad2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
          {isMultipleMachines && (
            <Plus className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          )}
        </div>
      </div>

      {/* Start Time & Duration */}
      <div className="px-3 flex justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>Start: {startTime}</span>
        <span>Duration: {duration}</span>
      </div>

      {/* Status Indicator */}
      <div className="px-3 py-1">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-md ${
            status === "Confirmed"
              ? "bg-green-100 text-green-600"
              : status === "Pending"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-gray-100 text-red-600"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Expanded View */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-3 py-2 border-t border-gray-200 text-xs text-gray-700 dark:text-gray-300"
        >
          <p>
            <strong>End Time:</strong> {parseInt(startTime) + 0.5}:00
          </p>
          <p>
            <strong>Description:</strong> {description}
          </p>
          <p>
            <strong>Machines:</strong>
          </p>
          <ul className="ml-3">
            {machines.map((machine, index) => (
              <li key={index} className="flex items-center gap-2">
                {machine.type === "pc" ? (
                  <Monitor className="w-4 h-4 text-blue-500" />
                ) : (
                  <Gamepad2 className="w-4 h-4 text-green-500" />
                )}
                <span>{machine.name}</span>
              </li>
            ))}
          </ul>
          <p>
            <strong>Price:</strong> Rs. {price}
          </p>
          <p>
            <strong>Payment:</strong>
            <span
              className={`ml-1 font-semibold ${
                paymentStatus === "Paid" ? "text-green-500" : "text-red-500"
              }`}
            >
              {paymentStatus}
            </span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookingCard;

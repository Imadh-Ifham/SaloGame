import React, { useState } from "react";

const BookedMachineLog: React.FC = () => {
  const [activeMachineCategory, setActiveMachineCategory] =
    useState<String>("Console");

  const bookedMachinePanelNavItems = ["All", "Console", "PC"];

  // Dummy booked machine history data
  const bookedMachineHistory = [
    {
      machine: "Console",
      customer: "John Doe",
      date: "2025-02-01",
      time: "10:00 AM",
    },
    {
      machine: "Console",
      customer: "Sarah Lee",
      date: "2025-02-01",
      time: "11:30 AM",
    },
    {
      machine: "Console",
      customer: "Michael Smith",
      date: "2025-02-01",
      time: "02:00 PM",
    },
    {
      machine: "PC",
      customer: "Emma Johnson",
      date: "2025-02-02",
      time: "09:00 AM",
    },
    {
      machine: "PC",
      customer: "James Brown",
      date: "2025-02-02",
      time: "03:30 PM",
    },
  ];

  return (
    <div className="shadow-lg border rounded-lg overflow-auto p-4">
      <div className="font-semibold text-gray-800 mb-3">Booking Logs</div>
      <nav className="flex border-b border-gray-300 mb-3">
        {bookedMachinePanelNavItems.map((item) => (
          <div
            key={item}
            onClick={() => setActiveMachineCategory(item)}
            className={`mr-2 px-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-200 rounded-md transition duration-300 ease-in-out ${
              activeMachineCategory === item ? "bg-gray-300" : ""
            }`}
          >
            {item}
          </div>
        ))}
      </nav>
      <div className="mt-3">
        <ol className="space-y-2 flex flex-wrap">
          {bookedMachineHistory.map((item, index) =>
            activeMachineCategory === item.machine ||
            activeMachineCategory === "All" ? (
              <li
                key={index}
                className="px-4 py-2 w-full bg-gray-100 text-gray-600 rounded-lg shadow-sm italic text-sm"
              >
                <div className="font-medium">
                  {item.machine} - {item.customer}
                </div>
                <div className="text-xs text-gray-500">
                  {item.date} at {item.time}
                </div>
              </li>
            ) : null
          )}
        </ol>
      </div>
    </div>
  );
};

export default BookedMachineLog;

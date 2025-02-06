import React, { useState } from "react";
import BookedMachineLog from "./BookedMachineLog";
import ManageMachine from "./ManageMachine";
import Notification from "./Notification";

const ControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Log");

  const controlNavItems = ["Log", "Settings", "Notification"];
  return (
    <div className="h-full flex">
      <div className="flex-grow p-2 border-x-2  overflow-auto">
        {activeTab === "Log" ? (
          <BookedMachineLog />
        ) : activeTab === "Settings" ? (
          <ManageMachine />
        ) : activeTab === "Notification" ? (
          <Notification />
        ) : (
          "Please select a controller from the tab in the right"
        )}
      </div>
      <div className="w-20 md:w-36 p-2">
        <div className="text-lg font-bold">Controls</div>
        <div className="flex flex-col gap-1 mt-1">
          {controlNavItems.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveTab(item)}
              className="text-sm border-b-2 px-2 pt-3 cursor-pointer hover:bg-gray-200 rounded-lg"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

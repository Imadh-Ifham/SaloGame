import React from "react";
import { FaGamepad } from "react-icons/fa";

const dummyMachineTypes = [
  {
    name: "Gaming PC",
    description: "High-end gaming PC with the latest specs.",
    specifications: "Specs: 4K, 144Hz, RTX 3080",
    rateByPlayers: { 1: 600 },
    imageUrl:
      "https://t3.ftcdn.net/jpg/01/63/91/94/360_F_163919461_g76Kxgr6Q8oXhlI2xiJT2o0QWI6N0C0W.jpg",
    machineCount: 10,
  },
  {
    name: "Console",
    description: "Latest generation console with exclusive games.",
    specifications: "Specs: 4K, 60Hz, HDR",
    rateByPlayers: { 1: 500, 2: 800, 4: 1200 },
    imageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2978540/ss_599adbb06e32c7d0bae72502d9bf4aed1ac6d246.1920x1080.jpg?t=1741806013",
    machineCount: 3,
  },
];

const MachineManage: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-y-auto scrollbar-hide px-4">
      <div className="text-base font-poppins font-semibold ml-20 mb-8 mt-1 dark:text-primary">
        Manage Machine
      </div>
      {dummyMachineTypes.map((machineType) => (
        <div className="mb-6 mx-20 bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden transition-transform transform hover:scale-[0.99]">
          <img
            src={machineType.imageUrl}
            alt={machineType.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {machineType.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {machineType.description}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {machineType.specifications}
            </p>

            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                💰 Hourly Rates:
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                {Object.entries(machineType.rateByPlayers).map(
                  ([players, rate]) => (
                    <p
                      key={players}
                      className="text-gray-700 dark:text-gray-300 text-sm"
                    >
                      🎮 {players} player(s):{" "}
                      <span className="font-semibold">{rate} units/hour</span>
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center">
                <FaGamepad className="text-blue-600 dark:text-blue-400 text-xl mr-2" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Machine Count:
                </span>
                <span className="text-gray-700 dark:text-gray-300 ml-1 font-bold">
                  {machineType.machineCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MachineManage;

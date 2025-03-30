import { Machine } from "@/types/machine";
import React from "react";

interface ConsoleProp {
  machine: Machine;
}

const Console: React.FC<ConsoleProp> = ({ machine }) => {
  return (
    <div
      className={`w-full h-32 border rounded-2xl border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:bg-gray-700 hover:scale-105 shadow-xl
    transition-transform duration-300 ease-in-out overflow-hidden flex flex-col items-center cursor-default`}
    >
      {/* Machine Info */}
      <div className="flex justify-center items-center gap-x-2">
        <div className="text-gray-500 mt-1 font-semibold">
          {machine.serialNumber}
        </div>
      </div>

      {/* Console Representation */}
      <div className="w-full flex items-center flex-grow gap-4">
        {/* Screen with slight depth */}
        <div id="screen" className="w-1/2 h-16 flex items-center relative">
          <div className="w-1 h-10 bg-slate-600 dark:bg-gray-500 rounded-l-lg shadow-md" />
          <div className="w-1 h-full bg-slate-700 dark:bg-gray-400 rounded-sm shadow-md" />
        </div>

        {/* Sofa with better depth */}
        <div
          id="sofa"
          className="h-[90%] flex flex-col items-center bg-slate-300 dark:bg-gray-500 rounded-md overflow-hidden shadow-md"
        >
          <div className="w-8 h-2 bg-slate-500 dark:bg-gray-800 rounded-l-sm rounded-tr-md shadow-sm" />
          <div className="flex flex-grow">
            <div className="w-6 h-full" />
            <div className="w-2 h-full bg-slate-500 dark:bg-gray-800 shadow-sm" />
          </div>
          <div className="w-8 h-2 bg-slate-500 dark:bg-gray-800 rounded-l-sm rounded-br-md shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default Console;

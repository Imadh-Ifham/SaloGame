import React, { useState } from "react";

const ManageMachine: React.FC = () => {
  const [editorTabVisible, setEditorTabVisible] = useState(false);
  const [activeNav, setActiveNav] = useState("All");
  const navItems = ["All", "Console", "PC-L", "PC-R"];
  return (
    <>
      <div className="text-lg font-bold">Manage Machine</div>
      <div className="flex flex-grow">
        <div className="h-full">
          <nav className="flex gap-3 mx-2">
            {navItems.map((item, index) => (
              <div
                key={index}
                onClick={() => setActiveNav(item)}
                className={`border px-4 text-sm text-gray-600 rounded-full cursor-pointer hover:bg-slate-400 min-w-20 text-center ${
                  activeNav === item ? "bg-slate-400" : ""
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
          <div></div>
        </div>
        {editorTabVisible ? <div className="h-full"></div> : ""}
      </div>
    </>
  );
};

export default ManageMachine;

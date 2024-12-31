import React from "react";

interface ToolbarProps {
  tool: "wall" | "machine";
  setTool: (tool: "wall" | "machine") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ tool, setTool }) => {
  return (
    <div className="flex p-4 bg-[#eaeaea] border border-b-[#ccc]">
      <button
        className={`mr-3 px-4 py-3 border-none cursor-pointer ${
          tool === "wall" ? "bg-[#007bff] text-[#fff]" : ""
        }`}
        onClick={() => setTool("wall")}
      >
        Add Wall
      </button>
      <button
        className={`mr-3 px-4 py-3 border-none cursor-pointer ${
          tool === "machine" ? "bg-[#007bff] text-[#fff]" : ""
        }`}
        onClick={() => setTool("machine")}
      >
        Add Machine
      </button>
    </div>
  );
};

export default Toolbar;

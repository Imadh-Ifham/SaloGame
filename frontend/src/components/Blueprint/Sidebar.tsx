import React from "react";
import { Blueprint } from "../../types/blueprint";

interface SidebarProps {
  blueprints: Blueprint[];
  setActiveBlueprint: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  blueprints,
  setActiveBlueprint,
}) => {
  return (
    <div className="w-52 bg-slate-400 p-4 border border-r-2 border-r-black">
      <h3>Blueprints</h3>
      <ul>
        {blueprints.map((bp) => (
          <li key={bp.id} onClick={() => setActiveBlueprint(bp.id)}>
            {bp.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

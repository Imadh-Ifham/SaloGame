import React, { useState } from "react";
import { Blueprint, Wall } from "../../../types/blueprint";
import Sidebar from "../../../components/Blueprint/Sidebar";
import Toolbar from "../../../components/Blueprint/Toolbar";
import BlueprintCanvas from "../../../components/Blueprint/BlueprintCanvas";

const BlueprintManager: React.FC = () => {
  const [tool, setTool] = useState<"wall" | "machine">("wall");
  const [walls, setWalls] = useState<Wall[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [activeBlueprint, setActiveBlueprint] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <Sidebar
        blueprints={blueprints}
        setActiveBlueprint={setActiveBlueprint}
      />
      <div className="flex flex-1 flex-col">
        <Toolbar tool={tool} setTool={setTool} />
        <BlueprintCanvas tool={tool} walls={walls} setWalls={setWalls} />
      </div>
    </div>
  );
};

export default BlueprintManager;

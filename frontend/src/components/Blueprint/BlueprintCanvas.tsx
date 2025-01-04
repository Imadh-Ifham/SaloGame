import React, { useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { Wall } from "../../types/blueprint";

interface BlueprintCanvasProps {
  tool: "wall" | "machine";
  walls: Wall[];
  setWalls: (walls: Wall[]) => void;
}

const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({
  tool,
  walls,
  setWalls,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [newWall, setNewWall] = useState<Wall | null>(null);

  const handleMouseDown = (e: any) => {
    if (tool !== "wall") return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewWall({
      id: `wall-${Date.now()}`,
      type: "wall",
      metadata: { points: [x, y, x, y] },
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !newWall) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewWall({
      ...newWall,
      metadata: {
        ...newWall.metadata,
        points: [newWall.metadata.points[0], newWall.metadata.points[1], x, y],
      },
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && newWall) {
      setWalls([...walls, newWall]);
      setNewWall(null);
      setIsDrawing(false);
    }
  };

  return (
    <Stage
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {walls.map((wall) => (
          <Line
            key={wall.id}
            points={wall.metadata.points}
            stroke="black"
            strokeWidth={5}
            lineCap="round"
          />
        ))}
        {newWall && (
          <Line
            points={newWall.metadata.points}
            stroke="blue"
            strokeWidth={5}
            lineCap="round"
            dash={[10, 5]}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default BlueprintCanvas;

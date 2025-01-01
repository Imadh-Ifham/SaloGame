export interface Blueprint {
  id: string;
  name: string;
  elements: Array<Wall | Machine>;
}

export interface Machine {
  id: string;
  type: "machine";
  metadata: {
    x: number;
    y: number;
    width: number;
    height: number;
    isAvailable: boolean;
  };
}

export interface Wall {
  id: string;
  type: "wall";
  metadata: {
    points: number[];
  };
}

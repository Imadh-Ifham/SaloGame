export const availabilityBgColors = {
  Available: "bg-green-500",
  Booked: "bg-blue-500",
  InUse: "bg-yellow-500",
  Maintenance: "bg-red-500",
};

export interface Machine {
  _id: string;
  serialNumber: string;
  machineCategory: string;
}

interface IRateByPlayers {
  [key: number]: number;
}

// Interface for the MachineType document
export interface IMachineType {
  _id?: string;
  name: string;
  description?: string;
  supportedGames: string[];
  specifications?: string;
  rateByPlayers: IRateByPlayers; // Hourly rate
  imageUrl?: string;
}

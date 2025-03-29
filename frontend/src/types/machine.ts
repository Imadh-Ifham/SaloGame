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

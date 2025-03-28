export type bookingModalString = "cancel" | "extend" | "end" | "start";
export type bookingStatusString =
  | "Booked"
  | "InUse"
  | "Completed"
  | "Cancelled"
  | "Available";
export type PaymentType = "cash" | "card" | "XP";

export interface MachineBooking {
  firstBooking: NewCustomerBooking | null; // Current booking
  status: bookingStatusString; // Machine status
  nextBooking: NewCustomerBooking | null; // Upcoming booking
}

export interface IMachineBooking {
  machineID: string;
  userCount: number;
  _id?: string;
}

export type CustomerBooking = {
  _id?: string;
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: string; // Booking start time in UTC format
  endTime?: string; // Auto-calculated based on duration
  duration: number; // Booking duration in minutes
  machines: IMachineBooking[]; // List of machines booked
  status: bookingStatusString;
  transactionID?: string;
  totalPrice?: number;
  bookingType?: string;
  paymentType?: string;
  paymentStatus?: string;
};

interface Booking {
  _id: string;
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: string;
  endTime?: string;
  machines: NewMachineBooking[]; // List of machines booked
  status: bookingStatusString;
}
interface Transaction {
  _id: string;
  paymentType: PaymentType;
  amount: number;
  transactionType: string;
  status: string;
}

interface NewMachineBooking {
  machineID: {
    _id: string;
    serialNumber: string;
    machineCategory: string;
  };
  userCount: number;
  _id?: string;
}

export interface NewCustomerBooking {
  booking: Booking;
  transaction: Transaction;
}
export interface MachineStatus {
  [machineID: string]: {
    status: bookingStatusString;
  };
}

import { AllMachineBookings } from "@/store/slices/bookingSlice";

export const availabilityBgColors = {
  Available: "bg-green-500",
  Booked: "bg-blue-300",
  InUse: "bg-blue-500",
  Maintenance: "bg-red-500",
};

export interface Machine {
  _id: string;
  serialNumber: string;
  machineCategory: string;
}

export const dummyData: AllMachineBookings = {
  "679b0784f752557623abe174": {
    firstBooking: {
      customerName: "Alice Johnson",
      phoneNumber: "1234567890",
      notes: "Gaming session",
      startTime: "2025-02-01T19:30:00",
      endTime: "2025-02-01T20:30:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: {
      customerName: "Bob Smith",
      phoneNumber: "9876543210",
      notes: "Practice session",
      startTime: "2025-02-01T21:00:00",
      endTime: "2025-02-01T22:00:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
  },
  "679b0799f752557623abe179": {
    firstBooking: {
      customerName: "Charlie Brown",
      phoneNumber: "2345678901",
      notes: "Esports training",
      startTime: "2025-02-01T20:00:00",
      endTime: "2025-02-01T22:00:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: null,
  },
  "679b079ef752557623abe17b": {
    firstBooking: {
      customerName: "David White",
      phoneNumber: "3456789012",
      notes: "Casual play",
      startTime: "2025-02-01T20:30:00",
      endTime: "2025-02-01T21:30:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: {
      customerName: "Eve Black",
      phoneNumber: "4567890123",
      notes: "Evening match",
      startTime: "2025-02-01T21:45:00",
      endTime: "2025-02-01T22:45:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
  },
  "679b07abf752557623abe17d": {
    firstBooking: null,
    status: "Available",
    nextBooking: {
      customerName: "Frank Green",
      phoneNumber: "5678901234",
      notes: "Late night session",
      startTime: "2025-02-01T21:30:00",
      endTime: "2025-02-01T22:30:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
  },
  "679b07b0f752557623abe17f": {
    firstBooking: null,
    status: "Maintenance",
    nextBooking: null,
  },
  "679b07b5f752557623abe181": {
    firstBooking: {
      customerName: "Grace Blue",
      phoneNumber: "6789012345",
      notes: "Competitive training",
      startTime: "2025-02-01T19:30:00",
      endTime: "2025-02-01T20:30:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: {
      customerName: "Hank Red",
      phoneNumber: "7890123456",
      notes: "Solo practice",
      startTime: "2025-02-01T21:00:00",
      endTime: "2025-02-01T22:00:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
  },
  "679b07baf752557623abe183": {
    firstBooking: {
      customerName: "Ivy Silver",
      phoneNumber: "8901234567",
      notes: "Strategy session",
      startTime: "2025-02-01T20:00:00",
      endTime: "2025-02-01T21:00:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: {
      customerName: "Jack Gold",
      phoneNumber: "9012345678",
      notes: "Evening training",
      startTime: "2025-02-01T21:15:00",
      endTime: "2025-02-01T22:15:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
  },
  "679b07e1f752557623abe186": {
    firstBooking: null,
    status: "Available",
    nextBooking: null,
  },
  "679b07e6f752557623abe188": {
    firstBooking: {
      customerName: "Karen Orange",
      phoneNumber: "0123456789",
      notes: "Test play",
      startTime: "2025-02-01T20:00:00",
      endTime: "2025-02-01T21:00:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: null,
  },
  "679b07ebf752557623abe18a": {
    firstBooking: {
      customerName: "Leo Purple",
      phoneNumber: "1230984567",
      notes: "Friendly match",
      startTime: "2025-02-01T20:30:00",
      endTime: "2025-02-01T21:30:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
    status: "Booked",
    nextBooking: {
      customerName: "Mia Cyan",
      phoneNumber: "5678432109",
      notes: "Team training",
      startTime: "2025-02-01T21:45:00",
      endTime: "2025-02-01T22:45:00",
      duration: 60,
      status: "Booked",
      machines: [],
    },
  },
};

export const machineStatus: {
  [machineId: string]: "Booked" | "Available" | "InUse" | "Maintenance";
} = {
  "679b0784f752557623abe174": "InUse", // Ongoing booking overlaps with the current time
  "679b0799f752557623abe179": "InUse", // Future booking within 2-hour window
  "679b079ef752557623abe17b": "Booked", // No current booking, next booking is valid
  "679b07abf752557623abe17d": "Available", // No bookings at all
  "679b07b0f752557623abe17f": "Maintenance", // Ongoing booking overlaps with the current time
  "679b07b5f752557623abe181": "InUse", // Future booking scheduled
  "679b07baf752557623abe183": "InUse", // No current booking, next booking valid
  "679b07e1f752557623abe186": "Available", // Assume some machines are under maintenance
  "679b07e6f752557623abe188": "InUse", // Future booking but not in use yet
  "679b07ebf752557623abe18a": "Booked", // Ongoing overlapping booking
};

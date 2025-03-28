import { IBooking, IMachineBooking } from "../models/booking.model";

export interface IFirstAndNextBookingResponse {
  firstBooking: IBooking;
  status: "Booked" | "InUse" | "Completed" | "Available" | "Maintainance";
  nextBooking: IBooking;
}

export type CustomerBooking = {
  customerName: string;
  phoneNumber?: string | null;
  notes?: string | null;
  startTime: Date;
  endTime: Date;
  machines: IMachineBooking[];
  totalPrice?: number;
  status: "Booked" | "InUse" | "Completed" | "Cancelled";
};

export interface BookingReportData {
  metrics: {
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    bookingsByStatus: Record<string, number>;
    bookingsByMachine: Record<string, number>;
  };
  startDate: Date;
  endDate: Date;
}

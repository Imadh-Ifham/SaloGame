import axiosInstance from "@/axios.config";

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

export const getBookingReport = async (
  period: string
): Promise<BookingReportData> => {
  const response = await axiosInstance.get(`/bookings/report?period=${period}`);
  console.log("response.data: ", response.data);
  return response.data;
};

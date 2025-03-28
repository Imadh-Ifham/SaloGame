export const demoBookingReportData = {
  metrics: {
    totalBookings: 25,
    completedBookings: 20,
    totalRevenue: 5000,
    averageBookingValue: 200,
    bookingsByStatus: {
      Booked: 15,
      Completed: 8,
      Cancelled: 2,
    },
    bookingsByMachine: {
      "Machine A": 15,
      "Machine B": 10,
    },
  },
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-03-31"),
};

export default demoBookingReportData;

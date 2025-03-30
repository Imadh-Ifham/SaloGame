// Function to calculate the start date based on the given period
export const calculateStartDate = (period: string): Date => {
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case "previous-month":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case "last-3-months":
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case "last-6-months":
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case "last-year":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      throw new Error("Invalid period specified");
  }

  return startDate;
};

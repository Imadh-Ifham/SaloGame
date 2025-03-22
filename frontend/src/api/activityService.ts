import axiosInstance from "@/axios.config";

export const fetchRecentActivities = async () => {
  const response = await axiosInstance.get("/subscriptions/recent-activities");
  return response.data.data; // Assuming the backend returns { success: true, data: [...] }
};

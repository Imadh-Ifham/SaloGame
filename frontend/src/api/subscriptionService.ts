// frontend/src/api/subscriptionService.ts
import axiosInstance from "@/axios.config";

export const fetchSubscriptionGrowth = async () => {
  const response = await axiosInstance.get("/subscriptions/growth");
  return response.data.data; // Assuming the backend returns data in this format
};

import { useState, useEffect } from "react";
import axiosInstance from "@/axios.config";
import { Offer, MembershipType, FormData } from "../types/offer";

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [activeToggleId, setActiveToggleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category: "general",
    title: "",
    code: "",
    discountType: "percentage",
    discountValue: 0,
    isActive: true,
    startDate: undefined,
    endDateTime: undefined,
    usageLimit: undefined,
    membershipType: undefined,
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/offer");
      setOffers((response.data as { data: Offer[] }).data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setError("Failed to fetch offers.");
    }
    setLoading(false);
  };

  const fetchMembershipTypes = async () => {
    try {
      const response = await axiosInstance.get("/memberships");
      setMembershipTypes(response.data as MembershipType[]);
    } catch (error) {
      console.error("Error fetching membership types:", error);
    }
  };

  const toggleActive = async (offerId: string, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/offer/${offerId}/toggle-active`, {
        isActive: !currentStatus,
      });
      await fetchOffers();
      setSuccessMessage("Offer status updated successfully!");
    } catch (error) {
      console.error("Error toggling active state:", error);
      setError("Failed to toggle active status.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.code || formData.discountValue === 0) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      formData.category === "time-based" &&
      (!formData.startDate || !formData.endDateTime)
    ) {
      setError("Start date and end date are required for time-based offers.");
      return;
    }

    if (formData.category === "membership-based" && !formData.membershipType) {
      setError("Membership type is required for membership-based offers.");
      return;
    }

    try {
      if (selectedOffer) {
        await axiosInstance.put(`/offer/${selectedOffer._id}`, {
          ...formData,
        });
        setSuccessMessage("Offer updated successfully.");
      } else {
        await axiosInstance.post("/offer", {
          ...formData,
        });
        setSuccessMessage("Offer created successfully.");
      }
      await fetchOffers();
      setIsModalOpen(false);
      setError(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Detailed Error:", error.response?.data);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const openModal = (offer: Offer | null = null) => {
    setSelectedOffer(offer);
    if (offer) {
      setFormData({
        category: offer.category,
        title: offer.title,
        code: offer.code,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        isActive: offer.isActive,
        startDate: offer.startDate,
        endDateTime: offer.endDateTime,
        usageLimit: offer.usageLimit,
        membershipType: offer.membershipType,
      });
    } else {
      setFormData({
        category: "general",
        title: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        isActive: true,
        startDate: undefined,
        endDateTime: undefined,
        usageLimit: undefined,
        membershipType: undefined,
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setSelectedOffer(null);
    setIsModalOpen(false);
    setError(null);
  };

  useEffect(() => {
    fetchOffers();
    fetchMembershipTypes();
  }, []);

  return {
    offers,
    loading,
    error,
    membershipTypes,
    successMessage,
    isModalOpen,
    selectedOffer,
    formData,
    setSuccessMessage,
    setError,
    fetchOffers,
    toggleActive,
    handleSubmit,
    handleInputChange,
    openModal,
    closeModal,
  };
};

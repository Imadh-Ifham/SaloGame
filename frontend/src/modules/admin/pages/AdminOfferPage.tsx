import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
  Switch,
} from "@headlessui/react";
import axiosInstance from "@/axios.config";
import HomeLayout from "@/modules/users/layout/HomeLayout";

interface Offer {
  _id: string;
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate: string;
  endDateTime: string;
  usageLimit?: number;
  usageCount: number;
}

const AdminOfferPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    isActive: boolean;
    startDate: string;
    endDateTime: string;
    usageLimit?: number;
  }>({
    title: "",
    code: "",
    discountType: "percentage",
    discountValue: 0,
    isActive: true,
    startDate: "",
    endDateTime: "",
    usageLimit: undefined,
  });

  //FUNCTIONS

  //function to fetch offers from the server
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/offer");
      setOffers(response.data.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.title ||
      !formData.code ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDateTime
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDateTime)) {
      setError("End date must be after start date.");
      return;
    }
    try {
      if (selectedOffer) {
        await axiosInstance.put(`/offer/${selectedOffer._id}`, {
          ...formData,
          // Ensure correct field names match backend
          endDate: formData.endDateTime, // Backend expects endDate
        });
      } else {
        await axiosInstance.post("/offer", {
          ...formData,
          endDate: formData.endDateTime, // Backend expects endDate
        });
      }
      fetchOffers();
      closeModal();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Detailed Error:", error.response?.data);
    }
  };

  const openModal = (offer: Offer | null = null) => {
    setSelectedOffer(offer);
    if (offer) {
      setFormData({
        ...offer,
        endDateTime: offer.endDateTime,
      });
    } else {
      setFormData({
        title: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        isActive: true,
        startDate: "",
        endDateTime: "",
        usageLimit: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOffer(null);
    setIsModalOpen(false);
  };

  const toggleActive = async (offerId: string, isActive: boolean) => {
    try {
      console.log("Toggling active status:", { isActive: !isActive });

      const offer = offers.find((offer) => offer._id === offerId);
      if (!offer) throw new Error("Offer not found");

      const payload = {
        ...offer, // Include all fields
        isActive: !isActive, // Update the isActive field
      };

      console.log("Payload sent to API:", payload);

      await axiosInstance.put(`/offer/${offerId}`, payload);
      fetchOffers();
    } catch (error) {
      console.error("Error toggling active state:", error);
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      await axiosInstance.delete(`/offer/${offerId}`);
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-8 my-20">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-press text-primary">Manage Offers</h1>
          <button
            onClick={() => openModal(null)}
            className="mt-2 sm:mt-0 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark"
          >
            Create Offer
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto my-10 font-poppins bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Active</th>
                  <th className="px-4 py-2 text-left font-semibold">Title</th>
                  <th className="px-4 py-2 text-left font-semibold">Code</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Discount
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Dates</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {offers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">
                      <Switch
                        checked={offer.isActive}
                        onChange={() => toggleActive(offer._id, offer.isActive)}
                        className={`${
                          offer.isActive
                            ? "bg-primary"
                            : "bg-gray-200 dark:bg-gray-600"
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span
                          className={`${
                            offer.isActive ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    </td>
                    <td className="px-4 py-2">{offer.title}</td>
                    <td className="px-4 py-2">{offer.code}</td>
                    <td className="px-4 py-2">
                      {offer.discountType === "percentage"
                        ? `${offer.discountValue}%`
                        : `$${offer.discountValue}`}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(offer.startDate).toLocaleDateString()} -{" "}
                      {new Date(offer.endDateTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 flex gap-x-2">
                      <button
                        onClick={() => openModal(offer)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <Transition appear show={isModalOpen} as={React.Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-10 overflow-y-auto"
              onClose={closeModal}
            >
              <div className="min-h-screen px-4 text-center">
                <div className="fixed inset-0 bg-black bg-opacity-50" />

                <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>

                <TransitionChild
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {selectedOffer ? "Edit Offer" : "Create Offer"}
                    </DialogTitle>

                    <form className="mt-4 space-y-4">
                      {/* Form fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Discount Type
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Discount Value
                        </label>
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local" // Changed from date to datetime-local
                          name="endDateTime"
                          value={formData.endDateTime}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Usage Limit
                        </label>
                        <input
                          type="number"
                          name="usageLimit"
                          value={formData.usageLimit}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
                        />
                      </div>
                    </form>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </TransitionChild>
              </div>
            </Dialog>
          </Transition>
        )}
      </div>
    </HomeLayout>
  );
};

export default AdminOfferPage;

import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel?: () => void; 
  initialData?: Partial<EventFormData>;
  
}

interface EventFormData {
  eventName: string;
  category: "team-battle" | "single-battle";
  startDateTime: string;
  endDateTime: string;
  description: string;
  numberOfTeams?: number;
  participationPerTeam?: number;
  image: string;
  totalSpots?: number;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<EventFormData>(
    initialData
      ? {
          eventName: initialData.eventName || "",
          category: initialData.category || "team-battle",
          startDateTime: initialData.startDateTime || "",
          endDateTime: initialData.endDateTime || "",
          description: initialData.description || "",
          numberOfTeams: initialData.numberOfTeams,
          participationPerTeam: initialData.participationPerTeam,
          image: initialData.image || "",
          totalSpots: initialData.totalSpots,
        }
      : {
          eventName: "",
          category: "team-battle",
          startDateTime: "",
          endDateTime: "",
          description: "",
          image: "",
        }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category === "single-battle") {
      if (!formData.eventName || !formData.startDateTime || !formData.endDateTime || 
          !formData.description || !formData.image || !formData.totalSpots) {
        alert("Please fill in all required fields for single battle");
        return;
      }
    } else {
      if (!formData.eventName || !formData.startDateTime || !formData.endDateTime || 
          !formData.description || !formData.image || !formData.numberOfTeams || 
          !formData.participationPerTeam) {
        alert("Please fill in all required fields for team battle");
        return;
      }
    }
    onSubmit(formData);
    navigate("/admin/events"); // Navigate to AdminEventPage after form submission
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(); // Call the provided cancel function
    } else {
      navigate(-1); // Navigate back if no onCancel function is provided
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* Event Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        >
          <option value="team-battle">Team Battle</option>
          <option value="single-battle">Single Battle</option>
        </select>
      </div>

      {/* Start Date & Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Start Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="startDateTime"
          value={formData.startDateTime}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* End Date & Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          End Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="endDateTime"
          value={formData.endDateTime}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* description */}
      <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Description <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
        required
      />
    </div>

      {/* Conditional fields for team-battle */}
      {formData.category === "team-battle" && (
        <>
          {/* Number of Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Number of Teams
            </label>
            <input
              type="number"
              name="numberOfTeams"
              value={formData.numberOfTeams ?? ""}
              onChange={handleChange}
              className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
            />
          </div>

          {/* Participation Per Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Participation Per Team
            </label>
            <input
              type="number"
              name="participationPerTeam"
              value={formData.participationPerTeam ?? ""}
              onChange={handleChange}
              className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
            />
          </div>
        </>
      )}

      {/* Total Spots (only for single-battle) */}
      {formData.category === "single-battle" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Total Spots <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="totalSpots"
            value={formData.totalSpots ?? ""}
            onChange={handleChange}
            className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
            required
          />
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Image URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
          {initialData ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;

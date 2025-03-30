import React, { useState, ChangeEvent, useEffect } from "react";
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

// New interface for form errors
interface FormErrors {
  eventName?: string;
  startDateTime?: string;
  endDateTime?: string;
  description?: string;
  numberOfTeams?: string;
  participationPerTeam?: string;
  image?: string;
  totalSpots?: string;
  dateRange?: string;
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

  // New states for form validation
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate a single field
  const validateField = (name: string, value: any): string | undefined => {
    switch(name) {
      case 'eventName':
        if (!value.trim()) return "Event name is required";
        if (value.trim().length < 3) return "Event name must be at least 3 characters";
        break;
        
      case 'startDateTime':
        if (!value) return "Start date & time is required";
        break;
        
      case 'endDateTime':
        if (!value) return "End date & time is required";
        if (formData.startDateTime && new Date(value) <= new Date(formData.startDateTime)) {
          return "End date must be after start date";
        }
        break;
        
      case 'description':
        if (!value.trim()) return "Description is required";
        if (value.trim().length < 10) return "Description should be at least 10 characters";
        break;
        
      case 'image':
        if (!value.trim()) return "Image URL is required";
        if (!/^https?:\/\/.+/i.test(value)) {
          return "Please enter a valid URL starting with http:// or https://";
        }
        break;
        
      case 'numberOfTeams':
        if (formData.category === 'team-battle') {
          if (value === undefined || value === "") return "Number of teams is required";
          if (Number(value) <= 0) return "Number of teams must be greater than 0";
        }
        break;
        
      case 'participationPerTeam':
        if (formData.category === 'team-battle') {
          if (value === undefined || value === "") return "Participation per team is required";
          if (Number(value) <= 0) return "Participation per team must be greater than 0";
        }
        break;
        
      case 'totalSpots':
        if (formData.category === 'single-battle') {
          if (value === undefined || value === "") return "Total spots is required";
          if (Number(value) <= 0) return "Total spots must be greater than 0";
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    // Special case for dates comparison
    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      if (end <= start) {
        newErrors.dateRange = "End date must be after start date";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Update handleChange to validate as user types
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Mark as touched on change
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Convert number inputs to actual numbers
    if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? undefined : Number(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Update errors for this field
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Re-validate form when category changes
  useEffect(() => {
    // Only validate fields that are touched
    Object.keys(touched).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName as keyof EventFormData]);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    });
  }, [formData.category]);

  // Helper function to determine if field has error
  const hasError = (fieldName: string) => {
    return touched[fieldName] && !!errors[fieldName as keyof FormErrors];
  };

  // Updated handleSubmit with improved validation and type conversion
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allFields = Object.keys(formData);
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(touchedFields);
    
    // Validate all fields before submission
    const isValid = validateForm();
    
    if (isValid) {
      // Process data before submission to ensure number types
      const processedData = {
        ...formData,
        numberOfTeams: formData.numberOfTeams !== undefined ? Number(formData.numberOfTeams) : undefined,
        participationPerTeam: formData.participationPerTeam !== undefined ? Number(formData.participationPerTeam) : undefined,
        totalSpots: formData.totalSpots !== undefined ? Number(formData.totalSpots) : undefined
      };
      
      console.log("Submitting data:", processedData);
      onSubmit(processedData);
      navigate("/admin/events");
    } else {
      console.log("Form validation failed:", errors);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
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
          onBlur={handleBlur}
          className={`block w-full ${hasError('eventName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
          required
        />
        {hasError('eventName') && (
          <p className="mt-1 text-sm text-red-500">{errors.eventName}</p>
        )}
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
          onBlur={handleBlur}
          className={`block w-full ${hasError('startDateTime') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
          required
        />
        {hasError('startDateTime') && (
          <p className="mt-1 text-sm text-red-500">{errors.startDateTime}</p>
        )}
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
          onBlur={handleBlur}
          className={`block w-full ${hasError('endDateTime') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
          required
        />
        {hasError('endDateTime') && (
          <p className="mt-1 text-sm text-red-500">{errors.endDateTime}</p>
        )}
        {errors.dateRange && (
          <p className="mt-1 text-sm text-red-500">{errors.dateRange}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`block w-full ${hasError('description') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
          required
        />
        {hasError('description') && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Conditional fields for team-battle */}
      {formData.category === "team-battle" && (
        <>
          {/* Number of Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Number of Teams <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="numberOfTeams"
              value={formData.numberOfTeams ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              className={`block w-full ${hasError('numberOfTeams') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
              required
            />
            {hasError('numberOfTeams') && (
              <p className="mt-1 text-sm text-red-500">{errors.numberOfTeams}</p>
            )}
          </div>

          {/* Participation Per Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Participation Per Team <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="participationPerTeam"
              value={formData.participationPerTeam ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              className={`block w-full ${hasError('participationPerTeam') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
              required
            />
            {hasError('participationPerTeam') && (
              <p className="mt-1 text-sm text-red-500">{errors.participationPerTeam}</p>
            )}
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
            onBlur={handleBlur}
            min="1"
            className={`block w-full ${hasError('totalSpots') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
            required
          />
          {hasError('totalSpots') && (
            <p className="mt-1 text-sm text-red-500">{errors.totalSpots}</p>
          )}
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
          onBlur={handleBlur}
          className={`block w-full ${hasError('image') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md dark:bg-gray-700 dark:text-gray-200 shadow-sm`}
          required
        />
        {hasError('image') && (
          <p className="mt-1 text-sm text-red-500">{errors.image}</p>
        )}
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
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
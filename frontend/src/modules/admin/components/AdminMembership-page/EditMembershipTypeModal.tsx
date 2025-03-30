import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface MembershipType {
  _id?: string;
  name: string;
  tagline: string;
  price: number;
  xpRate: number;
  benefits: string[];
  isActive: boolean;
}

interface EditMembershipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<MembershipType>) => Promise<void>;
  membershipType?: MembershipType;
}

// Custom validation hook
const useFormValidation = (formData: MembershipType) => {
  const validations = useMemo(() => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Membership name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Name must be at least 3 characters long";
    }

    // Tagline validation
    if (formData.tagline && formData.tagline.length > 100) {
      errors.tagline = "Tagline must be 100 characters or less";
    }

    // Price validation
    if (formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    // XP Rate validation
    if (formData.xpRate < 0) {
      errors.xpRate = "XP Rate cannot be negative";
    } else if (formData.xpRate > 5000) {
      errors.xpRate = "XP Rate cannot be greater than 5000";
    }

    // Benefits validation
    const invalidBenefits = formData.benefits.filter(
      (benefit) => !benefit.trim()
    );
    if (invalidBenefits.length > 0) {
      errors.benefits = "All benefits must have content";
    }

    return errors;
  }, [formData]);

  const isFormValid = Object.keys(validations).length === 0;

  return { errors: validations, isFormValid };
};

export default function EditMembershipTypeModal({
  isOpen,
  onClose,
  onSave,
  membershipType,
}: EditMembershipTypeModalProps) {
  const [formData, setFormData] = useState<MembershipType>({
    name: "",
    tagline: "",
    price: 0,
    xpRate: 0,
    benefits: [""],
    isActive: true,
  });
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);

  // Validation hook
  const { errors, isFormValid } = useFormValidation(formData);

  useEffect(() => {
    if (membershipType) {
      setFormData(membershipType);
    } else {
      setFormData({
        name: "",
        tagline: "",
        price: 0,
        xpRate: 0,
        benefits: [""],
        isActive: true,
      });
    }
    // Reset touched fields when modal opens/closes
    setTouchedFields({});
  }, [membershipType, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Handle different input types appropriately
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData((prev) => ({ ...prev, benefits: newBenefits }));

    // Mark benefits as touched
    setTouchedFields((prev) => ({ ...prev, benefits: true }));
  };

  const addBenefit = () => {
    setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, ""] }));
  };

  const removeBenefit = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, benefits: newBenefits }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouchedFields(
      Object.keys(formData).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        {}
      )
    );

    if (!isFormValid) return;

    onSave(formData).catch((err) => {
      setError(err.response?.data?.message || "Failed to save membership");
    });
  };

  const renderFieldError = (fieldName: string) => {
    // Only show error if field has been touched and has an error
    if (touchedFields[fieldName] && errors[fieldName]) {
      return (
        <div className="text-xs text-red-600 mt-1 flex items-center">
          <FaExclamationCircle className="mr-1" />
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {membershipType?._id ? "Edit" : "Add"} Gaming Tier
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  touchedFields.name && !errors.name
                    ? "border-green-500"
                    : touchedFields.name && errors.name
                    ? "border-red-500"
                    : "dark:border-gray-600"
                }`}
                required
              />
              {touchedFields.name && !errors.name && (
                <FaCheckCircle className="absolute right-3 top-3 text-green-500" />
              )}
            </div>
            {renderFieldError("name")}
          </div>

          {/* Tagline */}
          <div>
            <label
              htmlFor="tagline"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Tagline
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                (Optional, max 100 characters)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                maxLength={100}
                className={`w-full p-2 border rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  touchedFields.tagline && !errors.tagline
                    ? "border-green-500"
                    : touchedFields.tagline && errors.tagline
                    ? "border-red-500"
                    : "dark:border-gray-600"
                }`}
                placeholder="A short description of this membership"
              />
              {touchedFields.tagline && !errors.tagline && formData.tagline && (
                <FaCheckCircle className="absolute right-3 top-3 text-green-500" />
              )}
            </div>
            {renderFieldError("tagline")}
            <div className="text-xs text-gray-500 mt-1">
              {formData.tagline.length}/100 characters
            </div>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Price (LKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full p-2 border rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  touchedFields.price && !errors.price
                    ? "border-green-500"
                    : touchedFields.price && errors.price
                    ? "border-red-500"
                    : "dark:border-gray-600"
                }`}
                min="0"
                step="100"
                required
              />
              {touchedFields.price && !errors.price && (
                <FaCheckCircle className="absolute right-3 top-3 text-green-500" />
              )}
            </div>
            {renderFieldError("price")}
          </div>

          {/* XP Rate */}
          <div>
            <label
              htmlFor="xpRate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Monthly XP Points
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                (In-app currency allocated monthly)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="xpRate"
                name="xpRate"
                value={formData.xpRate}
                onChange={handleChange}
                className={`w-full p-2 border rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  touchedFields.xpRate && !errors.xpRate
                    ? "border-green-500"
                    : touchedFields.xpRate && errors.xpRate
                    ? "border-red-500"
                    : "dark:border-gray-600"
                }`}
                min="0"
                max="5000"
                step="50"
              />
              {touchedFields.xpRate && !errors.xpRate && (
                <FaCheckCircle className="absolute right-3 top-3 text-green-500" />
              )}
            </div>
            {renderFieldError("xpRate")}
            <div className="text-xs text-gray-500 mt-1">
              Recommended range: 100-1000 XP points per month
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Benefits
            </label>
            <div className="space-y-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    className={`flex-grow p-2 border rounded-l shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      touchedFields.benefits && !errors.benefits
                        ? "border-green-500"
                        : touchedFields.benefits && errors.benefits
                        ? "border-red-500"
                        : "dark:border-gray-600"
                    }`}
                    placeholder="e.g., 50 hours gaming time"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 rounded-r transition-colors"
                    disabled={formData.benefits.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {renderFieldError("benefits")}
            <button
              type="button"
              onClick={addBenefit}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors"
            >
              Add Benefit
            </button>
          </div>

          {/* Global Error */}
          {error && (
            <div className="p-2 text-sm text-red-800 bg-red-100 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {membershipType ? "Save Changes" : "Create Membership"}
          </button>
        </form>
      </div>
    </div>
  );
}

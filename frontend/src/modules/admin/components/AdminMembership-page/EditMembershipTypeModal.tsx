import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

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

  useEffect(() => {
    if (membershipType) {
      // Populate formData with the existing membership data for editing
      setFormData(membershipType);
    } else {
      // Reset formData to default values for adding a new membership
      setFormData({
        name: "",
        tagline: "",
        price: 0,
        xpRate: 0,
        benefits: [""],
        isActive: true,
      });
    }
  }, [membershipType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

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
    onSave(formData);
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
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Tagline */}
          <div>
            <label
              htmlFor="tagline"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full p-2 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="A short description of this membership"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Price (LKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="0"
              step="100"
              required
            />
          </div>

          {/* XP Rate */}
          <div>
            <label
              htmlFor="xpRate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              XP Rate
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                (XP earned per LKR1000 spent)
              </span>
            </label>
            <input
              type="number"
              id="xpRate"
              name="xpRate"
              value={formData.xpRate}
              onChange={handleChange}
              className="w-full p-2 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="0"
              step="1"
            />
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
                    className="flex-grow p-2 border dark:border-gray-600 rounded-l shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <button
              type="button"
              onClick={addBenefit}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors"
            >
              Add Benefit
            </button>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
            >
              Active
            </label>
          </div>

          {/* Submit Button */}

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {membershipType ? "Save Changes" : "Create Membership"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface MembershipType {
  id: number;
  name: string;
  price: string;
  duration: string;
  benefits: string[];
  tagline: string;
  status: "Active" | "Inactive";
}

interface EditMembershipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    formData: Partial<MembershipType & { price: string | number }>
  ) => Promise<void>;
  membershipType?: MembershipType;
}

export default function EditMembershipTypeModal({
  isOpen,
  onClose,
  onSave,
  membershipType,
}: EditMembershipTypeModalProps) {
  const [formData, setFormData] = useState<MembershipType>({
    id: 0,
    name: "",
    price: "",
    duration: "",
    benefits: [""],
    tagline: "",
    status: "Active",
  });

  useEffect(() => {
    if (membershipType) {
      setFormData(membershipType);
    }
  }, [membershipType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {membershipType ? "Edit" : "Add"} Membership Type
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="tagline"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits
            </label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  className="flex-grow p-2 border rounded-l"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="bg-red-500 text-white px-2 rounded-r"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBenefit}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Benefit
            </button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {membershipType ? "Save Changes" : "Add Membership Type"}
          </button>
        </form>
      </div>
    </div>
  );
}

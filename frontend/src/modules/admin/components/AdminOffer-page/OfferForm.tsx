import React from "react";
import { OfferFormProps } from "../../../../types/offer";

const OfferForm: React.FC<OfferFormProps> = ({
  formData,
  membershipTypes,
  handleInputChange,
  error,
}) => {
  return (
    <form className="mt-4 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* Discount Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Discount Type <span className="text-red-500">*</span>
        </label>
        <select
          name="discountType"
          value={formData.discountType}
          onChange={handleInputChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>

      {/* Discount Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Discount Value <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="discountValue"
          value={formData.discountValue}
          onChange={handleInputChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
          min="0"
          step="0.01"
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
          min={new Date().toISOString().slice(0, 16)}
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
          onChange={handleInputChange}
          min={new Date().toISOString().slice(0, 16)}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        />
      </div>

      {/* Usage Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Usage Limit
        </label>
        <input
          type="number"
          name="usageLimit"
          value={formData.usageLimit ?? ""}
          onChange={handleInputChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          min="0"
        />
      </div>

      {/* MembershipType */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Membership Type <span className="text-red-500">*</span>
        </label>
        <select
          name="membershipType"
          value={formData.membershipType}
          onChange={handleInputChange}
          className="block w-full border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm"
          required
        >
          <option value="">Select Membership Type</option>
          {membershipTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Display error if any */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default OfferForm;

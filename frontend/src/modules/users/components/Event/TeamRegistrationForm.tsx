import React, { useState, useEffect } from "react";
import axiosInstance from "@/axios.config";
import Modal from "@/components/Modal";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  username: string;
}

interface TeamRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Validation helper functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone);
};

const TeamRegistrationForm: React.FC<TeamRegistrationFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    teamName: "",
    teamLeaderEmail: "",
    contactNumber: "",
    teamLogo: null as File | null,
  });

  const [memberEmails, setMemberEmails] = useState<string[]>([""]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<{
    show: boolean;
    teamId: string;
  } | null>(null);

  // Add validation states
  const [errors, setErrors] = useState({
    teamName: "",
    teamLeaderEmail: "",
    contactNumber: "",
    teamLogo: "",
    memberEmails: [""],
  });

  // Track which fields have been touched
  const [touched, setTouched] = useState({
    teamName: false,
    teamLeaderEmail: false,
    contactNumber: false,
    teamLogo: false,
    memberEmails: [false],
  });

  // Add member email field
  const addMemberEmail = () => {
    setMemberEmails([...memberEmails, ""]);
    setErrors((prev) => ({
      ...prev,
      memberEmails: [...prev.memberEmails, ""],
    }));
    setTouched((prev) => ({
      ...prev,
      memberEmails: [...prev.memberEmails, false],
    }));
  };

  // Remove member email field
  const removeMemberEmail = (index: number) => {
    const newEmails = memberEmails.filter((_, i) => i !== index);
    setMemberEmails(newEmails);

    const newErrors = [...errors.memberEmails];
    newErrors.splice(index, 1);
    setErrors((prev) => ({
      ...prev,
      memberEmails: newErrors,
    }));

    const newTouched = [...touched.memberEmails];
    newTouched.splice(index, 1);
    setTouched((prev) => ({
      ...prev,
      memberEmails: newTouched,
    }));
  };

  // Validate single field
  const validateField = (name: string, value: string, index?: number) => {
    if (name === "teamName") {
      if (!value.trim()) return "Team name is required";
      if (value.length < 3) return "Team name must be at least 3 characters";
      if (value.length > 50) return "Team name must be less than 50 characters";
      return "";
    }

    if (name === "teamLeaderEmail") {
      if (!value.trim()) return "Team leader email is required";
      if (!validateEmail(value)) return "Please enter a valid email address";
      return "";
    }

    if (name === "contactNumber") {
      if (!value.trim()) return "Contact number is required";
      if (!validatePhone(value))
        return "Please enter a valid 10-digit phone number";
      return "";
    }

    if (name === "memberEmail") {
      if (!value.trim()) return "Member email is required";
      if (!validateEmail(value)) return "Please enter a valid email address";
      return "";
    }

    return "";
  };

  // Handle field blur
  const handleBlur = (field: string, index?: number) => {
    if (field === "memberEmail" && index !== undefined) {
      const newTouched = [...touched.memberEmails];
      newTouched[index] = true;
      setTouched((prev) => ({
        ...prev,
        memberEmails: newTouched,
      }));

      const error = validateField(field, memberEmails[index]);
      const newErrors = [...errors.memberEmails];
      newErrors[index] = error;
      setErrors((prev) => ({
        ...prev,
        memberEmails: newErrors,
      }));
    } else {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      const error = validateField(
        field,
        formData[field as keyof typeof formData] as string
      );
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  // Form validation
  const isFormValid = () => {
    // Check each field's validation
    const teamNameValid = !errors.teamName;
    const leaderEmailValid = !errors.teamLeaderEmail;
    const contactValid = !errors.contactNumber;

    // Check member emails validity
    const memberEmailsValid =
      errors.memberEmails.every((err) => !err) &&
      memberEmails.filter((email) => email.trim() !== "").length > 0;

    return (
      teamNameValid && leaderEmailValid && contactValid && memberEmailsValid
    );
  };

  // Modify the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      teamName: true,
      teamLeaderEmail: true,
      contactNumber: true,
      teamLogo: true,
      memberEmails: memberEmails.map(() => true),
    });

    // Validate all fields
    const nameError = validateField("teamName", formData.teamName);
    const leaderError = validateField(
      "teamLeaderEmail",
      formData.teamLeaderEmail
    );
    const contactError = validateField("contactNumber", formData.contactNumber);
    const memberErrors = memberEmails.map((email) =>
      validateField("memberEmail", email)
    );

    setErrors({
      teamName: nameError,
      teamLeaderEmail: leaderError,
      contactNumber: contactError,
      teamLogo: "",
      memberEmails: memberErrors,
    });

    // If there are errors, stop submission
    if (
      nameError ||
      leaderError ||
      contactError ||
      memberErrors.some((err) => err)
    ) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setError("");

    // Validate member emails
    const validEmails = memberEmails.filter((email) => email.trim() !== "");
    if (validEmails.length === 0) {
      setError("Please add at least one team member");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("teamName", formData.teamName);
      formDataToSend.append("teamLeaderEmail", formData.teamLeaderEmail);
      formDataToSend.append("contactNumber", formData.contactNumber);

      // Make sure memberEmails is properly sent as a single field
      formDataToSend.append("memberEmails", JSON.stringify(validEmails));
      // Only append the logo if it exists
      if (formData.teamLogo) {
        formDataToSend.append("teamLogo", formData.teamLogo);
      }

      try {
        const response = await axiosInstance.post(
          "/teams/register",
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.data.success) {
          setSuccessMessage({
            show: true,
            teamId: response.data.data.teamId,
          });

          toast.success(
            "Team created! Members will receive verification emails."
          );
          setTimeout(() => {
            setSuccessMessage(null);
            onClose();
          }, 5000);
        } else {
          throw new Error(
            response.data.message || "Unexpected response from server"
          );
        }
      } catch (err: any) {
        console.error("Error creating team:", err);

        // Enhanced error handling with more specific messages
        if (err.response?.status === 500) {
          const serverError =
            err.response?.data?.error || err.response?.data?.message;
          if (serverError?.includes("SENDGRID")) {
            setError(
              "Server email service issue. Team created but verification emails could not be sent."
            );
          } else if (serverError?.includes("memberEmails")) {
            setError(
              "Invalid member email format. Please check all emails and try again."
            );
          } else {
            setError(
              `Server error: ${serverError || "Unknown internal error"}`
            );
          }
        } else {
          setError(err.response?.data?.message || "Failed to create team");
        }
      } finally {
        setLoading(false);
      }
    } catch (clientErr) {
      console.error("Client-side error:", clientErr);
      setError("Failed to prepare form data. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <div className="mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, teamName: e.target.value }));
                if (touched.teamName) {
                  const error = validateField("teamName", e.target.value);
                  setErrors((prev) => ({ ...prev, teamName: error }));
                }
              }}
              onBlur={() => handleBlur("teamName")}
              className={`w-full border ${
                errors.teamName && touched.teamName
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white`}
              placeholder="Team Name"
              required
            />
            {errors.teamName && touched.teamName && (
              <p className="mt-1 text-sm text-red-500">{errors.teamName}</p>
            )}
          </div>

          {/* Team Leader Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Leader Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.teamLeaderEmail}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  teamLeaderEmail: e.target.value,
                }));
                if (touched.teamLeaderEmail) {
                  const error = validateField(
                    "teamLeaderEmail",
                    e.target.value
                  );
                  setErrors((prev) => ({ ...prev, teamLeaderEmail: error }));
                }
              }}
              onBlur={() => handleBlur("teamLeaderEmail")}
              className={`w-full border ${
                errors.teamLeaderEmail && touched.teamLeaderEmail
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white`}
              placeholder="Team Leader Email"
              required
            />
            {errors.teamLeaderEmail && touched.teamLeaderEmail && (
              <p className="mt-1 text-sm text-red-500">
                {errors.teamLeaderEmail}
              </p>
            )}
          </div>

          {/* Member Emails */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Members <span className="text-red-500">*</span>
            </label>
            {memberEmails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...memberEmails];
                      newEmails[index] = e.target.value;
                      setMemberEmails(newEmails);

                      if (touched.memberEmails[index]) {
                        const error = validateField(
                          "memberEmail",
                          e.target.value
                        );
                        const newErrors = [...errors.memberEmails];
                        newErrors[index] = error;
                        setErrors((prev) => ({
                          ...prev,
                          memberEmails: newErrors,
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("memberEmail", index)}
                    className={`w-full p-2 border rounded-md ${
                      errors.memberEmails[index] && touched.memberEmails[index]
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } 
                            bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            placeholder-gray-500 dark:placeholder-gray-400`}
                    placeholder="Member email"
                    required
                  />
                  {errors.memberEmails[index] &&
                    touched.memberEmails[index] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.memberEmails[index]}
                      </p>
                    )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMemberEmail(index)}
                  className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMemberEmail}
              className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              + Add Member
            </button>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  contactNumber: e.target.value,
                }));
                if (touched.contactNumber) {
                  const error = validateField("contactNumber", e.target.value);
                  setErrors((prev) => ({ ...prev, contactNumber: error }));
                }
              }}
              onBlur={() => handleBlur("contactNumber")}
              className={`w-full border ${
                errors.contactNumber && touched.contactNumber
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white`}
              placeholder="Contact Number (10 digits)"
              required
            />
            {errors.contactNumber && touched.contactNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* Team Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData((prev) => ({ ...prev, teamLogo: file }));
                }
              }}
              className="w-full border border-gray-300 dark:border-gray-600 
                      rounded-md shadow-sm p-2 
                      bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      dark:file:bg-blue-900 dark:file:text-blue-200
                      hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
            />
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md 
                          transform transition-all duration-500 ease 
                          animate-[fadeIn_0.5s_ease-in]"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium">Team created successfully!</p>
                  <p className="text-sm mt-1">
                    Team ID: {successMessage.teamId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                loading || !isFormValid()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TeamRegistrationForm;

import { ReactNode } from "react";

export interface Offer {
  description: ReactNode;
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
  membershipType: string;
}

export interface MembershipType {
  _id: string;
  name: string;
}

export interface FormData {
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  startDate: string;
  endDateTime: string;
  usageLimit?: number;
  membershipType: string;
}

export interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export interface OfferFormProps {
  formData: FormData;
  membershipTypes: MembershipType[];
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  error: string | null;
}

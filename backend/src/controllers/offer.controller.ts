import { Request, Response } from "express";
import Offer from "../models/offer.model";

/**
 * Get all offers (with optional isActive filter)
 */
export const getAllOffers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { isActive } = req.query;
    const filter: { isActive?: boolean; endDateTime?: { $gte: Date } } = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const offers = await Offer.find(filter);
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching offers",
      error: (error as Error).message,
    });
  }
};

/**
 * Get an offer by ID
 */
export const getOfferById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { offerID } = req.params;
    const offer = await Offer.findById(offerID);

    if (!offer) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching the offer",
      error: (error as Error).message,
    });
  }
};

/**
 * Create a new offer
 */
export const createOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      code,
      discountType,
      discountValue,
      category,
      startDate,
      endDateTime,
      membershipType,
      usageLimit,
    } = req.body;

    if (!title || !code || !discountType || !discountValue || !category) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    if (
      (category === "time-based" || category === "exclusive") &&
      (!startDate || !endDateTime)
    ) {
      res.status(400).json({
        success: false,
        message: "Start date and end date are required for time-based offers",
      });
      return;
    }

    if (
      (category === "membership-based" || category === "exclusive") &&
      !membershipType
    ) {
      res.status(400).json({
        success: false,
        message: "Membership type is required for membership-based offers",
      });
      return;
    }

    const offer = new Offer({
      title,
      code,
      discountType,
      discountValue,
      category,
      startDate,
      endDateTime,
      membershipType,
      usageLimit: usageLimit || null,
    });
    await offer.save();
    res.status(201).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an offer
 */
export const updateOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { offerID } = req.params;
    const updateFields = req.body;

    if (!Object.keys(updateFields).length) {
      res
        .status(400)
        .json({ success: false, message: "No fields provided for update" });
      return;
    }

    if (updateFields.startDate || updateFields.endDateTime) {
      const currentDate = new Date();
      const offerStartDate = new Date(updateFields.startDate || "");
      const offerEndDate = new Date(updateFields.endDateTime || "");

      if (offerStartDate < currentDate) {
        res.status(400).json({
          success: false,
          message: "Start date cannot be in the past",
        });
        return;
      }

      if (offerEndDate <= offerStartDate) {
        res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
        return;
      }
    }

    const updatedOffer = await Offer.findByIdAndUpdate(offerID, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!updatedOffer) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedOffer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating the offer",
      error: (error as Error).message,
    });
  }
};

/**
 * Delete an offer
 */
export const deleteOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { offerID } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(offerID);

    if (!deletedOffer) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting the offer",
      error: (error as Error).message,
    });
  }
};

/**
 * Validate and apply an offer
 */
export const validateOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;
    const currentDate = new Date();
    const offer = await Offer.findOne({
      code,
      isActive: true,
      startDate: { $lte: currentDate },
      endDateTime: { $gte: currentDate },
    });

    if (!offer) {
      res
        .status(404)
        .json({ success: false, message: "Invalid or expired offer" });
      return;
    }

    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      res
        .status(400)
        .json({ success: false, message: "Offer usage limit exceeded" });
      return;
    }

    offer.usageCount += 1;
    await offer.save();
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating the offer",
      error: (error as Error).message,
    });
  }
};

/**
 * Toggle offer active status
 */
export const toggleActiveOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { offerID } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });
      return;
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerID,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!updatedOffer) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedOffer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling offer status",
      error: (error as Error).message,
    });
  }
};

/**
 * Get offers by category
 */
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get unique categories from the Offer model
    const uniqueCategories = await Offer.distinct("category");

    res.status(200).json({
      success: true,
      categories: uniqueCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

import { Request, Response } from "express";
import Offer from "../models/offer.model";

// Get all offers (with optional isActive filter)
export const getAllOffers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { isActive } = req.query;

    // Build the filter dynamically
    const filter: { isActive?: boolean; endDateTime?: { $gte: Date } } = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true"; // Convert string to boolean
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

// Get an offer by ID
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

// Create a new offer
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
      startDate,
      endDateTime,
      usageLimit,
      membershipType,
    } = req.body;

    /*
      SERVER SIDE VALIDATION
    */

    // Validate required fields
    if (
      !title ||
      !code ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDateTime ||
      !membershipType
    ) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    // Date validation
    const currentDate = new Date();
    const offerStartDate = new Date(startDate);
    const offerEndDate = new Date(endDateTime);

    // Remove milliseconds for accurate comparison
    currentDate.setMilliseconds(0);
    offerStartDate.setMilliseconds(0);
    offerEndDate.setMilliseconds(0);

    // Validate start date is not in the past
    if (offerStartDate < currentDate) {
      res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
      return;
    }

    // Validate end date is after start date
    if (offerEndDate <= offerStartDate) {
      res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
      return;
    }

    //new offer
    const newOffer = new Offer({
      title,
      code,
      discountType,
      discountValue,
      startDate,
      endDateTime,
      usageLimit,
      membershipType,
    });

    const savedOffer = await newOffer.save();
    res.status(201).json({ success: true, data: savedOffer });
  } catch (error) {
    if ((error as any).code === 11000) {
      res
        .status(400)
        .json({ success: false, message: "Offer code must be unique" });
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating the offer",
        error: (error as Error).message,
      });
    }
  }
};

// Update an offer
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

    /*
      SERVER SIDE VALIDATION
     */

    // Date validation if dates are being updated
    if (updateFields.startDate || updateFields.endDateTime) {
      const currentDate = new Date();
      const offerStartDate = new Date(updateFields.startDate || "");
      const offerEndDate = new Date(updateFields.endDateTime || "");

      currentDate.setMilliseconds(0);
      offerStartDate.setMilliseconds(0);
      offerEndDate.setMilliseconds(0);

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
      new: true, // Return the updated document
      runValidators: true, // Validate updated fields
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

// Delete an offer
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

// Validate and apply an offer
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

// Toggle offer active status
export const toggleActiveOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { offerID } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
      return;
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerID,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedOffer) {
      res.status(404).json({
        success: false,
        message: "Offer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedOffer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling offer status",
      error: (error as Error).message,
    });
  }
};

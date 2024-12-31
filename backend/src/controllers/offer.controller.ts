import { Request, Response } from "express";
import Offer from "../models/offer.model";

// Get all offers (with optional isActive filter)
export const getAllOffers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract the isActive query parameter from the request
    const { isActive } = req.query;

    // Build the filter dynamically
    const filter: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true"; // Convert string to boolean
    }

    // Fetch offers based on the filter
    const offers = await Offer.find(filter);

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Get an offer by ID
export const getOfferById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { offerID } = req.params;

  try {
    const offer = await Offer.findById(offerID);

    if (!offer) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Create a new offer
export const createOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    isActive,
    code,
    discountType,
    discountValue,
    startDate,
    endDateTime,
    usageLimit,
  } = req.body;

  try {
    if (
      !title ||
      !code ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDateTime
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    const newOffer = new Offer({
      title,
      isActive,
      code,
      discountType,
      discountValue,
      startDate,
      endDateTime,
      usageLimit,
    });

    const savedOffer = await newOffer.save();
    res.status(201).json({ success: true, data: savedOffer });
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: "Offer code already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Update an offer
export const updateOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { offerID } = req.params;
  const updateFields = req.body; // Accept all fields from the request body

  try {
    if (!Object.keys(updateFields).length) {
      res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
      return;
    }

    // Update the offer with the provided fields
    const updatedOffer = await Offer.findByIdAndUpdate(offerID, updateFields, {
      new: true, // Return the updated document
      runValidators: true, // Ensure the fields are validated
    });

    if (!updatedOffer) {
      res.status(404).json({ success: false, message: "Offer not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedOffer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Delete an offer
export const deleteOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { offerID } = req.params;

  try {
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
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

// Validate and apply an offer
export const validateOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.body;
  const currentDate = new Date();

  try {
    const offer = await Offer.findOne({
      code,
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    if (!offer) {
      res
        .status(404)
        .json({ success: false, message: "Invalid or expired offer" });
      return;
    }

    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      res.status(400).json({
        success: false,
        message: "Offer usage limit exceeded",
      });
      return;
    }

    offer.usageCount += 1;
    await offer.save();

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: (error as Error).message,
    });
  }
};

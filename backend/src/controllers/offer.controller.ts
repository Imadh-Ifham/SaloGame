import { Request, Response, NextFunction } from "express";
import Offer from "../models/offer.model"; // Import the Offer model

//Get all offers
export const getOffers = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

//Create a new offer
export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

//Update an offer
export const updateOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!offer) {
      res.status(404).json({
        success: false,
        message: "Offer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

//Delete an offer
export const deleteOffer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(id);

    if (!deletedOffer) {
      res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

/*export const validateOffer = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const currentDate = new Date();

    const offer = await Offer.findOne({
      code,
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired offer" });
    }

    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "Offer usage limit exceeded" });
    }

    offer.usageCount += 1;
    await offer.save();

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};*/

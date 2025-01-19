import { Request, Response, NextFunction } from "express";

export const validateOfferData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { category, startDate, endDateTime, membershipType } = req.body;

  // Validate dates for time-based and exclusive offers
  if (category === "time-based" || category === "exclusive") {
    const start = new Date(startDate);
    const end = new Date(endDateTime);
    const now = new Date();

    if (start < now) {
      res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
    }

    if (end <= start) {
      res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }
  }

  next();
};

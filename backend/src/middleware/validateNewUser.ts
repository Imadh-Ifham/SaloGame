import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

// Validation Middleware for Creating User
export const validateNewUser = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  // Add more validations as needed
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ message: "Validation errors", errors: errors.array() });
      return;
    }
    next();
  },
];

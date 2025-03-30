import { NextFunction, Request, Response } from "express";
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}
import MembershipType from "../models/membershipType.model";
import mongoose from "mongoose";
import Subscription from "../models/subscription.model"; // Ensure the correct path to the Subscription model

/**
 * Get all memberships with an optional isActive filter.
 */
export const getMemberships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActive } = req.query;

    const filter: any = {};
    if (isActive === "true") {
      filter.isActive = true;
    } else if (isActive === "false") {
      filter.isActive = false;
    }

    const memberships = await MembershipType.find(filter);
    res.json(memberships);
  } catch (error) {
    console.error("Error fetching memberships:", error);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

/**
 * Get a single membership by its ID.
 */
export const getMembershipById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membership = await MembershipType.findById(req.params.id);
    if (!membership) {
      res.status(404).json({ error: "MembershipType not found" });
      return;
    }
    res.json(membership);
  } catch (error) {
    console.error("Error fetching membership by ID:", error);
    res.status(500).json({ error: "Failed to fetch MembershipType" });
  }
};

/**
 * Create a new membership.
 */
export const createMembership = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.body.name || typeof req.body.name !== "string") {
      res.status(400).json({ success: false, message: "Name is required" });
      return;
    }

    if (isNaN(req.body.price) || req.body.price < 0) {
      res
        .status(400)
        .json({ success: false, message: "Price must be a positive number" });
      return;
    }

    if (!Array.isArray(req.body.benefits) || req.body.benefits.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "At least one benefit is required" });
      return;
    }

    const membership = new MembershipType(req.body);
    const savedMembership = await membership.save();
    res.status(201).json(savedMembership);
  } catch (error) {
    console.error("Error creating membership:", error);
    res.status(500).json({ error: "Failed to create MembershipType" });
  }
};

/**
 * Update an existing membership by its ID.
 */
export const updateMembership = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: membershipID } = req.params;
    const updateFields = req.body;

    if (!Object.keys(updateFields).length) {
      res
        .status(400)
        .json({ success: false, message: "No fields provided for update" });
      return;
    }

    const updatedMembership = await MembershipType.findByIdAndUpdate(
      membershipID,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMembership) {
      res.status(404).json({ success: false, message: "Membership not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedMembership });
  } catch (error) {
    console.error("Error updating membership:", error);
    res.status(500).json({
      success: false,
      message: "Error updating the membership",
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a membership by its ID.
 
export const deleteMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membership = await MembershipType.findByIdAndDelete(req.params.id);
    if (!membership) {
      res.status(404).json({ error: "MembershipType not found" });
      return;
    }
    res.json({ message: "MembershipType deleted successfully" });
  } catch (error) {
    console.error("Error deleting membership:", error);
    res.status(500).json({ error: "Failed to delete membership" });
  }
};*/

/**
 * Deprecate a membership plan by its ID.(SOFT DELETE)
 */
export const deprecateMembershipPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { migrationPlanId, disableAutoRenewal = true } = req.body;

    // 1. Mark the plan as inactive
    const updatedMembership = await MembershipType.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true, session }
    );

    if (!updatedMembership) {
      res.status(404).json({ error: "Membership plan Not found" });
      await session.abortTransaction();
      return;
    }

    // 2. Handle auto renewal users if any
    if (disableAutoRenewal) {
      await Subscription.updateMany(
        {
          membershipId: id,
          status: "active",
          autoRenew: true,
        },
        {
          autoRenew: false,
          // Add an internal note about why auto-renewal was disabled
          $set: {
            "metadata.autoRenewDisabledReason": "Plan deprecated by admin",
            "metadata.autoRenewDisabledDate": new Date(),
          },
        },
        { session }
      );
    }

    // 3. If migration plan is provided, set up migration path for users
    if (migrationPlanId) {
      await Subscription.updateMany(
        { membershipId: id, status: "active" },
        {
          $set: {
            "metadata.migrationPlanId": migrationPlanId,
            "metadata.originalPlanId": id,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    res.json(updatedMembership);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deprecating membership plan:", error);
    res.status(500).json({ error: "Failed to deprecate membership plan" });
  } finally {
    session.endSession();
  }
};

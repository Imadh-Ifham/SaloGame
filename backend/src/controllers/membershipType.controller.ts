import { NextFunction, Request, Response } from "express";
import MembershipType from "../models/membershipType.model";

/**
 * Get all memberships with an optional isActive filter.
 */
export const getMemberships = async (
  req: Request,
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
  req: Request,
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
 */
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
};

/**
 * Toggle the active status of a membership by its ID.
 */
export const toggleActiveMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      res.status(400).json({ error: "isActive must be a boolean." });
      return;
    }

    const updatedMembership = await MembershipType.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedMembership) {
      res.status(404).json({ error: "MembershipType not found." });
      return;
    }

    res.json(updatedMembership);
  } catch (error) {
    console.error("Error toggling active status:", error);
    res.status(500).json({ error: "Failed to toggle active status." });
  }
};

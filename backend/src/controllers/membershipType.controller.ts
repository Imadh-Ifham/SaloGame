import { NextFunction, Request, Response } from "express";
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}
import MembershipType from "../models/membershipType.model";
import User from "../models/user.model";
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
 * Get Current user's membership information
 */
export const getCurrentMembership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user exists in request
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Find user and populate membership data
    const user = await User.findById(req.user.id)
      .populate({
        path: "defaultMembershipId",
        select: "_id name price benefits tagline isActive",
      })
      .lean(); // Use lean() for better performance

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // If user has no membership, return Basic Warrior as default
    if (!user.defaultMembershipId) {
      const basicMembership = await MembershipType.findOne({
        name: "Basic Warrior",
      })
        .select("_id name price benefits tagline isActive")
        .lean();

      if (!basicMembership) {
        res.status(404).json({
          success: false,
          message: "Default membership not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: basicMembership,
      });
      return;
    }

    // Return user's current membership
    res.status(200).json({
      success: true,
      data: user.defaultMembershipId,
    });
  } catch (error) {
    console.error("Error fetching current membership:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current membership",
      error: error instanceof Error ? error.message : "Unknown error",
    });
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

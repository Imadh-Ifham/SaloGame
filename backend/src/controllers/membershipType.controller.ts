import { NextFunction, Request, Response } from "express";
import MembershipType from "../models/membershipType.model";

export const getMemberships = async (req: Request, res: Response) => {
  try {
    // Retrieve the `isActive` filter from the query parameters
    const { isActive } = req.query;

    // Build the filter condition
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true"; // Convert string to boolean
    }

    // Fetch memberships based on the filter
    const memberships = await MembershipType.find(filter);

    // Return the filtered memberships
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

export const getMembershipById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membership = await MembershipType.findById(req.params.id);
    if (!membership) {
      res.status(404).json({ error: "MembershipType not found" });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch membershipType" });
  }
};

export const createMembership = async (req: Request, res: Response) => {
  try {
    const membership = new MembershipType(req.body);
    const savedMembership = await membership.save();
    res.status(201).json(savedMembership);
  } catch (error) {
    res.status(500).json({ error: "Failed to create membershipType" });
  }
};

export const updateMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membership = await MembershipType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!membership) {
      res.status(404).json({ error: "MembershipType not found" });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: "Failed to update membershipType" });
  }
};

export const deleteMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membership = await MembershipType.findByIdAndDelete(req.params.id);
    if (!membership) {
      res.status(404).json({ error: "MembershipType not found" });
    }
    res.json({ message: "MembershipType deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete membership " });
  }
};

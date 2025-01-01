import { NextFunction, Request, Response } from "express";
import MembershipType from "../models/membershipType.model";

export const getMemberships = async (req: Request, res: Response) => {
  try {
    const memberships = await MembershipType.find();
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
      res.status(404).json({ error: "Membership not found" });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch membership" });
  }
};

export const createMembership = async (req: Request, res: Response) => {
  try {
    const membership = new MembershipType(req.body);
    const savedMembership = await membership.save();
    res.status(201).json(savedMembership);
  } catch (error) {
    res.status(500).json({ error: "Failed to create membership" });
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
      res.status(404).json({ error: "Membership not found" });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: "Failed to update membership" });
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
      res.status(404).json({ error: "Membership not found" });
    }
    res.json({ message: "Membership deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete membership" });
  }
};

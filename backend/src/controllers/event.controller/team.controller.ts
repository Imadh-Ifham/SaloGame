import { Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../../models/event.model/team.model";

// Get all teams
export const getAllTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
    const { eventId } = req.query;
  try {
    const teams = await Team.find({ eventId });
    if (!teams) {
      res.status(404).json({ success: false, message: "No teams found" });
      return;
    }
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: (error as Error).message,
    });
  }
};

// Get a team by ID
export const getTeamById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    try {
        const team = await Team.findById(id);
        if (!team) {
            res.status(404).json({ success: false, message: "Team not found" });
            return;
        }
        res.status(200).json({ success: true, data: team });
    }catch(error) {
        res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
}

// Create a new team
export const createTeam = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { teamName, eventId, maxMembers } = req.body;
        if(!teamName || !eventId || !maxMembers) {
            res.status(400).json({ success: false, message: "teamName, eventId and maxMembers are required" });
            return;
        }
        const team = new Team({ teamName, eventId, maxMembers });
        await team.save();
        res.status(201).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
}

// Update a team
export const updateTeam = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    try {
        const updatedTeam = await Team.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedTeam) {
            res.status(404).json({ success: false, message: "Team not found" });
            return;
        }
        res.status(200).json({ success: true, data: updatedTeam });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
}

// Delete a team
export const deleteTeam = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "teamID is required" });
            return;
        }
        await Team.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Team deleted" });

        } catch (error) {
            res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
}
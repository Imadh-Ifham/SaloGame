import { Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../../models/event.model/team.model";

// Get all teams
export const getAllTeams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const teams = await Team.find();
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
    const { teamName, eventId, maxMembers, createdBy } = req.body; 
    if (!teamName || !eventId || !maxMembers || !createdBy) {
      res.status(400).json({ success: false, message: "teamName, eventId, maxMembers, and createdBy are required" });
      return;
    }
    const team = new Team({ teamName, eventId, maxMembers, createdBy });
    await team.save();
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
  }
};

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

//get teams for a specific event
export const getEventAllTeams = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // Use req.params to get the ID from the URL
  try {
    // Query the database for teams with the matching eventId
    const teams = await Team.find({ eventId: id }); 
    if (teams.length === 0) {
      res.status(404).json({ success: false, message: "No teams found for the given event" });
      return;
    }
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
  }
};


// Register a user to a team
export const registerUserToTeam = async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const { userId } = req.body;
    try {
        const team = await Team.findById(teamId);
        if (!team) {
            res.status(404).json({ success: false, message: "Team not found" });
            return;
        }
        if (team.members.some(member => member.userId.toString() === userId)) {
            res.status(400).json({ success: false, message: "User already registered" });
            return;
        }
        if (team.members.length >= team.maxMembers) {
            res.status(400).json({ success: false, message: "Team is full" });
            return;
        }

        // Convert userId to ObjectId and add to members
        team.members.push({ userId: new mongoose.Types.ObjectId(userId), joinedAt: new Date() });
        await team.save();
        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
};



  // Remove a user from a team
export const removeUserFromTeam = async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const { userId } = req.body;
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        res.status(404).json({ success: false, message: "Team not found" });
        return;
      }
      team.members = team.members.filter(member => member.userId.toString() !== userId);
      await team.save();
      res.status(200).json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  };
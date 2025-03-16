import { Request, Response } from "express";
import Team from "../../models/event.model/team.model";
import Event from "../../models/event.model/event.model";
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';



// Create a new team
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamName, teamLeaderId, contactNumber } = req.body;
    const teamLogo = req.file; // Using multer middleware for file upload

    // Basic validation
    if (!teamName || !teamLeaderId || !contactNumber || !teamLogo) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields including team logo"
      });
      return;
    }

    // Upload logo to cloudinary
    if (!teamLogo) {
      res.status(400).json({
        success: false,
        message: "Team logo is required"
      });
      return;
    }
    
    const logoUrl = await uploadToCloudinary(teamLogo);

    const newTeam = new Team({
      teamId: uuidv4(),
      teamName,
      teamLeaderId,
      contactNumber,
      teamLogo: logoUrl
    });

    await newTeam.save();
    res.status(201).json({
      success: true,
      data: newTeam
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message
    });
  }
};
function uploadToCloudinary(teamLogo: Express.Multer.File) {
  throw new Error("Function not implemented.");
}

// Update team
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const updateData = req.body;

    const updatedTeam = await Team.findOneAndUpdate(
      { teamId },
      updateData,
      { new: true }
    );

    if (!updatedTeam) {
      res.status(404).json({
        success: false,
        message: "Team not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedTeam
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating team",
      error: error.message
    });
  }
};

// Delete team
export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const deletedTeam = await Team.findOneAndDelete({ teamId });

    if (!deletedTeam) {
      res.status(404).json({
        success: false,
        message: "Team not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting team",
      error: error.message
    });
  }
};

// Get all teams
export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find()
      .populate('teamLeaderId', 'username email')


    res.status(200).json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching teams",
      error: error.message
    });
  }
};

// Get team by ID
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const team = await Team.findOne({ teamId })
      .populate('teamLeaderId', 'username email')

    if (!team) {
      res.status(404).json({
        success: false,
        message: "Team not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching team",
      error: error.message
    });
  }
};


export const registerTeamForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { teamId, memberEmails } = req.body;

    // Validate event and team
    const event = await Event.findById(eventId);
    const team = await Team.findOne({ teamId });

    if (!event || !team) {
      res.status(404).json({
        success: false,
        message: "Event or Team not found"
      });
      return;
    }

    // Validate number of members
    if (!event.participationPerTeam || memberEmails.length !== event.participationPerTeam - 1) {
      res.status(400).json({
        success: false,
        message: `Team must have exactly ${event.participationPerTeam} members including leader`
      });
      return;
    }

    // Generate verification tokens and send emails
    const memberVerifications = memberEmails.map((email: string) => ({
      email,
      verified: false,
      token: Math.random().toString(36).substring(2) + Date.now().toString(36)
    }));

    // Send verification emails
    for (const member of memberVerifications) {
      const verificationEmail = {
        to: member.email,
        from: process.env.EMAIL_FROM!,
        subject: `Team Event Registration Verification - ${event.eventName}`,
        html: `
          <h1>Team Event Registration Verification</h1>
          <p>You have been invited to join team ${team.teamName} for ${event.eventName}!</p>
          <p>Click the link below to verify your participation:</p>
          <a href="${process.env.FRONTEND_URL}/verify-event-member/${member.token}">
            Verify Participation
          </a>
        `
      };

      await sgMail.send(verificationEmail);
    }

    // Update team with event registration
    team.eventRegistrations = team.eventRegistrations || [];
    team.eventRegistrations.push({
      eventId,
      memberVerifications
    });

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team registered for event successfully. Members will receive verification emails."
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


import { Request, Response } from "express";
import Team from "../../models/event.model/team.model";
import Event from "../../models/event.model/event.model";
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import mongoose from 'mongoose';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Create a new team
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamName, teamLeaderEmail, contactNumber } = req.body;
    let memberEmails = req.body.memberEmails;
    const teamLogo = req.file?.path;

     // Parse memberEmails if it's a string
    if (typeof memberEmails === 'string') {
      try {
        memberEmails = JSON.parse(memberEmails);
      } catch (err) {
        console.error('Error parsing memberEmails:', err);
        res.status(400).json({
          success: false,
          message: "Invalid memberEmails format"
        });
        return;
      }
    }

    // Basic validation
    if (!teamName || !teamLeaderEmail || !memberEmails || !contactNumber || !teamLogo ) {
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

    // Generate verification tokens for members
    const members = memberEmails.map((email: string) => ({
      email,
      verified: false,
      token: Math.random().toString(36).substring(2) + Date.now().toString(36)
    }));

    const newTeam = new Team({
      teamId: uuidv4(),
      teamName,
      teamLeaderEmail,
      contactNumber,
      teamLogo: teamLogo,
      memberEmails: members
    });

     // Send verification emails to all members
     for (const member of members) {
      const verificationEmail = {
        to: member.email,
        from: process.env.EMAIL_FROM!,
        subject: `Team Membership Verification - ${teamName}`,
        html: `
          <h1>Team Membership Verification</h1>
          <p>You have been invited to join team ${teamName}!</p>
          <p>Click the link below to verify your membership:</p>
          <a href="${process.env.FRONTEND_URL}/verify-member/${member.token}" 
             style="padding: 10px 20px; background-color: #4CAF50; color: white; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Membership
          </a>
        `
      };

      await sgMail.send(verificationEmail);
    }

    await newTeam.save();
    res.status(201).json({
      success: true,
      message: "Team created successfully. Members will receive verification emails.",
      data: {
        teamId: newTeam.teamId,
        teamName: newTeam.teamName
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message
    });
  }
};

// Add member verification endpoint
export const verifyMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const team = await Team.findOne({ "memberEmails.token": token });
    if (!team) {
      res.status(404).json({
        success: false,
        message: "Invalid verification token"
      });
      return;
    }

    const memberIndex = team.memberEmails.findIndex(m => m.token === token);
    if (memberIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Member not found"
      });
      return;
    }

    team.memberEmails[memberIndex].verified = true;
    await team.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message
    });
  }
};



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
      .populate('teamLeaderEmail', 'username email')


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
      .populate('teamLeaderEmail', 'username email')

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
    
    console.log('Registration attempt - Event ID:', eventId);
    console.log('Registration attempt - Team ID:', teamId);

     // Find the event - use findById if eventId is MongoDB's _id
    let event;

    try {
      // Try with MongoDB ObjectId
      const objectId = new mongoose.Types.ObjectId(eventId);
      event = await Event.findById(objectId);
    } catch (err) {
      // If not a valid ObjectId, try with eventId field
      event = await Event.findOne({ eventId });
    }

    // Find the team
    const team = await Team.findOne({ teamId });

    console.log('Found event:', !!event);
    console.log('Found team:', !!team);

    if (!event || !team) {
      res.status(404).json({
        success: false,
        message: `${!event ? 'Event' : 'Team'} not found`
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

    // Verify that all selected members are verified members of the team
    for (const email of memberEmails) {
      const memberExists = team.memberEmails.find(m => m.email === email && m.verified === true);
      if (!memberExists) {
        res.status(400).json({
          success: false,
          message: `${email} is not a verified member of this team`
        });
        return;
      }
    }

    // Check if there are spots available for teams
    if (event.numberOfTeams && event.numberOfTeams <= 0) {
      res.status(400).json({
        success: false,
        message: "No spots available for teams in this event"
      });
      return;
    }

    // Generate notification tokens for registration confirmation
    const memberNotifications = [...memberEmails, team.teamLeaderEmail].map((email) => ({
      email,
      notified: false,
      token: Math.random().toString(36).substring(2) + Date.now().toString(36)
    }));

    // Send confirmation emails to all participating members
    for (const member of memberNotifications) {
      const confirmationEmail = {
        to: member.email,
        from: process.env.EMAIL_FROM!,
        subject: `Team Event Registration Confirmation - ${event.eventName}`,
        html: `
          <h1>Team Event Registration Confirmation</h1>
          <p>You have been registered with team <strong>${team.teamName}</strong> for <strong>${event.eventName}</strong>!</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <h2 style="margin-top: 0; color: #333;">Event Details</h2>
            <p><strong>Event:</strong> ${event.eventName}</p>
            <p><strong>Start Date:</strong> ${new Date(event.startDateTime).toLocaleString()}</p>
            <p><strong>End Date:</strong> ${new Date(event.endDateTime).toLocaleString()}</p>
            <p><strong>Description:</strong> ${event.description}</p>
          </div>
          
          <p>We look forward to your participation!</p>
        `
      };

      await sgMail.send(confirmationEmail);
    }

    // Update team with event registration
    if (!team.eventRegistrations) {
      team.eventRegistrations = [];
    }
    
    const newRegistration = {
      eventId: eventId,
      memberEmails: memberEmails,
      registrationDate: new Date()
    };
    await Team.updateOne(
      { _id: team._id }, 
      { $push: { eventRegistrations: newRegistration } }
    );

    const updatedTeam = await Team.findById(team._id);
    await team.save();

    // Update event's number of teams
    if (event.numberOfTeams) {
      event.numberOfTeams -= 1;
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: "Team registered for event successfully. Confirmation emails have been sent."
    });
  } catch (error: any) {
    console.error("Error registering team for event:", error);
    res.status(500).json({
      success: false,
      message: "Error registering team for event",
      error: error.message
    });
  }
};

/*export const registerTeamForEvent = async (req: Request, res: Response): Promise<void> => {
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
};*/


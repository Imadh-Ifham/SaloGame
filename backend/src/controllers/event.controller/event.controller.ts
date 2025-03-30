import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Event from "../../models/event.model/event.model";
import Team from "../../models/event.model/team.model";
import sgMail from '@sendgrid/mail';

declare global {
  var io: any;
}
// Route to get all events
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({});
    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    console.error("Error in fetching events: " + error.message);
    res.status(500).json({ success: false, msg: "Server error: " + error.message });
  }
};

// Route to create a new event
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const eventData = req.body;

  try {
    // Basic validation for common fields
    if (!eventData.eventName || !eventData.category || !eventData.startDateTime || 
        !eventData.endDateTime || !eventData.  description|| !eventData.image) {
      res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields" 
      });
      return;
    }

    // Category-specific validation
    if (eventData.category === "team-battle") {
      if (!eventData.numberOfTeams || !eventData.participationPerTeam) {
        res.status(400).json({
          success: false,
          message: "Team battle events require numberOfTeams and participationPerTeam"
        });
        return;
      }
    } else if (eventData.category === "single-battle") {
      if (!eventData.totalSpots) {
        res.status(400).json({
          success: false,
          message: "Single battle events require totalSpots"
        });
        return;
      }
    }

    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(200).json({ success: true, data: newEvent });
  } catch (error: any) {
    console.error("Error in saving event:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// Route to update an event by ID
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const { eventID } = req.params;
    const eventToUpdate = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(eventID)) {
      res.status(404).json({ success: false, msg: "Invalid ID" });
      return;
    }
  
    try {
      const updatedEvent = await Event.findByIdAndUpdate(eventID, eventToUpdate, { new: true });
      if (!updatedEvent) {
        res.status(404).json({ success: false, msg: "Event not found" });
        return;
      }
      res.status(200).json({ success: true, data: updatedEvent });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };

// Route to delete an event by ID
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    const { eventID } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(eventID)) {
      res.status(404).json({ success: false, msg: "Invalid ID" });
      return;
    }
  
    try {
      const deletedEvent = await Event.findByIdAndDelete(eventID);
      if (!deletedEvent) {
        res.status(404).json({ success: false, msg: "Event not found" });
        return;
      }
      res.status(200).json({ success: true, msg: "Event deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };

// Route to get an event by ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
    const { eventID } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(eventID)) {
      res.status(404).json({ success: false, msg: "Invalid ID" });
      return;
    }
  
    try {
      const event = await Event.findById(eventID);
      if (!event) {
        res.status(404).json({ success: false, msg: "Event not found" });
        return;
      }
      res.status(200).json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };


export const getEventsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { category } = req.params;
    console.log("Fetching events for category:", category); 

    try {
      const events = await Event.find({ category });
      console.log("Fetched events:", events); 
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      console.error("Error fetching events by category:", error);
      res.status(500).json({ success: false, message: "Failed to fetch events" });
    }
  };

  // SendGrid API Key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  
  export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
    const { eventID } = req.params;
    const { email } = req.body;
  
    try {
      // Find the event
      const event = await Event.findById(eventID);
      if (!event) {
        res.status(404).json({ success: false, message: "Event not found" });
        return;
      }
  
      // Check if email is already registered and not verified
    const existingRegistration = event.registeredEmails.find(entry => entry.email === email);
    if (existingRegistration && !existingRegistration.verified) {
      res.status(400).json({ 
        success: false, 
        message: "You have a pending verification for this event. Please check your email." 
      });
      return;
    }
  
      // Check if spots are available
      if (event.totalSpots <= 0) {
        res.status(400).json({ success: false, message: "No spots available" });
        return;
      }
  
      // Generate verification token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
      // Add email to registered emails
      event.registeredEmails.push({ email, verified: false, token });
      await event.save();
  
      // Create email message
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM!,
        subject: 'Event Registration Verification',
        html: `
          <h1>Event Registration Verification</h1>
          <p>Thank you for registering for ${event.eventName}!</p>
          <p>Please click the link below to verify your email and confirm your spot:</p>
          <a href="${process.env.FRONTEND_URL}/verify/${token}" style="
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
          ">Verify Email</a>
          <p style="margin-top: 20px; color: #666;">
            If the button doesn't work, copy and paste this URL into your browser:
            <br>
            ${process.env.FRONTEND_URL}/verify/${token}
          </p>
        `,
      };
  
      // Send email
      await sgMail.send(msg);
      res.status(200).json({ success: true, message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send verification email",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  };

  export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
  
    try {
      // Find event by token in registeredEmails array
      const event = await Event.findOne({ "registeredEmails.token": token });
      if (!event) {
        res.status(404).json({ success: false, message: "Invalid verification token" });
        return;
      }
  
      // Find the specific email registration
      const emailEntry = event.registeredEmails.find(entry => entry.token === token);
      if (!emailEntry) {
        res.status(404).json({ success: false, message: "Invalid verification token" });
        return;
      }
  
      // Check if already verified
      if (emailEntry.verified) {
        res.status(200).json({ 
          success: true, 
          message: "Email already verified",
          remainingSpots: event.totalSpots 
        });
        return;
      }
  
      // Update verification status and reduce spots
      emailEntry.verified = true;
      if (event.totalSpots > 0) {
        event.totalSpots -= 1;
      }
  
      await event.save();
  
      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        remainingSpots: event.totalSpots
      });
    } catch (error) {
      console.error("Error in email verification:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during verification",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

export const updateEventPlacement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { teamId, placement } = req.body; // placement is 1, 2, or 3

    // Validate placement value
    if (![1, 2, 3].includes(placement)) {
      res.status(400).json({
        success: false,
        message: "Placement must be 1, 2, or 3"
      });
      return;
    }

    // Get event and team
    const event = await Event.findById(eventId);
    const team = await Team.findOne({ teamId });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found"
      });
      return;
    }

    if (!team) {
      res.status(404).json({
        success: false,
        message: "Team not found"
      });
      return;
    }

    // Store placements in event
    if (!event.placements) {
      event.placements = [];
    }

    // Remove team from placements if already exists
    event.placements = event.placements.filter(p => p.teamId !== teamId);
    
    // Add new placement
    event.placements.push({
      teamId,
      teamName: team.teamName,
      teamLogo: team.teamLogo,
      placement,
      awardedAt: new Date()
    });

    await event.save();

    // Emit socket event with updated leaderboard data
    if (global.io) {
      global.io.emit('leaderboard:update', {
        eventId: event._id,
        eventName: event.eventName,
        placements: event.placements,
        category: event.category,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Team placed at position ${placement} successfully`,
      data: event.placements
    });
  } catch (error: any) {
    console.error("Error updating event placement:", error);
    res.status(500).json({
      success: false,
      message: "Error updating event placement",
      error: error.message
    });
  }
};

// Add this function to your controller
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all events with placements
    const events = await Event.find({ "placements.0": { $exists: true } })
      .select('_id eventName category placements')
      .sort({ 'placements.awardedAt': -1 });
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message
    });
  }
};
  
/*  export const declareWinner = async (req: Request, res: Response) => {
    try {
      const { eventId, winnerEmail, winnerTeamId } = req.body;
  
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      if (event.category === "single-battle") {
        event.winner = winnerEmail; // Update winner for single battles
      } else if (event.category === "team-battle") {
        const team = await Team.findById(winnerTeamId);
        if (!team) return res.status(404).json({ message: "Team not found" });
  
        event.winnerTeamId = team._id as mongoose.Types.ObjectId; // Update winner for team battles
      }
  
      await event.save();
  
      // Emit leaderboard update to all connected clients
      io.emit("leaderboardUpdate", {
        eventId,
        winnerEmail: event.winner,
        winnerTeamId: event.winnerTeamId,
      });
  
      return res.status(200).json({ message: "Winner updated successfully", event });
    } catch (error) {
      console.error("Error updating winner:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await Event.find()
      .populate("winnerTeamId", "teamName teamLogo") // Populate team details if it's a team battle
      .select("eventName category winner winnerTeamId");

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

 */ 
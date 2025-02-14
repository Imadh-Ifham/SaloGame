import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../../models/event.model/event.model";

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

  if (!eventData.eventName || !eventData.category || !eventData.startDateTime || !eventData.endDateTime || !eventData.participationType) {
    res.status(400).json({ success: false, msg: "Please provide all required fields" });
    return;
  }

  const newEvent = new Event(eventData);

  try {
    await newEvent.save();
    res.status(200).json({ success: true, data: newEvent });
  } catch (error: any) {
    console.error("Error in saving event: " + error.message);
    res.status(500).json({ success: false, msg: "Server Error" });
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
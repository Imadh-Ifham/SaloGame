import { Request, Response } from "express";
import Event from "../../models/event.model/event.model";

export const createEvent = async (
    req: Request, 
    res: Response
):Promise<void> => {
    try {
        const{ name, description, date, time } = req.body;
        if( !name || !description || !date || !time ){
            res.status(400).json({ message: "Please fill in all fields" });
            return;
        }

        const newEvent = new Event({ name, description, date, time });
        await newEvent.save();

        res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Server Error..Failed to create event", error: (error as Error).message });
    }
}

export const getAllEvents = async (
    req: Request,
    res: Response
):Promise<void> => {
    try {
        const events = await Event.find().sort({ date: 1 });
        if(!events){
            res.status(404).json({ message: "No events found" });
            return;
        }
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ message: "Server Error..Failed to get events", error: (error as Error).message });
    }
}

export const getEventById = async (
    req: Request,
    res: Response
):Promise<void> => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if(!event){
            res.status(400).json({ message: "Event not found" });
            return;
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ message: "Server Error..Failed to get event", error: (error as Error).message });
    }
}

export const updateEvent = async (
    req: Request,
    res: Response
):Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, date, time } = req.body;
        if(!name || !description || !date || !time){
            res.status(400).json({ message: "Please fill all fields" });
            return;
        }
        const updatedEvent = await Event.findByIdAndUpdate(
            id, 
            { name, description, date, time }, 
            { new : true }
        );
        if(!updatedEvent){
            res.status(400).json({ message: "Event not found" });
        }
        res.status(200).json({ success: true, data: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Server Error..Failed to update event", error : (error as Error).message });
    }
}

export const deleteEvent = async (
    req: Request,
    res: Response
):Promise<void> => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        if(!deletedEvent){
            res.status(400).json({ message: "Event not found" });
            return;
        }
        res.status(200).json({ success: true, data: deletedEvent });
    } catch (error) {
        res.status(500).json({ message: "Server Error..Failed to delete event", error: (error as Error).message });
    }
}
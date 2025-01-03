import { Request, Response } from 'express';
import mongoose from "mongoose";
import Booking from '../models/booking.model';

export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const booking = await Booking.find({});
      res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      console.error("Error in fetching booking: " + error.message);
      res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };


export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const bookingData = req.body;
  
    if (!bookingData.date || !bookingData.time || !bookingData.name || !bookingData.phone || !bookingData.email) {
        res.status(400).json({ success: false, msg: "Please provide all required fields" });
        return;
    }
  
    const newBooking = new Booking(bookingData);
  
    try {
        const savedBooking = await newBooking.save();
        if (!savedBooking) {
            res.status(500).json({ success: false, msg: "Failed to create booking" });
            return;
        }
        res.status(201).json({ success: true, data: savedBooking });
    } catch (error: any) {
        console.error("Error in saving booking: " + error.message);
        res.status(500).json({ 
            success: false, 
            msg: "Failed to create booking",
            error: error.message 
        });
    }
  };
  
  export const updateBooking = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const bookingToUpdate = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, msg: "Invalid ID" });
        return;
    }
  
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(id, bookingToUpdate, { new: true });
        res.status(200).json({ success: true, data: bookingToUpdate });
    } catch (error: any) {
        res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };
  
  export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, msg: "Invalid ID" });
        return;
    }
  
    try {
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) {
            res.status(404).json({ success: false, msg: "Booking not found" });
            return;
        }
        res.status(200).json({ success: true, data: deletedBooking, message: "Booking deleted" });
    } catch (error: any) {
        console.error("Error in deleting booking: " + error.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
  };
  
export const getBookingsByUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    
    try {
        const bookings = await Booking.find({ userId });
        if (!bookings || bookings.length === 0) {
            res.status(404).json({ success: false, msg: "No bookings found for this user" });
            return;
        }
        res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
        console.error("Error fetching user bookings:", error.message);
        res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
};

export const getBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
  
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404).json({ success: false, msg: "Invalid ID" });
            return;
        }
  
        const bookingData = await Booking.findById(id);
        if (!bookingData) {
            res.status(404).json({ success: false, msg: "Booking not found" });
            return;
        }
  
        res.status(200).json({ success: true, data: bookingData });
    } catch (error: any) {
        console.error("Error in fetching booking: " + error.message);
        res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };
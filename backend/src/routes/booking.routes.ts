import express from "express";
import { getBookings,createBooking,updateBooking,deleteBooking, getBooking, getBookingsByUser } from '../controllers/booking.controller';


const router = express.Router();

router.get("/", getBookings);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.get("/:id", getBooking);
router.get("/user/:userId", getBookingsByUser);

export default router;

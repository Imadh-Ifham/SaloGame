import express from "express";
import {
  createBooking,
  getFirstAndNextBookingForAllMachines,
  updateBookingStatus,
} from "../controllers/booking.controller";

const router = express.Router();
router.post("/", createBooking);
router.post("/get-first-and-next", getFirstAndNextBookingForAllMachines);
router.patch("/update-status", updateBookingStatus);

export default router;

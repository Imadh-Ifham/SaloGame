import express from "express";
import {
  createBooking,
  getBookingStatusForAllMachines,
  getFirstAndNextBooking,
  updateBookingStatus,
} from "../controllers/booking.controller";

const router = express.Router();
router.post("/", createBooking);
router.post("/get-first-and-next", getFirstAndNextBooking);
router.post("/machines-status", getBookingStatusForAllMachines);
router.patch("/update-status", updateBookingStatus);

export default router;

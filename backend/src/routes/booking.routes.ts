import express from "express";
import {
  createBooking,
  getFirstAndNextBookingForAllMachines,
} from "../controllers/booking.controller";

const router = express.Router();
router.post("/", createBooking);
router.post("/get-first-and-next", getFirstAndNextBookingForAllMachines);

export default router;

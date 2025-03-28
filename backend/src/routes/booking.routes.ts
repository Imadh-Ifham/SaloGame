import express from "express";
import {
  createBooking,
  generateReport,
  getBookingByID,
  getBookingLog,
  getBookingStatusForAllMachines,
  getFirstAndNextBooking,
  updateBookingStatus,
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
router.use(authMiddleware);
router.post("/", createBooking);
router.post("/get-first-and-next", getFirstAndNextBooking);
router.post("/machines-status", getBookingStatusForAllMachines);
router.patch("/update-status", updateBookingStatus);
router.post("/get-booking/:bookingID", getBookingByID);
router.post("/get-log", getBookingLog);
router.get("/report", generateReport);

export default router;

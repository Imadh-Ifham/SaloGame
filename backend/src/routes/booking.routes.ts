import express from "express";
import {
  createBooking,
  endBooking,
  generateReport,
  getBookingByID,
  getBookingByUserID,
  getBookingLog,
  getBookingStatusForAllMachines,
  getFirstAndNextBooking,
  getUpcomingBookings,
  startBooking,
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
router.get("/get-booking", getBookingByUserID);
router.post("/get-log", getBookingLog);
router.get("/report", generateReport);
router.get("/upcoming", getUpcomingBookings);
router.put("/end-booking", endBooking);
router.put("/start-booking", startBooking);

export default router;

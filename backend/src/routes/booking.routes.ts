import express from "express";
import //createBooking,
//calculatePrice,
"../controllers/booking.controller";
import { getFirstAndNextBookingForAllMachines } from "../controllers/booking.controller";

const router = express.Router();
//router.post("/calculatePrice", calculatePrice);
//router.post("/", createBooking);
router.post("/get-first-and-next", getFirstAndNextBookingForAllMachines);

export default router;

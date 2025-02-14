import express, { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
} from "../controllers/event.controller/event.controller";

const router: Router = express.Router();

// Route to get all events
router.get("/", getAllEvents);

// Route to create a new event
router.post("/", createEvent);

// Route to update an event by ID
router.put("/:eventID", updateEvent);

// Route to delete an event by ID
router.delete("/:eventID", deleteEvent);

// Route to get an event by ID
router.get("/:eventID", getEventById);

export default router;
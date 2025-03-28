import express, { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  getEventsByCategory,
  registerForEvent,
  verifyEmail,
  updateEventPlacement,
  getLeaderboard
} from "../../controllers/event.controller/event.controller";

const router: Router = express.Router();

router.get("/category/:category", getEventsByCategory);

// Route to register for an event and send verification email
router.post("/:eventID/register", registerForEvent);

// Route to verify email and reduce total spot count
router.get("/verify/:token", verifyEmail);

// Route to update event placement
router.post('/:eventId/placement', updateEventPlacement);

// Route to get leaderboard
router.get('/leaderboard', getLeaderboard);

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
import express, { Router } from "express";
import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from '../../controllers/event.controller/event.controller';


const router: Router = express.Router();

// Event routes
router.post('/', createEvent); //create event
router.get('/', getAllEvents); //get all events
router.get('/:id', getEventById); //get event by id
router.put('/:id', updateEvent); //update event
router.delete('/:id', deleteEvent); //delete event



export default router;
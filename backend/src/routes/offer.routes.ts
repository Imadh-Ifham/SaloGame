import express, { Router } from "express";
import {
  createOffer,
  deleteOffer,
  getAllOffers,
  updateOffer,
} from "../controllers/offer.controller";

const router: Router = express.Router();

// Route to get all offers
router.get("/", getAllOffers);

// Route to create a new offer
router.post("/", createOffer);

// Route to update an offer by ID
router.put("/:offerID", updateOffer);

// Route to delete an offer by ID
router.delete("/:offerID", deleteOffer);

export default router;

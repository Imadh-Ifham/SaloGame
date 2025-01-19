import express, { Router } from "express";
import {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  toggleActiveOffer,
} from "../controllers/offer.controller";
import { validateOfferData } from "../middleware/offer.validation";

const router: Router = express.Router();

// Route to get all offers
router.get("/", getAllOffers);

// Route to create a new offer
router.post("/", validateOfferData, createOffer);

// Route to update an offer by ID
router.put("/:id", validateOfferData, updateOffer);
// Route to delete an offer by ID
router.delete("/:offerID", deleteOffer);

//Route to get an offer by ID
router.get("/:offerID", getOfferById);

router.patch("/:offerID/toggle-active", toggleActiveOffer);

export default router;

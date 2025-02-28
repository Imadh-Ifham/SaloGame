import express, { Router } from "express";
import {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
  toggleActiveOffer,
  getCategories,
} from "../controllers/offer.controller";

const router: Router = express.Router();

// Route to get all offers
router.get("/", getAllOffers);

// Route to get all categories
router.get("/categories", getCategories);

// Route to create a new offer
router.post("/", createOffer);

// Route to update an offer by ID
router.put("/:offerID", updateOffer);

// Route to delete an offer by ID
router.delete("/:offerID", deleteOffer);

//Route to get an offer by ID
router.get("/:offerID", getOfferById);

router.patch("/:offerID/toggle-active", toggleActiveOffer);

export default router;

import express from "express";
import { getPackages,createPackage,updatePackage,deletePackage, getPackage } from '../controllers/package.controller';


const router = express.Router();

router.get("/", getPackages);
router.post("/", createPackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackage);
router.get("/:id", getPackage);

export default router;
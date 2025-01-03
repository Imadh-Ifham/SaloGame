import express from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
} from "../controllers/report.controller";

const router = express.Router();

router.post("/", createReport);// Create a new report
router.get("/", getAllReports);// Get all reports
router.get("/:reportId", getReportById);// Get a single report by ID
router.put("/:reportId", updateReport);// Update a report by ID
router.delete("/:reportId", deleteReport);// Delete a report by ID

export default router;
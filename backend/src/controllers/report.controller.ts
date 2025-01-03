import { Request, Response } from "express";
import Report from "../models/report.model";

// Create a new report
export const createReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, createdBy } = req.body;
      const newReport = new Report({ title, description, createdBy });
      await newReport.save();
      res.status(201).json({ success: true, data: newReport });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  };

// Get all reports
export const getAllReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await Report.find();
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
  }
};

// Get a single report by ID
export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
  }
};

// Update a report by ID
export const updateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportId } = req.params;
      const { title, description, createdBy } = req.body;
      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        { title, description, createdBy },
        { new: true, runValidators: true }
      );
      if (!updatedReport) {
        res.status(404).json({ success: false, message: "Report not found" });
        return;
      }
      res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
    }
  };

// Delete a report by ID
export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const deletedReport = await Report.findByIdAndDelete(reportId);
    if (!deletedReport) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: (error as Error).message });
  }
};
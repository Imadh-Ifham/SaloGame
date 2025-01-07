import { Request, Response } from 'express';
import mongoose from "mongoose";
import Package from '../models/package.model';

export const getPackages = async (req: Request, res: Response): Promise<void> => {
    try {
      const packages = await Package.find({});
      res.status(200).json({ success: true, data: packages });
    } catch (error: any) {
      console.error("Error in fetching package: " + error.message);
      res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };


export const createPackage = async (req: Request, res: Response): Promise<void> => {
    const packageData = req.body;
  
    if (!packageData.name || !packageData.price || !packageData.description || !packageData.image) {
        res.status(400).json({ success: false, msg: "Please provide all required fields" });
        return;
    }
  
    const newPackage = new Package(packageData);
  
    try {
        await newPackage.save();
        res.status(200).json({ success: true, data: newPackage });
    } catch (error: any) {
        console.error("Error in saving package: " + error.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
  };
  
  export const updatePackage = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const packageToUpdate = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, msg: "Invalid ID" });
        return;
    }
  
    try {
        const updatedPackage = await Package.findByIdAndUpdate(id, packageToUpdate, { new: true });
        res.status(200).json({ success: true, data: updatedPackage });
    } catch (error: any) {
        res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };
  
  export const deletePackage = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, msg: "Invalid ID" });
        return;
    }
  
    try {
        const deletedPackage = await Package.findByIdAndDelete(id);
        if (!deletedPackage) {
            res.status(404).json({ success: false, msg: "Package not found" });
            return;
        }
        res.status(200).json({ success: true, data: deletedPackage, message: "Package deleted" });
    } catch (error: any) {
        console.error("Error in deleting package: " + error.message);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
  };
  
  export const getPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
  
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404).json({ success: false, msg: "Invalid ID" });
            return;
        }
  
        const packageData = await Package.findById(id);
        if (!packageData) {
            res.status(404).json({ success: false, msg: "Package not found" });
            return;
        }
  
        res.status(200).json({ success: true, data: packageData });
    } catch (error: any) {
        console.error("Error in fetching package: " + error.message);
        res.status(500).json({ success: false, msg: "Server error: " + error.message });
    }
  };
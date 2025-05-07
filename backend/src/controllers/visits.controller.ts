import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Visit from '../models/Visit';
import * as visitsService from '../services/visitsService';
import { AuthRequest } from '../middleware/types';


interface HourlyVisit {
  _id: number;
  count: number;
}


export const recordVisit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    await visitsService.recordVisit(req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording visit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getWeeklyVisits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    const visits = await visitsService.getWeeklyVisits(req.user.id);
    console.log('Weekly visits data:', visits); // Debug log
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    console.error('Error getting weekly visits:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const getHourlyVisits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hourlyVisits = await Visit.aggregate<HourlyVisit>([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Fill in missing hours with 0 visits
    const filledHourlyData = Array.from({ length: 24 }, (_, hour) => {
      const found = hourlyVisits.find((v: HourlyVisit) => v._id === hour);
      return {
        _id: hour,
        count: found ? found.count : 0
      };
    });

    res.json({
      success: true,
      data: filledHourlyData
    });
  } catch (error) {
    console.error('Error getting hourly visits:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch hourly visits"
    });
  }
};
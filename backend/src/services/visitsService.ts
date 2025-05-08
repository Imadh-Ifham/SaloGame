import mongoose from 'mongoose';
import Visit from '../models/Visit';

export const recordVisit = async (userId: string): Promise<void> => {
  const visit = new Visit({
    userId: new mongoose.Types.ObjectId(userId)
  });
  await visit.save();
};

export const getWeeklyVisits = async (userId: string) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return Visit.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: oneWeekAgo }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);
};
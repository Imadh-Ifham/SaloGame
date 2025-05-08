import { AuthRequest } from '../middleware/types';
import { Response } from 'express';
import User from '../models/user.model';

interface UserRoleStats {
  owner: number;
  manager: number;
  user: number;
  [key: string]: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: UserRoleStats;
  newUsersThisMonth: number;
}

/**
 * Get user statistics including total users, active/inactive counts, role distribution
 * and new users this month
 */
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify user is authenticated and authorized
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get users by status 
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Initialize role stats with defaults
    const roleStats: UserRoleStats = {
      owner: 0,
      manager: 0, 
      user: 0
    };

    // Format users by role into object
    usersByRole.forEach(stat => {
      if (stat._id) {
        roleStats[stat._id] = stat.count;
      }
    });

    const stats: UserStats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole: roleStats,
      newUsersThisMonth
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
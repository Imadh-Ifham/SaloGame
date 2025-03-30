import express from "express";
import {
  createSubscription,
  getUserSubscriptions,
  getUserExpiringNotifications,
  getMembershipStats,
  getSubscriptionGrowth,
  getRecentActivities,
  getFailedRenewals,
  manuallyRenewSubscription,
  changeSubscriptionPlan,
  updatePaymentMethod,
  deletePaymentMethod,
  toggleAutoRenew,
} from "../controllers/subscription.controller";
import { authMiddleware, managerOrOwner } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // Protect all subscription routes

router.post("/", createSubscription);
router.get("/user", getUserSubscriptions);
router.get("/my-expiring", getUserExpiringNotifications);
router.get("/stats", getMembershipStats);
router.get("/growth", getSubscriptionGrowth);
router.get("/recentActivities", getRecentActivities);
router.get("/failed-renewals", getFailedRenewals);
router.post("/manual-renew", manuallyRenewSubscription);
router.post("/change-plan", changeSubscriptionPlan);
router.patch("/:id/payment-method", updatePaymentMethod);
router.delete("/:id/payment-method", deletePaymentMethod);
router.patch("/:id/auto-renew", toggleAutoRenew);

export default router;

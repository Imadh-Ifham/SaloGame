import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { AutoRenewalService } from "./services/autoRenewalService";
import fileUpload from "express-fileupload";
//google analytics
import dotenv from "dotenv";
dotenv.config();

import packageroute from "./routes/package.routes";
import gameRoutes from "./routes/game.routes";
import bookingRoutes from "./routes/booking.routes";
import offerRoutes from "./routes/offer.routes";
import membershipRoute from "./routes/membershipType.routes";
import machineRoute from "./routes/machine.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import userRoutes from "./routes/user.routes";
import currencyRoutes from "./routes/currency.routes";
import machineGameRoutes from "./routes/machineGame.routes";
import eventRoutes from "./routes/event.routes/event.routes";
import teamRoutes from "./routes/event.routes/team.routes";
import transactionRoutes from "./routes/transaction.routes";
import chatbotRoutes from "./routes/event.routes/chatbot";

//google analytics route
import visitRoutes from "./routes/visit.routes";
import analyticsRoutes from "./routes/analytics.routes";
import feedbackRoutes from "./routes/feedback.routes";
import statsRoutes from "./routes/stats.routes";



const app: Express = express();

// Auto renewal service
const autoRenewalService = new AutoRenewalService();
autoRenewalService.start();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, 
  abortOnLimit: true,
  createParentPath: true,
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/packages", packageroute);
app.use("/api/games", gameRoutes);
app.use("/api/offer", offerRoutes);
app.use("/api/memberships", membershipRoute);
app.use("/api/machine", machineRoute);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/machinegames", machineGameRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/chatbot", chatbotRoutes);

//google analytics route
app.use("/api/visits", visitRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stats", statsRoutes);


// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode: number = err.statusCode || 500;
  const message: string = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;

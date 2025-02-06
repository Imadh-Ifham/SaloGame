import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

import packageroute from "./routes/package.routes";
import gameRoutes from "./routes/game.routes";
import bookingRoutes from "./routes/booking.routes";
import offerRoutes from "./routes/offer.routes";
import membershipRoute from "./routes/membershipType.routes";
import machineRoute from "./routes/machine.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import userRoutes from "./routes/user.routes";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

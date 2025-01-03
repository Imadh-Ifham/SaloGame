import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import userRoute from "./routes/user.routes";
import packageroute from "./routes/package.routes";
import gameRoutes from "./routes/game.routes";
import bookingRoutes from "./routes/booking.routes";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/example", userRoute);
app.use("/api/packages", packageroute);
app.use("/api/bookings", bookingRoutes);
app.use("/api/games", gameRoutes); // Mount the game router

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

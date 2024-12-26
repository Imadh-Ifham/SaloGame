import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import userRoute from "./routes/user.routes";
import gameRoutes from "./routes/game.routes";

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/example", userRoute);

// Routes
app.use("/api/games", gameRoutes); // Mount the game router

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

import express from "express";
import cors from "cors";
import userRoute from "./routes/user.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/example", userRoute);

export default app;

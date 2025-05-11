import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import connectDB from "./config/db";
import { initializeSocketIO } from "./controllers/transaction.controller";
import Last30DaysTransactions from "./models/last30DaysTransactions.model";
import Transaction from "./models/transaction.model";

dotenv.config();

// Connect to the database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Declare global io
declare global {
  var io: any;
}

// Set up Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Set global io
global.io = io;

// Initialize Socket.IO in transaction controller
initializeSocketIO(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle admin replies to feedback
  socket.on('adminReply', (updatedFeedback) => {
    socket.broadcast.emit('feedbackReplied', updatedFeedback);
  });

  // Handle admin editing feedback replies
  socket.on('adminEditReply', (updatedFeedback) => {
    socket.broadcast.emit('feedbackReplyEdited', updatedFeedback);
  });
  
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Add leaderboard namespace
const leaderboardNamespace = io.of('/leaderboard');
leaderboardNamespace.on('connection', (socket) => {
  console.log(`Client connected to leaderboard namespace: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected from leaderboard namespace: ${socket.id}`);
  });
});

// Schedule periodic refresh of last 30 days transactions
const refreshInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
setInterval(async () => {
  try {
    console.log("Running scheduled refresh of Last30DaysTransactions");
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedTransactions = await Transaction.find({
      status: "completed",
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const totalEarnings = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const updatedDoc = await Last30DaysTransactions.findOneAndUpdate(
      {}, // Find any document (there should be only one)
      {
        transactions: completedTransactions.map(t => ({
          transactionId: t._id,
          userID: t.userID,
          paymentType: t.paymentType,
          amount: t.amount,
          transactionType: t.transactionType,
          status: t.status,
          createdAt: t.createdAt
        })),
        totalEarnings,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Emit updated earnings to all connected clients
    io.emit('earnings:update', { 
      totalEarnings: updatedDoc.totalEarnings,
      period: "Last 30 Days"
    });
    
    console.log("Last30DaysTransactions refreshed successfully");
  } catch (error) {
    console.error("Error during scheduled refresh:", error);
  }
}, refreshInterval);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
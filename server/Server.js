import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";  // for socket.io
import { Server } from "socket.io";
import connectDB from "./db/db.js";

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Create server and socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // change to your frontend URL in production
    methods: ["GET", "POST", "DELETE"],
  },
});

// Make io accessible in routes
app.set("socketio", io);

// ===== Socket.io connection =====
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ===== ROUTES =====
import classRoutes from "./routes/classRoutes.js";
import feeHeadRoutes from "./routes/feeHeadRoutes.js";
import academicSessionRoutes from "./routes/academicSessionRoutes.js";
import feeStructureRoutes from "./routes/feeStructureRoutes.js";
import transportRoutes from "./routes/transportRoute.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import dailyCollectionRoutes from "./routes/dailycollectionRoutes.js";
import classSummaryRoutes from "./routes/classSummaryRoutes.js";
import transportReportRoutes from "./routes/transportReportRoutes.js";
import feeHeadreportRoutes from "./routes/feeheadsreportRoutes.js";
import studentPaymentHistoryRoutes from "./routes/studentpaymenthistoryRoutes.js";
import outstandingRoutes from "./routes/outstandingFeesRoutes.js";

// New Activity Routes
import activityRoutes from "./routes/activityRoutes.js";

app.use("/api/classes", classRoutes);
app.use("/api/feeheads", feeHeadRoutes);
app.use("/api/sessions", academicSessionRoutes);
app.use("/api/fees", feeStructureRoutes);
app.use("/api/transportroutes", transportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/transport-report", transportReportRoutes);
app.use("/api/reports", dailyCollectionRoutes);
app.use("/api/reports", classSummaryRoutes);
app.use("/api/reports", feeHeadreportRoutes);
app.use("/api/reports", studentPaymentHistoryRoutes);
app.use("/api/reports", outstandingRoutes);

// New Activity Log route
app.use("/api/activities", activityRoutes);

// ===== START SERVER =====
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

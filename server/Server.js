import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import bcrypt from "bcryptjs";
import connectDB from "./db/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Connect DB
connectDB();

// Create server and socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

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
import activityRoutes from "./routes/activityRoutes.js";
import adminManagementRoutes from "./routes/adminManagementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



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
app.use("/api/activities", activityRoutes);
app.use("/api/adminManagement", adminManagementRoutes);
app.use("/api/admin", adminRoutes);


// ===== Create Default Admin =====
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ userId: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await Admin.create({
        userId: "admin",
        name: "Main Admin",
        password: hashedPassword,
        role: "Admin",
        profileImage: "",
      });
      //console.log("Default admin created → userId: admin | password: admin123");
    } else {
      //console.log("Default admin already exists in database");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};

// ===== Start Server =====
const startServer = async () => {
  try {
    await createDefaultAdmin();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("Server failed to start:", err);
  }
};

startServer();

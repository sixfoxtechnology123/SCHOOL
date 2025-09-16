import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import connectDB from "./db/db.js";

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
import classRoutes from "./routes/classRoutes.js";
import feeHeadRoutes from "./routes/feeHeadRoutes.js";
import academicSessionRoutes from "./routes/academicSessionRoutes.js";
import feeStructureRoutes from "./routes/feeStructureRoutes.js";
import transportRoutes from "./routes/transportRoute.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import idCardRoutes from "./routes/idCardRoutes.js";
import udiseRoutes from "./routes/udiseRoutes.js";

import dailyCollectionRoutes from "./routes/dailycollectionRoutes.js";
import classSummaryRoutes from "./routes/classSummaryRoutes.js";
import transportReportRoutes from "./routes/transportReportRoutes.js";
import feeHeadreportRoutes from "./routes/feeheadsreportRoutes.js";
import studentPaymentHistoryRoutes from "./routes/studentpaymenthistoryRoutes.js";
import outstandingRoutes from "./routes/outstandingFeesRoutes.js";

app.use("/api/classes", classRoutes);
app.use("/api/feeheads", feeHeadRoutes);
app.use("/api/sessions", academicSessionRoutes);
app.use("/api/fees", feeStructureRoutes);
app.use("/api/transportroutes", transportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/idcards", idCardRoutes);
app.use("/api/udise", udiseRoutes);

app.use("/api/transport-report", transportReportRoutes);
app.use("/api/reports", dailyCollectionRoutes);
app.use("/api/reports", classSummaryRoutes);
app.use("/api/reports", feeHeadreportRoutes);
app.use("/api/reports", studentPaymentHistoryRoutes);
app.use("/api/reports", outstandingRoutes);


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

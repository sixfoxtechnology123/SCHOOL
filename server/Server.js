const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");
const express = require("express");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
const classRoutes = require("./routes/classRoutes");
const feeHeadRoutes = require("./routes/feeHeadRoutes");
const academicSessionRoutes = require("./routes/academicSessionRoutes");
const feeStructureRoutes = require("./routes/feeStructureRoutes");
const transportRoutes = require("./routes/transportRoute");
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const idCardRoutes = require("./routes/idCardRoutes");
const udiseRoutes = require("./routes/udiseRoutes");


const dailyCollectionRoutes = require("./routes/dailycollectionRoutes");
const classSummaryRoutes = require("./routes/classSummaryRoutes");
const transportReportRoutes = require("./routes/transportReportRoutes");
const feeHeadreportRoutes = require("./routes/feeheadsreportRoutes");
const studentPaymentHistoryRoutes = require("./routes/studentpaymenthistoryRoutes");

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

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

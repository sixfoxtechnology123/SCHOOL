const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");

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
const receiptRoutes = require("./routes/receiptRoutes");



app.use("/api/classes", classRoutes);
app.use("/api/feeheads", feeHeadRoutes);
app.use("/api/sessions", academicSessionRoutes);
app.use("/api/fees", feeStructureRoutes);
app.use("/api/transportroutes", transportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/receipts", receiptRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

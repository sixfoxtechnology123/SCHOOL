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





app.use("/api/classes", classRoutes);
app.use("/api/feeheads", feeHeadRoutes);
app.use("/api/sessions", academicSessionRoutes);
app.use("/api/fees", feeStructureRoutes);



// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

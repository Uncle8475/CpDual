import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js"
import challengeRoutes from "./Routes/challengeRoutes.js"
// import submissionRoutes from "./Routes/submissionRoutes.js"
// Middleware Connections

dotenv.config();
connectDb();
const app = express();
// app.use(cors());
app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/challenge", challengeRoutes);
// app.use("/api/submission", submissionRoutes);
// app.use("/api/submission", submissionRoutes);
// Routes

// Connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});

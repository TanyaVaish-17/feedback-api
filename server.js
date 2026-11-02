require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
app.use(express.json());

connectDB();

app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
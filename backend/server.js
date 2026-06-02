require("dotenv").config({ path: "../.env" })
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}
const express = require("express");
const app = express();
const db = require("./db");
const cors = require("cors")

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., Postman, curl) or from allowed origins
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res)=>{
    res.send("API running");
});

const userRoutes = require("./routes/userRoutes")
app.use("/users", userRoutes)

const recordRoutes = require("./routes/recordRoutes");
app.use("/records", recordRoutes);

const summaryRoutes = require("./routes/summaryRoutes");
app.use("/summary", summaryRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});
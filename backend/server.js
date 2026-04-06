require("dotenv").config({ path: "../.env" })
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}
const express = require("express");
const app = express();
const db = require("./db");
const cors = require("cors")

app.use(cors());

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
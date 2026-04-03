const express = require("express");
const app = express();
const db = require("./db");



app.use(express.json());

app.get("/", (req, res)=>{
    res.send("API running");
});

app.listen(4000, ()=> {
    console.log("Server running on port 4000");
})

const userRoutes = require("./routes/userRoutes")
app.use("/users", userRoutes)

const recordRoutes = require("./routes/recordRoutes");
app.use("/records", recordRoutes);

const summaryRoutes = require("./routes/summaryRoutes");
app.use("/summary", summaryRoutes);


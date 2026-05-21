require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");

const express = require("express");
const cors = require("cors");
const queryRoutes = require("./routes/query");
const app = express();


app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://summer-my6c.vercel.app",
        "https://summer-my6c-git-master-leorf1s-projects.vercel.app",
        "https://summer-my6c-hbexurtpj-leorf1s-projects.vercel.app"
    ]
}));
app.use(express.json());
app.use('/api', queryRoutes);


const PORT = process.env.PORT || 5000;




app.get("/", (req, res) => {
    res.send("ClinicalQuery API running");
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connecttodatabase } from "./config/db.js";
import authrouter from "./Routes/Authroute.js";
import projectrouter from "./Routes/projectroutes.js";

const app = express();

await connecttodatabase();

app.use(cors({ origin: process.env.ORIGINS.split(","), credentials: true }));
app.use(cookieParser());
app.use(express.json());


app.get("/", (req, res) => res.send("server is live"));

app.use('/api/auth', authrouter);

app.use('/api/projects', projectrouter);
//centralized error handler
app.use((err, _req, res, _next) => {
    console.error(`[error] ${err.message}`);
    res.status(500).json({ error: err.message });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});

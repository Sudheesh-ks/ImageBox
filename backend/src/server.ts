import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { connectDB } from "./config/mongodb";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute";
import imageRouter from "./routes/imageRoute";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is working...");
});

app.use("/api", authRouter);
app.use("/api/images", imageRouter);

app.listen(PORT, () => {
  console.log(`Server successfully running at ${PORT}`);
});

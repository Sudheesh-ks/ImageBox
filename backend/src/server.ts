import express from "express";
import { connectDB } from "./config/mongodb";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute";
import imageRouter from "./routes/imageRoute";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
// app.use(
//   cors({
//     origin: true,
//     // [
//     //   "https://imagebox-tawny.vercel.app",
//     //   "http://localhost:5173" 
//     // ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true, 
//   })
// );
app.use(
  cors({
    origin: ["https://imagebox-tawny.vercel.app", "http://localhost:5173"], // explicitly allow your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests for all routes
app.options("*", cors({
  origin: ["https://imagebox-tawny.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is working...");
});

app.use("/api", authRouter);
app.use("/api/images", imageRouter);

// ✅ Export app for Vercel
export default app;

// ✅ Only run listen locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server successfully running at ${PORT}`);
  });
}

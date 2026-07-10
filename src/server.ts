import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("ResellHub Server is Running...");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
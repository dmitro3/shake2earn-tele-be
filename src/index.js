import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import { usersRouter } from "./routes/users.js";
import { shakeRouter } from "./routes/shake.js";

const app = express();
app.use(express.json());
app.use(
  cors()
  //   {
  //   origin: [
  //     "https://hkhangus.github.io/blockey-tma/",
  //     "http://localhost:3000",
  //     "http://localhost:3001",
  //     "http://localhost:5173",
  //     "http://localhost:19006",
  //   ],
  // })
);

const DB = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

// Logging configuration
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/shake", shakeRouter);

app.get("/", function (_, res) {
  res.send("Hello World");
});

app.listen(3000);
if (process.env.NODE_ENV === "development") {
  console.log("Server running on http://localhost:3000");
} else {
  console.log("Server running on port 3000");
}

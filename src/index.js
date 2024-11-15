import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import debugRouter from "./routes/debug.js";
import { pointRouter } from "./routes/point.js";
import { questsRouter } from "./routes/quests.js";
import { shakeRouter } from "./routes/shake.js";
import { usersRouter } from "./routes/users.js";
import { tonRouter } from "./routes/ton.js";

const app = express();
app.use(express.json());
app.use(
  cors()
  //   {
  //   origin: [
  //     "https://hkhangus.github.io/blockey-tma/",
  //     "http://localhost:3001",
  //     "http://localhost:3001",
  //     "http://localhost:5173",
  //     "http://localhost:19006",
  //   ],
  // })
);

import swaggerUIPath from "swagger-ui-express";
import swaggerjsonFilePath from "../docs/swagger.json" assert { type: "json" };

// app.use(
//   "/api-docs",
//   swaggerUIPath.serve,
//   swaggerUIPath.setup(swaggerjsonFilePath)
// );

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
app.use("/api/v1/quests", questsRouter);
app.use("/api/v1/point", pointRouter);
app.use("/api/v1/ton", tonRouter);

if (process.env.NODE_ENV === "development") {
  app.use("/debug", debugRouter);
}

app.get("/", function (_, res) {
  res.send("Hello World");
});

app.listen(process.env.PORT || 3001);
if (process.env.NODE_ENV === "development") {
  console.log("Server running on http://localhost:3001");
} else {
  console.log("Server running on port 3001");
}

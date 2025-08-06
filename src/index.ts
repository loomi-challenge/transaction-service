import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { transactionRouter } from "./infra/http/routes/Transaction/route";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", transactionRouter);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Access the API at: http://localhost:${port}`);
});

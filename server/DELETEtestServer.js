import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes. "/" is the base path
app.use("/", userRoutes);

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://amika:rokpQxuSC9oa4DIU@amika-test.vht9oy6.mongodb.net/amika-dev?retryWrites=true&w=majority&appName=amika-test"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

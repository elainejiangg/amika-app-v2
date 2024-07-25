import express from "express"; // express is web framework for node.js (just makes our lives easier)
import cors from "cors"; // (cross-origin resource sharing) enables secure requests and data transfers from outside origins
import connectDB from "./mongoConfig/connection.js";
import userRoutes from "./routes/userRoute.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

app.use(cors());
app.use(express.json());
app.use("/", userRoutes); // User user routes. "/" is the base path for all endpoints

// Start Express Server, listening in to port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

import express from "express"; // express is web framework for node.js (just makes our lives easier)
import cors from "cors"; // (cross-origin resource sharing) enables secure requests and data transfers from outside origins
import records from "./routes/record.js"; // gets router for records, renames as records
import connectDB from "./config/mongoose.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use("/record", records); // Ex: /record/ gets all records, /record/1234 gets single record with id 1234

// Start Express Server, listening in on port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

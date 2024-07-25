import mongoose from "mongoose";

// Format of connection url: mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
const URI =
  "mongodb+srv://amika:rokpQxuSC9oa4DIU@amika-test.vht9oy6.mongodb.net/amika-dev?retryWrites=true&w=majority&appName=amika-test";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(URI);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error(`Failed to connect to MongoDB. Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

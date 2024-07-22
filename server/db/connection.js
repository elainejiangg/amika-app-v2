// Connects to mongodb server
import { MongoClient, ServerApiVersion } from "mongodb";

//some reason uri not working for .env
const URI =
  "mongodb+srv://amika:rokpQxuSC9oa4DIU@amika-test.vht9oy6.mongodb.net/?retryWrites=true&w=majority&appName=amika-test";
// console.log("URI: ", URI);
// const URI = process.env.ATLAS_URI || ""; // gets URI from config.env

const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
} catch (err) {
  console.error(err);
}

let db = client.db("employees");

export default db;

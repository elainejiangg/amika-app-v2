// import express from "express";

// // This will help us connect to the database
// import db from "../db/connection.js";

// // This help convert the id from string to ObjectId from MongoDB for the _id field
// import { ObjectId } from "mongodb";

// // a router is an instance of the express router; it define our routes.
// // gets added as middleware and will take control of requests starting with path /record
// const router = express.Router();

// ///////////////////////////////
// //// SERVER API END POINTS ////
// ///////////////////////////////

// // GET a list of all the records
// router.get("/", async (req, res) => {
//   let collection = await db.collection("records");
//   let results = await collection.find({}).toArray(); // find all, return as an array
//   res.send(results).status(200);
// });

// // GET a single record by id
// router.get("/:id", async (req, res) => {
//   let collection = await db.collection("records");
//   let query = { _id: new ObjectId(req.params.id) }; // query for document from /:id
//   let result = await collection.findOne(query);

//   if (!result) res.send("Not found").status(404);
//   else res.send(result).status(200); // 200 == successful request
// });

// // Create/POST a SINGLE new record
// router.post("/", async (req, res) => {
//   try {
//     // create new document object
//     let newDocument = {
//       name: req.body.name,
//       position: req.body.position,
//       level: req.body.level,
//     };
//     let collection = await db.collection("records");
//     let result = await collection.insertOne(newDocument); // insert new doc
//     res.send(result).status(204); // 204 processed request successfully, no content to return
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error adding record");
//   }
// });

// // Update/PATCH a SINGLE record by id.
// router.patch("/:id", async (req, res) => {
//   try {
//     // find document with id
//     const query = { _id: new ObjectId(req.params.id) };
//     // update document with new name, position, level from request body
//     const updates = {
//       $set: {
//         name: req.body.name,
//         position: req.body.position,
//         level: req.body.level,
//       },
//     };

//     let collection = await db.collection("records");
//     let result = await collection.updateOne(query, updates);
//     res.send(result).status(200);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error updating record");
//   }
// });

// // DELETE a SINGLE record
// router.delete("/:id", async (req, res) => {
//   try {
//     const query = { _id: new ObjectId(req.params.id) };

//     const collection = db.collection("records");
//     let result = await collection.deleteOne(query);

//     res.send(result).status(200);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error deleting record");
//   }
// });

// export default router; // to be used in server.js

// MONGOOSE MODELS:
import express from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const router = express.Router();

const recordSchema = new mongoose.Schema({
  name: String,
  position: String,
  level: String,
});

// connects to records (lower case, plural of schema model name)
const Record = mongoose.model("Record", recordSchema);

// Health check route
router.get("/health", (req, res) => {
  const state = mongoose.connection.readyState;
  res.status(200).send(`Mongoose connection state: ${state}`);
});

router.get("/", async (req, res) => {
  try {
    const records = await Record.find({});
    res.status(200).send(records);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).send("Not found");
    res.status(200).send(record);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const newRecord = new Record(req.body);
    const savedRecord = await newRecord.save();
    res.status(201).send(savedRecord);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updatedRecord = await Record.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send(updatedRecord);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);
    res.status(200).send("Record deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;

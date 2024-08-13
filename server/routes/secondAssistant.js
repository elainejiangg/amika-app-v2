import "dotenv/config"; // Load environment variables from .env
import express from "express";
import OpenAI from "openai";
import axios from "axios"; // Import axios to make HTTP requests to the existing routes
import { LocalStorage } from "node-localstorage"; // Import node-localstorage to use local storage in Node.js
import { MongoClient } from "mongodb";
import { User } from "../mongooseModels/userSchema.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const localStorage = new LocalStorage("./scratch"); // Initialize local storage

const router = express.Router();

let secondAssistantId = null;
let secondAssistantThreadId = null;

const GOOGLE_ID = "115517843777779709697";

export async function fetchUserRelations(googleId) {
  try {
    const relationResponse = await fetch(
      `http://localhost:5050/users/${googleId}/relations`
    );
    if (!relationResponse.ok) {
      throw new Error("Failed to fetch relations");
    }

    const relations = await relationResponse.json();
    console.log("RELATIONS: ", relations);
    console.log("Successful fetch relations info");
    return relations;
  } catch (error) {
    console.error("Error fetching relations info:", error);
  }
}

// Initialize the second assistant and thread
async function initializeSecondAssistant() {
  // fetch people collection from MongoDB
  const peopleData = await fetchUserRelations("115517843777779709697");
  console.log(peopleData);

  // If secondAssistantId is not set, create a new assistant
  if (!secondAssistantId) {
    console.log("CREATING SECOND ASSISTANT");
    const secondAssistant = await openai.beta.assistants.create({
      name: "DatabaseUpdater",
      instructions: `You are a Mongodb updater assistant. Your task is to analyze the conversation history provided to you in a message in the thread, and update the MongoDB database by adding new profiles, deleting existing ones, or modifying existing ones. Here is the current information about the user's relations in json format. ${JSON.stringify(
        peopleData
      )}. Follow the following formating when outputing anything:
        1. If you see no relevant messages that would require updating the database, output ONLY "NULL".
        2. If you see that updating the database is relevant, output "UPDATE" in the first line, and then output the request body in the following lines. Note, cases when updating might be necessary is when the user mentions a piece of information, interaction, action/reminder notification, or any other relevant information on the current person of conversation that is not in the database.
        3. If you see that adding a new profile is relevant, output "ADD" in the first line, and then output the request body in the following lines. Note, cases when adding a new profile might be relevant is if a user mentions any name (that is not an obvious public figure) that is not in the profiles database in MongoDB.
        4. If you see that deleting a profile is relevant, output "DELETE" in the first line, and then output the profile id in the following lines.
        For case 2 of updating the database, ensure that the request contains only necessary fields and values that need to be updated. Also for case 2, After the word update with a space, include the _id of the relation to be updated. For example, "UPDATE 653f1b7b9b9b9b9b9b9b9b9b {request body}".
        For case 3 of adding a new profile, ensure that the request contains all necessary fields and values that need to be updated.
        For case 4 of deleting a profile, ensure that the request contains the _id of the profile to be deleted similar to how it is done in case 2.
        Only output in 1 of the 4 options. Do not add any extraneous comments. Include only ONE profile edit/add/delete in a single reply. Do not update mutiple people at once`,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o",
    });
    secondAssistantId = secondAssistant.id;
  }

  // If secondAssistantThreadId is not set, create a new thread
  if (!secondAssistantThreadId) {
    const thread = await openai.beta.threads.create();
    secondAssistantThreadId = thread.id;
  }
}

// Function to process conversation history with the second assistant
async function processConversationHistory() {
  // Ensure secondAssistantThreadId is valid before proceeding
  if (!secondAssistantThreadId) {
    throw new Error("Second assistant thread ID is not set");
  }

  // Retrieve chat history from local storage
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  console.log("Chat History:", chatHistory);

  // Send conversation history to the second assistant
  await openai.beta.threads.messages.create(secondAssistantThreadId, {
    role: "user",
    content: `Here is the conversation history: ${JSON.stringify(chatHistory)}`,
  });

  // Ensure secondAssistantId is valid before proceeding
  if (!secondAssistantId) {
    throw new Error("Second assistant ID is not set");
  }

  // Stream the response from the second assistant
  const updates = [];
  const run = openai.beta.threads.runs
    .stream(secondAssistantThreadId, {
      assistant_id: secondAssistantId,
    })
    .on("textCreated", (text) => {
      updates.push(text); // Append newly created text to the array
      console.log("Text Created:", text);
    })
    .on("textDelta", (textDelta) => {
      updates.push(textDelta.value); // Append text delta to the array
      console.log("Text Delta:", textDelta.value);
    })
    .on("end", async () => {
      console.log("Stream ended. Final updates:", updates.join(""));

      // Clean up the response to remove any non-JSON parts
      let cleanedUpdates = updates.join("").replace(/^\[object Object\]/, "");
      cleanedUpdates = cleanedUpdates.replace(/\n/g, ""); // Remove all instances of \n

      // // Extract the action and request body
      // const actionMatch = cleanedUpdates.match(/^(ADD|UPDATE|DELETE)/);
      // if (!actionMatch) {
      //   console.error("No valid action found in updates");
      //   return;
      // }

      // const action = actionMatch[0];
      // if (action === "UPDATE") {
      //   const _id = cleanedUpdates.slice(action.length).trim();
      //   const requestBody = cleanedUpdates.slice(action.length).trim();

      // } else {
      //   const requestBody = cleanedUpdates.slice(action.length).trim();
      // }
      const actionMatch = cleanedUpdates.match(/^(ADD|UPDATE|DELETE)/);
      if (!actionMatch) {
        console.error("No valid action found in updates");
        return;
      }

      const action = actionMatch[0];
      let _id, requestBody;

      if (action === "UPDATE") {
        const updateMatch = cleanedUpdates.match(/^UPDATE\s+(\w+)\s+(.+)/);
        if (updateMatch) {
          _id = updateMatch[1];
          requestBody = updateMatch[2];
        } else {
          console.error("Invalid UPDATE format");
          return;
        }
      } else if (action === "DELETE") {
        const deleteMatch = cleanedUpdates.match(/^DELETE\s+(\w+)/);
        if (deleteMatch) {
          _id = deleteMatch[1];
        } else {
          console.error("Invalid DELETE format");
          return;
        }
      } else if (action === "ADD") {
        requestBody = cleanedUpdates.slice(action.length).trim();
      } else {
        console.error("Invalid action");
        return;
      }

      // Check if requestBody is valid JSON
      let parsedRequestBody;
      // try {
      //   parsedRequestBody = JSON.parse(requestBody);
      // } catch (error) {
      //   console.error("Error parsing request body as JSON:", error);
      //   return;
      // }
      if (requestBody) {
        try {
          // Remove any trailing commas and wrap property names in quotes
          requestBody = requestBody
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]")
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
          parsedRequestBody = JSON.parse(requestBody);
        } catch (error) {
          console.error("Error parsing request body as JSON:", error);
          console.error("Raw request body:", requestBody);
          return;
        }
      }

      console.log("Parsed Updates to be made:", parsedRequestBody);

      // Process the updates
      try {
        if (action === "ADD") {
          await axios.post(
            `http://localhost:5050/users/${GOOGLE_ID}/relations`,
            parsedRequestBody
          );
        } else if (action === "UPDATE") {
          const { _id, ...updateData } = parsedRequestBody;
          await axios.patch(
            `http://localhost:5050/users/${GOOGLE_ID}/relations/${_id}`,
            updateData
          );
        } else if (action === "DELETE") {
          await axios.delete(
            `http://localhost:5050/users/${GOOGLE_ID}/relations/${_id}`
          );
        }
      } catch (error) {
        console.error("Error updating database:", error);
      }
    })
    .on("error", (error) => {
      console.error("Error during streaming:", error);
    });
}

// // Watch for changes in the MongoDB collection and update the second assistant
// async function watchCollection() {
//   const peopleCollection = await db.collection("people");
//   const changeStream = peopleCollection.watch();

//   const peopleData = await fetchUserRelations("115517843777779709697");

//   changeStream.on("change", async (change) => {
//     console.log("Change detected:", change);
//     // Update peopleData with the latest data
//     peopleData = await peopleCollection.find({}).toArray();
//     console.log("Updated people data:", peopleData);

//     // Update second assistant with new json information
//     if (secondAssistantId) {
//       const secondAssistant = await openai.beta.assistants.update(
//         secondAssistantId,
//         {
//           name: "DatabaseUpdater",
//           instructions: `You are a Mongodb updater assistant. Your task is to analyze the conversation history provided to you in a message in the thread, and update the MongoDB database by adding new profiles, deleting existing ones, or modifying existing ones. Here is the current information about the user's relations in json format. ${JSON.stringify(
//             peopleData
//           )}. Follow the following formating when outputing anything:
//         1. If you see no relevant messages that would require updating the database, output ONLY "NULL".
//         2. If you see that updating the database is relevant, output "UPDATE" in the first line, and then output the request body in the following lines.
//         3. If you see that adding a new profile is relevant, output "ADD" in the first line, and then output the request body in the following lines. Note, cases when adding a new profile might be relevant is if a user mentions any name (that is not an obvious public figure) that is not in the profiles database in MongoDB.
//         4. If you see that deleting a profile is releveant, output "DELETE" in the first line, and then output the profile id in the following lines.
//         For cases 2 & 3, ensure that the request contains all existing fields and values with the needed updated value.
//         Only output in 1 of the 4 options. Do not add any extraneous comments. Include only ONE profile edit/add/delete in a single reply. Do not update mutiple people at once`,
//           tools: [{ type: "code_interpreter" }],
//           model: "gpt-4o",
//         }
//       );

//       secondAssistantId = secondAssistant.id;
//     } else {
//       await initializeSecondAssistant();
//     }
//   });
// }

// // Start watching the collection
// watchCollection();

async function watchCollection() {
  const changeStream = User.watch();

  changeStream.on("change", async (change) => {
    console.log("Change detected:", change);

    // Fetch the updated user data
    const users = await User.find({});
    const peopleData = users.flatMap((user) => user.relations);
    console.log("Updated people data:", peopleData);

    // Update second assistant with new json information
    if (secondAssistantId) {
      const secondAssistant = await openai.beta.assistants.update(
        secondAssistantId,
        {
          name: "DatabaseUpdater",
          instructions: `You are a Mongodb updater assistant. Your task is to analyze the conversation history provided to you in a message in the thread, and update the MongoDB database by adding new profiles, deleting existing ones, or modifying existing ones. Here is the current information about the user's relations in json format. ${JSON.stringify(
            peopleData
          )}. Follow the following formating when outputing anything:
        1. If you see no relevant messages that would require updating the database, output ONLY "NULL".
        2. If you see that updating the database is relevant, output "UPDATE" in the first line, and then output the request body in the following lines. Note, cases when updating might be necessary is when the user mentions a piece of information, interaction, action/reminder notification, or any other relevant information on the current person of conversation that is not in the database.
        3. If you see that adding a new profile is relevant, output "ADD" in the first line, and then output the request body in the following lines. Note, cases when adding a new profile might be relevant is if a user mentions any name (that is not an obvious public figure) that is not in the profiles database in MongoDB.
        4. If you see that deleting a profile is releveant, output "DELETE" in the first line, and then output the profile id in the following lines.
        For case 2, ensure that the request contains only necessary fields and values that need to be updated. For case 3, ensure that the request contains all necessary fields and values that need to be updated.
        Only output in 1 of the 4 options. Do not add any extraneous comments. Include only ONE profile edit/add/delete in a single reply. Do not update mutiple people at once`,
          tools: [{ type: "code_interpreter" }],
          model: "gpt-4o",
        }
      );

      secondAssistantId = secondAssistant.id;
    } else {
      await initializeSecondAssistant();
    }
  });

  changeStream.on("error", console.error);
}

// Start watching the collection
watchCollection();

// New route to process conversation history
router.post("/processConversationHistory", async (req, res) => {
  try {
    await initializeSecondAssistant();
    await processConversationHistory();
    res.status(200).send("Conversation history processed successfully");
  } catch (error) {
    console.error("Error processing conversation history:", error);
    res.status(500).send("Error processing conversation history");
  }
});

export { router as secondAssistantRouter, watchCollection };

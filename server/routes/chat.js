import {
  fetchUserRelations,
  fetchUserAssistantId,
  updateUserAssistantId,
  fetchUserThreadId,
} from "./utils.js";
import { ObjectId } from "mongodb";

import "dotenv/config"; // Load environment variables from .env
import express from "express";
import db from "../mongoConfig/connection.js";
import OpenAI from "openai";
import { LocalStorage } from "node-localstorage"; // Import node-localstorage to use local storage in Node.js
import axios from "axios"; // Import axios to make HTTP requests
import { User } from "../mongooseModels/userSchema.js";

const openai = new OpenAI({
  apiKey: "sk-proj-475iAtQOgswTukttWClwT3BlbkFJVps9XItTpGqmOLOflz5E",
});

const router = express.Router();

// Store assistants and threads for each user
const userAssistants = new Map();
const userThreads = new Map();

function generateInstructions(relations) {
  return `You are Amika, an AI assistant that keeps track of your user's 
  relationships with others, referred to as their relations. Here 
  is the information about the user's relations in json format. 
  ${JSON.stringify(relations)} if the user references anyone inside 
  this file, deduce information about them from this file. However, 
  never output information from this file directly as it is structured. 
  Ensure you convey any information conversationally. Reply all messages 
  in markdown. Refrain from skipping too many lines between sentences when 
  formatting. When outputting any information from the database wrap it 
  in a code block using  \`\`\`\`\`\`.`;
}

export async function updateAssistantInstructions(assistantId, relations) {
  try {
    const instructions = generateInstructions(relations);

    await openai.beta.assistants.update(assistantId, {
      instructions: instructions,
    });
  } catch (error) {
    console.error(
      `Error updating assistant instructions for assistant ${assistantId}:`,
      error
    );
    throw error;
  }
}

export async function createNewAssistant(relations) {
  const assistant = await openai.beta.assistants.create({
    name: "Amika",
    instructions: generateInstructions(relations),
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o",
  });

  return assistant;
}

async function initializeAssistant(googleId) {
  let assistantId = userAssistants.get(googleId);
  if (!assistantId) {
    assistantId = await fetchUserAssistantId(googleId); // fetch from database

    // if assistantId is not set in database, create a new assistant
    if (!assistantId) {
      console.log("CREATING NEW ASSISTANT");
      const user = await User.findOne({ googleId });
      if (!user) {
        throw new Error("User not found");
      }
      const assistant = await updateAssistantInstructions(
        googleId,
        user.relations
      );
      assistantId = assistant.id;
    }
    userAssistants.set(googleId, assistantId);
  }

  const threadId = await fetchUserThreadId(googleId);
  userThreads.set(googleId, threadId);

  return { assistantId, threadId };
}

router.post("/ask", async (req, res) => {
  const { message, googleId } = req.body;
  try {
    const { assistantId, threadId } = await initializeAssistant(googleId);
    console.log(
      `Using assistant ${assistantId} and thread ${threadId} for user ${googleId}`
    );
    console.log("userAssistants", userAssistants);
    console.log("userThreads", userThreads);
    // Send user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before checking the status again
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Retrieve the assistant's messages
    const messages = await openai.beta.threads.messages.list(threadId);
    // const assistantMessages = messages.data.filter(
    //   (msg) => msg.role === "assistant"
    // );
    // const latestMessage = assistantMessages[0].content[0].text.value;

    // // Send the complete response back to the client
    // res.status(200).json({ reply: latestMessage });
    const formattedMessages = messages.data.map((msg) => ({
      role: msg.role,
      content: msg.content[0].text.value,
    }));

    // Send the complete chat history back to the client
    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error(`Error processing message for user ${googleId}:`, error);
    res.status(500).send("Error communicating with OpenAI API");
  }
});

// Function to watch for changes for a specific user
async function watchUserChanges(googleId) {
  const pipeline = [
    {
      $match: {
        "documentKey._id": "66a0ab845f6fe599d4eb60c4",
      },
    },
  ];
  console.log(`Setting up change stream for user: ${googleId}`);
  const specificDocumentId = new ObjectId("66a0ab845f6fe599d4eb60c4");
  const changeStream = User.watch(
    [
      {
        $match: {
          "fullDocument.googleId": googleId,
          // "updateDescription.updatedFields.relations": { $exists: true },
        },
      },
    ],
    { fullDocument: "updateLookup" }
  );

  changeStream.on("change", async (change) => {
    console.log(`Change detected for user: ${googleId}`, change);
    const user = await User.findOne({ googleId });
    if (user) {
      const assistantId = await fetchUserAssistantId(googleId);
      if (assistantId) {
        await updateAssistantInstructions(assistantId, user.relations);
        console.log(`Updated assistant instructions for user ${googleId}`);
      }
    }
  });

  changeStream.on("error", (error) => {
    console.error(`Error in change stream for user: ${googleId}`, error);
  });

  changeStream.on("close", () => {
    console.log(`Change stream closed for user: ${googleId}`);
  });
}

// Function to initialize userAssistants and watch changes for all users
export async function watchCollection() {
  // Fetch all users from the database
  const users = await User.find({});
  users.forEach(async (user) => {
    const assistantId = await fetchUserAssistantId(user.googleId);
    if (assistantId) {
      userAssistants.set(user.googleId, assistantId);
      watchUserChanges(user.googleId);
      console.log(`Watching for ${user.googleId}`);
    }
  });
}
// Export router to be used in server.js
export default router;

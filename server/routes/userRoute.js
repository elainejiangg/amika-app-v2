import express from "express";
import { User } from "../mongooseModels/userSchema.js"; // import schemas ( & subschemas)
import { sendEmail } from "../nudgeSys/emailService.js";
import { fetchAndScheduleReminders } from "../nudgeSys/reminderUtils.js";
import { OpenAI } from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: "sk-proj-475iAtQOgswTukttWClwT3BlbkFJVps9XItTpGqmOLOflz5E",
});

///////////////////// ENDPOINTS /////////////////////

// CREATE SINGLE USER [ /users ]
router.post("/users", async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ googleId: req.body.googleId });
    if (existingUser) {
      return res.status(204).send("USER ALREADY EXISTS");
    }

    const newUserData = {
      googleId: req.body.googleId,
      name: req.body.name,
      email: req.body.email,
      picture: req.body.picture,
    };

    const newUser = new User(newUserData);

    await newUser.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR CREATING USER");
  }
});

// UPDATE SINGLE USER [ /users/:id ]
router.patch("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Update the user with the new data
    Object.assign(user, updatedData);

    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER");
  }
});

// UPDATE USER EMAIL [ /users/:googleId/email ]
router.patch("/users/:googleId/email", async (req, res) => {
  try {
    const { googleId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: "USER NOT FOUND" });
    }

    user.email = email;
    await user.save();

    res
      .status(200)
      .json({ message: "Email updated successfully", email: user.email });
  } catch (err) {
    console.error("Error updating user email:", err);
    res.status(500).json({
      error: "ERROR UPDATING USER EMAIL",
      details: err.message,
    });
  }
});

// GET USER INFO [ /users/:googleId/info ]
router.get("/users/:googleId/info", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const userInfo = {
      name: user.name,
      email: user.email,
      assistant_id: user.assistant_id,
    };

    res.status(200).send(userInfo);
  } catch (err) {
    res.status(500).send("ERROR GETTING USER INFO");
  }
});

// GET USER ASSISTANT ID [ /users/:googleId/assistant_id ]
router.get("/users/:googleId/assistant_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const assistantId = user.assistant_id;
    res.status(200).send(assistantId);
  } catch (err) {
    res.status(500).send("ERROR GETTING USER ASSISTANT ID");
  }
});

// UPDATE USER ASSISTANT ID [ /users/:googleId/assistant_id ]
router.patch("/users/:googleId/:assistant_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    user.assistant_id = req.params.assistant_id;
    await user.save();
    res.status(200).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER ASSISTANT ID");
  }
});

// GENERATE NEW USER THREAD ID & UPDATE USER THREAD IDS [ /users/:googleId/thread_id ]
router.post("/users/:googleId/thread_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Create a new thread using OpenAI API
    const thread = await openai.beta.threads.create();
    const newThreadId = thread.id;

    user.thread_ids.push(newThreadId);
    await user.save();
    res.status(200).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER THREAD ID");
  }
});

// GET USER MOST RECENT THREAD ID [ /users/:googleId/thread_id ]
router.get("/users/:googleId/thread_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const threadId = user.thread_ids[user.thread_ids.length - 1];
    res.status(200).send(threadId);
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER THREAD ID");
  }
});

// GET ALL RELATIONS of a user [ /<googleId>/relations ]
router.get("/users/:googleId/relations", async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    let relations = user.relations;
    res.status(200).send(relations);
  } catch (err) {
    res.status(500).send("ERROR GETTING RELATIONS!");
  }
});

// GET SINGLE RELATION of a user by relation _id [ /<googleId>/relations/<id> ]
router.get("/users/:googleId/relations/:id", async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    let relation = user.relations.id(req.params.id);
    if (!relation) return res.status(404).send("RELATION NOT FOUND");
    console.log(relation);
    res.status(200).send(relation);
  } catch (err) {
    res.status(500).send("ERROR GETTING RELATION!");
  }
});

// CREATE A SINGLE RELATION of a user [ /users/<googleId>/relations ]
router.post("/users/:googleId/relations", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const newRelation = {
      name: req.body.name,
      pronouns: req.body.pronouns,
      relationship_type: req.body.relationship_type,
      contact_frequency: req.body.contact_frequency,
      overview: req.body.overview,
      contact_history: req.body.contact_history,
      reminder_frequency: req.body.reminder_frequency,
      reminder_enabled: req.body.reminder_enabled,
      reminder_occurences: req.body.reminder_occurences,
    };

    user.relations.push(newRelation);
    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR CREATING RELATION");
  }
});

//UPDATE SINGLE RELATION of a user [ /users/:googleId/relations/:id ]
router.patch("/users/:googleId/relations/:id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const relation = user.relations.id(req.params.id);
    if (!relation) return res.status(404).send("RELATION NOT FOUND");

    Object.assign(relation, req.body);

    await user.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING RELATION");
  }
});

// DELETE SINGLE RELATION of a user [ /users/:googleId/relations/:id ]
router.delete("/users/:googleId/relations/:id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) {
      console.log("USER NOT FOUND");
      return res.status(404).json({ error: "USER NOT FOUND" });
    }
    const relationIndex = user.relations.findIndex(
      (relation) => relation._id.toString() === req.params.id
    );
    if (relationIndex === -1) {
      console.log("RELATION NOT FOUND");
      return res.status(404).json({ error: "RELATION NOT FOUND" });
    }
    user.relations.splice(relationIndex, 1);

    await user.save();

    console.log("Relation deleted successfully");
    res.status(200).json({ message: "Relation deleted successfully" });
  } catch (err) {
    console.error("Error deleting relation:", err);
    res.status(500).json({
      error: "ERROR DELETING RELATION",
      details: err.message,
      stack: err.stack,
    });
  }
});

//GET all reminder enabled relations of user
router.get("/users/:googleId/reminders", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    const relations = user.relations.filter(
      (relation) => relation.reminder_enabled
    );
    // const occurrences = relations.map(
    //   (relation) => relation.reminder_frequency
    // );
    res.status(200).send(relations);
  } catch (err) {
    res.status(500).send("ERROR GETTING OCCURRENCES");
  }
});

// router.post("/send-test-email", async (req, res) => {
//   try {
//     const { to, subject, text } = req.body;
//     await sendEmail(to, subject, text);
//     res.status(200).send("Email sent successfully");
//   } catch (err) {
//     res.status(500).send("ERROR SENDING EMAIL");
//   }
// });

// // GET ALL RELATIONS of a user [ /<googleId>/relations ]
// router.get("/users/:googleId/relations", async (req, res) => {
//   try {
//     let user = await User.findOne({ googleId: req.params.googleId });
//     if (!user) return res.status(404).send("USER NOT FOUND");

//     let relations = user.relations;
//     res.status(200).send(relations);
//   } catch (err) {
//     res.status(500).send("ERROR GETTING RELATIONS!");
//   }
// });

// LOGIN USER [ /login ]
router.post("/login", async (req, res) => {
  try {
    const { googleId } = req.body;
    const user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).send("USER NOT FOUND");
    }
    console.log(googleId);
    // Fetch and schedule reminders after login
    await fetchAndScheduleReminders(googleId);
    console.log("Successfully  fetch and schedule!");
    res.status(200).send("User logged in and reminders scheduled");
  } catch (err) {
    res.status(500).send("ERROR LOGGING IN USER");
  }
});

export default router;

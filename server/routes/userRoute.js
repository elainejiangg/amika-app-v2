import express from "express";
import { User } from "../mongooseModels/userSchema.js"; // import schemas ( & subschemas)
import { sendEmail } from "../emailService.js";
import { fetchAndScheduleReminders } from "../reminderUtils.js";
const router = express.Router();

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

// GET USER INFO [ /users/:googleId/info ]
router.get("/users/:googleId/info", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const userInfo = {
      name: user.name,
      email: user.email,
    };

    res.status(200).send(userInfo);
  } catch (err) {
    res.status(500).send("ERROR GETTING USER INFO");
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

// UPDATE SINGLE RELATION of a user [ /users/:googleId/relations/:id ]
router.patch("/users/:googleId/relations/:id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const relation = user.relations.id(req.params.id);
    if (!relation) return res.status(404).send("RELATION NOT FOUND");

    // Update the relation with the new data
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
    if (!user) return res.status(404).send("USER NOT FOUND");

    const relation = user.relations.id(req.params.id);
    if (!relation) return res.status(404).send("RELATION NOT FOUND");

    relation.remove();
    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR DELETING RELATION");
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

import express from "express";
import { User } from "../mongooseModels/userSchema.js"; // import schemas ( & subschemas)

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

export default router;

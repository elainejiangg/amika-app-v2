import mongoose from "mongoose";

const contactFrequencySchema = new mongoose.Schema({
  method: { type: String, required: false },
  frequency: [
    {
      number: { type: Number, required: true }, // weekly = [1, week] -> need to convert to string when feeding into GPT or tell GPT how to decipher
      unit: { type: String, required: true },
    },
  ],
});

const interactionSchema = new mongoose.Schema(
  {
    topic: { type: String, required: false },
    method: { type: String, required: false },
    date: { type: String, required: false }, // Should allow imprecise timeframes (e.g., sometime last week, year)
  },
  {
    validate: {
      validator: function (v) {
        return v.date || v.topic;
      },
      message: "At least one of topic or date is required.",
    },
  }
);

// email_body (ai-generated when sent, in code)
const reminderFrequencySchema = new mongoose.Schema({
  method: { type: String, required: true },
  frequency: [
    {
      number: { type: Number, required: true }, // weekly = [1, week] -> need to convert to string when feeding into GPT or tell GPT how to decipher
      unit: { type: String, required: true },
      start_time: { type: Date, required: true }, // Would be precalcuated based on current date and time, but user can adjust. Should auto-recalauate after day has passed
    },
  ],
});
//maybe store in another field, next reminder times and dates

const relationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Profile's name
  pronouns: { type: String, required: false },
  relationship_type: { type: String, required: false },
  contact_frequency: { type: [contactFrequencySchema], required: false }, // [method, [frequency: [number, unit of time]]]
  overview: { type: String, required: false }, //contained is interests, personality, etc.
  contact_history: { type: [interactionSchema], required: false }, //recent & notable
  reminder_frequency: { type: [reminderFrequencySchema], required: false },
  reminder_enabled: { type: Boolean, required: false },
});

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  picture: String,
  relations: { type: [relationSchema], required: false },
});

const User = mongoose.model("User", userSchema);
const Relation = mongoose.model("Relation", relationSchema);
const Interaction = mongoose.model("Interaction", interactionSchema);
const ReminderFrequency = mongoose.model(
  "ReminderFrequency",
  reminderFrequencySchema
);
const ContactFrequency = mongoose.model(
  "ContactFrequency",
  contactFrequencySchema
);
// const Chat = mongoose.model("Chat", chatSchema);

export { User };

// import mongoose from "mongoose";

// // const conversationSchema = new mongoose.Schema({
// //   date_created: { type: Date, required: true },
// //   content: { type: String, required: true },
// // });

// // const profileSchema = new mongoose.Schema({
// //   profileId: { type: String, required: true },
// //   profileName: { type: String, required: true },
// //   profileReminderEnabled: { type: Boolean, required: false },
// //   profileReminderFrequency: { type: String, required: false },
// //   profileRelationshipType: { type: String, required: false },
// //   profileConversationHistory: { type: Map, of: profileSchema, default: {} },
// //   profileInterests: { type: String, required: false },
// // });

// const profileSchema = new mongoose.Schema({
//   profileId: { type: String, required: true },
//   profileName: { type: String, required: true },
//   profilePosition: { type: String, required: true },
//   profileLevel: { type: String, required: true },
// });

// const userSchema = new mongoose.Schema({
//   googleId: { type: String, required: true, unique: true },
//   name: String,
//   email: String,
//   picture: String,
//   profiles: { type: Map, of: profileSchema, default: {} },
// });

// const User = mongoose.model("User", userSchema);

// export default User;

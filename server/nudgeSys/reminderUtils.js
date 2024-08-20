import { sendEmail } from "./emailService.js";
// import { Configuration, OpenAIApi } from "openai";
import { User } from "../mongooseModels/userSchema.js";
import cron from "node-cron";
import fetch from "node-fetch";
import { generateToken } from "./jwtUtils.js";

const OPENAI_API_KEY =
  "sk-proj-475iAtQOgswTukttWClwT3BlbkFJVps9XItTpGqmOLOflz5E";

const GPT_PROMPT = `You will generate a 20 - 50 word email body (please ONLY write an email body, no subject title)
  that asks the recipent if they have contacted the user via a certain method of contact. Mention that if they have not contacted the person 
  suggest to the recipient topics of conversation to talk about between the recipient and their 
  specified relation. Include the method of contact that the recipient should reach out to the relation.  
  Please use any of the following information about their relation to generate this email and information 
  of the recipent to address the email to. Sign off with 'Amika'. Keep a encouraging, casual tone.`;

const scheduledJobs = new Map(); // Store scheduled jobs

async function getGptRecommendation(relationInfo) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4", // Specify the model you want to use
      messages: [
        { role: "system", content: GPT_PROMPT },
        { role: "user", content: relationInfo },
      ],
      max_tokens: 100, // Limit the response length
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function scheduleEmail(reminder, googleId, userInfo) {
  const { method, relationName, occurrences, relationId } = reminder;
  occurrences.forEach((occurrence) => {
    const date = new Date(occurrence);
    const cronTime = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
      date.getMonth() + 1
    } *`;

    console.log(
      `Scheduling email for ${relationName} at ${date.toString()} using ${method}`
    );

    const job = cron.schedule(cronTime, async () => {
      const relationResponse = await fetch(
        `http://localhost:5050/users/${googleId}/relations/${relationId}`
      );
      if (!relationResponse.ok) {
        console.error("Failed to fetch relation information");
        return;
      }
      const relationInfo = await relationResponse.json();
      const filterRelationInfo = {
        relationName: relationName,
        methodOfContact: method,
        pronouns: relationInfo.pronouns,
        relationType: relationInfo.relation_type,
        overviewOfPerson: relationInfo.overview,
        contactHistory: relationInfo.contact_history,
        contactFrequency: relationInfo.contact_frequency,
        userName: userInfo.name,
      };
      const emailBody = await getGptRecommendation(
        JSON.stringify(filterRelationInfo)
      );

      // Generate a token for the user
      const token = generateToken({
        googleId: googleId,
        email: userInfo.email,
      });
      const chatLink = `http://localhost:5173/chat?token=${token}`;

      const emailContent = `${emailBody}\n\nClick [here](${chatLink}) to chat with Amika.`;

      console.log(
        `Sending email for ${relationName} at ${new Date().toString()} for ${method}`
      );

      await sendEmail(
        userInfo.email,
        `Reminder to Connect with ${relationName}! `,
        emailContent
      );
      //   await removeOccurrence(relationId, occurrence);
    });

    // Store the job in the map
    if (!scheduledJobs.has(googleId)) {
      scheduledJobs.set(googleId, []);
    }
    scheduledJobs.get(googleId).push(job);
  });
}

export async function fetchAndScheduleReminders() {
  try {
    const users = await User.find({});
    for (const user of users) {
      const googleId = user.googleId;
      const userInfo = {
        name: user.name,
        email: user.email,
      };

      user.relations.forEach((relation) => {
        if (relation.reminder_enabled) {
          relation.reminder_frequency.forEach((freq) => {
            scheduleEmail(
              {
                method: freq.method,
                relationName: relation.name,
                occurrences: freq.occurrences,
                relationId: relation._id,
              },
              googleId,
              userInfo
            );
          });
        }
      });
    }
    console.log("Successful fetch and schedule for all users");
  } catch (error) {
    console.error("Error fetching and scheduling reminders:", error);
  }
}

export function cancelScheduledEmails(googleId) {
  const jobs = scheduledJobs.get(googleId);
  if (jobs) {
    jobs.forEach((job) => job.stop());
    scheduledJobs.delete(googleId);
    console.log(`Cancelled all scheduled emails for user ${googleId}`);
  }
}

// export async function fetchAndScheduleReminders(googleId) {
//   try {
//     const relationResponse = await fetch(
//       `http://localhost:5050/users/${googleId}/reminders`
//     );
//     if (!relationResponse.ok) {
//       throw new Error("Failed to fetch reminders");
//     }

//     const relations = await relationResponse.json();
//     console.log("RELATIONS: ", relations);

//     const userResponse = await fetch(
//       `http://localhost:5050/users/${googleId}/info`
//     );
//     if (!userResponse.ok) {
//       throw new Error("Failed to fetch user information");
//     }

//     const userInfo = await userResponse.json();
//     console.log("USER INFO: ", userInfo);
//     relations.forEach((relation) => {
//       if (relation.reminder_enabled) {
//         relation.reminder_frequency.forEach((freq) => {
//           scheduleEmail(
//             {
//               method: freq.method,
//               relationName: relation.name,
//               occurrences: freq.occurrences,
//               relationId: relation._id,
//             },
//             googleId,
//             userInfo
//           );
//         });
//       }
//     });
//     console.log("successful fetch and schedule");
//   } catch (error) {
//     console.error("Error fetching and scheduling reminders:", error);
//   }
// }

// export async function fetchAndScheduleReminders(googleId) {
//   try {
//     const response = await fetch(
//       `http://localhost:5050/users/${googleId}/reminders`
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch reminders");
//     }
//     const users = await response.json();
//     users.forEach((user) => {
//       user.relations.forEach((relation) => {
//         if (relation.reminder_enabled) {
//           relation.reminder_frequency.forEach((freq) => {
//             scheduleEmail({
//               method: freq.method,
//               relationName: relation.name,
//               occurrences: freq.occurrences,
//               relationId: relation._id,
//             });
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.error("Error fetching and scheduling reminders:", error);
//   }
// }

// async function removeOccurrence(relationId, occurrence) {
//   await User.updateOne(
//     { "relations._id": relationId },
//     { $pull: { "relations.$.reminder_frequency.$[].occurrences": occurrence } }
//   );
// }
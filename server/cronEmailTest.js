import cron from "node-cron";
import { sendEmail } from "./emailService.js";

// Function to be executed by the cron job
async function sendTestEmail() {
  try {
    console.log("Sending test email at", new Date().toLocaleString());
    await sendEmail(
      "ejiang@mit.edu",
      "Test Email from Node.js",
      "This is a test email sent from Node.js using the Gmail API and a service account."
    );
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

// Schedule the cron job to run every 10 seconds
const cronTime = "*/10 * * * * *"; // Every 10 seconds

cron.schedule(cronTime, sendTestEmail);

console.log("Cron job scheduled to run every 10 seconds.");

// Keep the script running
setInterval(() => {}, 1000);

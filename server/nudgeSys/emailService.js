import { google } from "googleapis";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Load the service account key file
// const SERVICE_ACCOUNT_KEY_FILE = path.join(__dirname, "./amikaCreds.json");
// const serviceAccount = JSON.parse(
//   fs.readFileSync(SERVICE_ACCOUNT_KEY_FILE, "utf8")
// );

// // Define the email address of the user you want to impersonate
// const USER_EMAIL = "amika@amikachat.com";

// // Define the scopes required for the Gmail API
// const SCOPES = ["https://mail.google.com/"];

// // Create a JWT client
// const jwtClient = new google.auth.JWT(
//   serviceAccount.client_email,
//   null,
//   serviceAccount.private_key,
//   SCOPES,
//   USER_EMAIL
// );

// service account
// export async function sendEmail(to, subject, text, options = {}) {
//   return new Promise((resolve, reject) => {
//     jwtClient.authorize((err, tokens) => {
//       if (err) {
//         console.error("Error authorizing JWT client:", err);
//         return reject(err);
//       }

//       // Create a Nodemailer transport using the authorized JWT client
//       const transport = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           type: "OAuth2",
//           user: USER_EMAIL,
//           serviceClient: serviceAccount.client_id,
//           privateKey: serviceAccount.private_key,
//           accessToken: tokens.access_token,
//         },
//       });

//       // Define the email options
//       const mailOptions = {
//         from: `Amika <${USER_EMAIL}>`,
//         to,
//         subject,
//         text: options.isHtml ? undefined : text,
//         html: options.isHtml ? text : undefined,
//       };

//       // Send the email
//       transport.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error("Error sending email:", error);
//           return reject(error);
//         } else {
//           console.log("Email sent:", info.response);
//           return resolve(info.response);
//         }
//       });
//     });
//   });
// }

export async function sendEmail(to, subject, text, options = {}) {
  return new Promise((resolve, reject) => {
    // Create a Nodemailer transport using personal email credentials
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amikachats@gmail.com", // Replace with your email
        pass: "jfiy xfic zkdv crmx", // Replace with your email password or app password
      },
    });

    // Define the email options
    const mailOptions = {
      from: `Amika <amikachats@gmail.com>`, // Replace with your name and email
      to,
      subject,
      text: options.isHtml ? undefined : text,
      html: options.isHtml ? text : undefined,
    };

    // Send the email
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return reject(error);
      } else {
        console.log("Email sent:", info.response);
        return resolve(info.response);
      }
    });
  });
}

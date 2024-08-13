// export default RelationRow;
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { RRule } from "rrule";

const reminderFreqMap = {
  3: "Daily",
  2: "Weekly",
  1: "Monthly",
  0: "Yearly",
};

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// To display each relation row in the table
const RelationRow = (props) => {
  const [expandedReminders, setExpandedReminders] = useState({});
  const { profile } = useContext(AuthContext); // get user profile

  const toggleReminderDetails = (index) => {
    setExpandedReminders((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle ">{props.relation.name}</td>
      <td className="p-4 align-middle ">{props.relation.pronouns}</td>
      <td className="p-4 align-middle ">{props.relation.relationship_type}</td>
      <td className="p-4 align-middle ">{props.relation.overview}</td>
      <td className="p-4 align-middle ">
        <ul className="list-disc pl-0">
          {props.relation.contact_frequency.map((contact, index) => (
            <li key={index}>
              {contact.method} - {contact.frequency}
            </li>
          ))}
        </ul>
      </td>
      <td>
        <ul className="list-disc pl-0">
          {props.relation.contact_history.map((interaction, index) => (
            <li key={index}>
              {new Date(interaction.date).toLocaleString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              - {interaction.topic} - {interaction.method}
            </li>
          ))}
        </ul>
      </td>
      <td className="p-4 align-middle ">
        {props.relation.reminder_enabled ? "Yes" : "No"}
      </td>
      <td>
        <ul className="list-disc pl-0">
          {props.relation.reminder_frequency.map((reminder, index) => (
            <li key={index}>
              {reminder.method} -{" "}
              {reminderFreqMap[reminder.frequency.frequency]}
              {reminder.frequency.frequency === RRule.WEEKLY.toString() && (
                <span>
                  {" "}
                  [
                  {reminder.frequency.weekdays
                    .map((isSelected, index) =>
                      isSelected ? weekdayNames[index] : null
                    )
                    .filter(Boolean)
                    .join(", ")}
                  ]
                </span>
              )}
              <button
                onClick={() => toggleReminderDetails(index)}
                className="ml-2 text-blue-700 underline"
              >
                {expandedReminders[index] ? "Show Less" : "Show More"}
              </button>
              {expandedReminders[index] && (
                <ul className="list-none pl-4 mt-1">
                  <li>
                    Start:{" "}
                    {new Date(reminder.frequency.startDate).toLocaleString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      }
                    )}
                  </li>
                  <li>
                    End:{" "}
                    {new Date(reminder.frequency.endDate).toLocaleString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      }
                    )}
                  </li>
                  <li>
                    Occurences:{" "}
                    {reminder.occurrences
                      .map((occurrence, index) =>
                        new Date(occurrence).toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })
                      )
                      .join(" | ")}
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </td>
      {/* <td className="p-4 align-middle ">{props.relation.reminder_frequency}</td> */}

      <td className="p-4 align-middle ">
        <div className="flex gap-2">
          <Link
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
            to={`/users/${profile.id}/relations/edit/${props.relation._id}`}
          >
            Edit
          </Link>
          <button
            className="text-red-500 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
            type="button"
            onClick={() => {
              props.deleteRelation(props.relation._id);
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default RelationRow;

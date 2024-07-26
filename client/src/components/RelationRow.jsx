// export default RelationRow;
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";

// To display each relation row in the table
const RelationRow = (props) => {
  const { profile } = useContext(AuthContext); // get user profile
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
              {interaction.topic} - {interaction.method} - {interaction.date}
            </li>
          ))}
        </ul>
      </td>
      <td className="p-4 align-middle ">
        {props.relation.reminder_enabled ? "Yes" : "No"}
      </td>
      <td>
        <ul>
          {props.relation.reminder_frequency.map((reminder, index) => (
            <div key={index}>
              Method: {reminder.method}
              {/* <div>
                {reminder.frequency.map((freq, index) => (
                  <li key={index}>
                    {freq.number} {freq.unit} starting from{" "}
                    {new Date(freq.start_time).toLocaleString()}
                  </li>
                ))}
              </div> */}
            </div>
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
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
            color="red"
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

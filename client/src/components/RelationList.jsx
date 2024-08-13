import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RelationRow from "./RelationRow";
import { AuthContext } from "../AuthContext";

export default function RelationsList() {
  const [relations, setRelations] = useState([]);
  const { profile } = useContext(AuthContext); // get user profile
  const navigate = useNavigate();

  // Method to fetch all relations from the database.
  useEffect(() => {
    async function getRelations() {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations`
      );
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const relationsResponse = await response.json();
      setRelations(relationsResponse);
      console.log("RELATIONS: ", relations);
    }
    getRelations();
  }, [profile]);

  // Method to delete a relation
  async function deleteRelation(relationId) {
    try {
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${relationId}`,
        {
          method: "DELETE",
        }
      );

      const newRelations = relations.filter((el) => el._id !== relationId);
      setRelations(newRelations);
    } catch (error) {
      console.error("Error deleting relation:", error);
      // Optionally, you could set an error state here to display to the user
    }
  }

  // This method will map out the relations on the table
  function relationList() {
    return relations.map((relation) => {
      return (
        <RelationRow
          relation={relation}
          deleteRelation={deleteRelation}
          key={relation._id}
        />
      );
    });
  }

  // This following section will display the table with the relations of individuals.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">Relations</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm ">
            <thead className="[&amp;_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Name
                </th>

                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Pronouns
                </th>

                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Relationship Type
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Overview
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Contact Frequency
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Contact History
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Reminder Enabled
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Reminder Frequency
                </th>

                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&amp;_tr:last-child]:border-0">
              {relationList()}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <button
          className="bg-white fixed bottom-4 right-4 inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          onClick={() => navigate("/users/relations")}
        >
          Create Relation
        </button>
      </div>
    </>
  );
}

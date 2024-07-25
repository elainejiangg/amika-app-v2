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
      const relations = await response.json();
      console.log("RELATIONS: ", relations);
      setRelations(relations);
    }
    getRelations();
  }, [profile]);

  // Method to delete a relation
  async function deleteRelation(relationId) {
    await fetch(
      `http://localhost:5050/users/${profile.id}/relations/${relationId}`,
      {
        method: "DELETE",
      }
    );
    const newRelations = relations.filter((el) => el._id !== relationId);
    setRelations(newRelations);
  }

  // This method will map out the relations on the table
  function relationList() {
    return relations.map((relation) => {
      return (
        <RelationRow
          relation={relation}
          deleteRelation={() => deleteRelation(relation._id)}
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
          <table className="w-full caption-bottom text-sm">
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
      <button
        className="fixed bottom-4 right-4 inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
        onClick={() => navigate("/users/relations")}
      >
        Create Relation
      </button>
    </>
  );
}

// import { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import RelationRow from "./RelationRow";
// import { AuthContext } from "../AuthContext";

// export default function RelationsList() {
//   const [relations, setRelations] = useState([]);
//   const { profile, setProfile } = useContext(AuthContext); // get user profile
//   const navigate = useNavigate();

//   // Method to fetch all relations from the database.
//   // Reload page when page initial loads
//   useEffect(() => {
//     async function getRelations() {
//       const response = await fetch(
//         `http://localhost:5050/${profile.googleId}/relations`
//       );
//       if (!response.ok) {
//         const message = `An error occurred: ${response.statusText}`;
//         console.error(message);
//         return;
//       }
//       const relations = await response.json();
//       console.log("RELATIONS: ", relations);
//       setRelations(relations);
//     }
//     getRelations();
//   }, [relations.length, profile.googleId]);

//   //Method to delete a relation
//   async function deleteRelation(profileId) {
//     await fetch(
//       `http://localhost:5050/${profile.googleId}/relations/${profileId}`,
//       {
//         method: "DELETE",
//       }
//     );
//     const newRelations = relations.filter((el) => el.profileId !== profileId);
//     setRelations(newRelations);
//   }

//   // This method will map out the relations on the table
//   function relationList() {
//     return relations.map((relation) => {
//       return (
//         <RelationRow
//           relation={relation}
//           deleteRelation={() => deleteRelation(relation._id)}
//           key={relation._id}
//         />
//       );
//     });
//   }

//   // This following section will display the table with the relations of individuals.
//   return (
//     <>
//       <h3 className="text-lg font-semibold p-4">Relations</h3>
//       <div className="border rounded-lg overflow-hidden">
//         <div className="relative w-full overflow-auto">
//           <table className="w-full caption-bottom text-sm">
//             <thead className="[&amp;_tr]:border-b">
//               <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
//                 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
//                   Name
//                 </th>
//                 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
//                   Position
//                 </th>
//                 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
//                   Level
//                 </th>
//                 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="[&amp;_tr:last-child]:border-0">
//               {relationList()}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <button
//         className="fixed bottom-4 right-4 inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3 items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
//         onClick={() => navigate("/create")}
//       >
//         Create Profile
//       </button>
//     </>
//   );
// }

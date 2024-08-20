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
      // console.log("RELATIONS: ", relations);
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
    }
  }

  // This method will map out the relations on the table
  function relationList() {
    return relations.map((relation) => {
      return (
        <div className="bg-white bg-gradient-to-t from-indigo-100 to-sky-50 rounded-3xl p-4 max-w-80 min-w-64 h-96">
          <RelationRow
            relation={relation}
            deleteRelation={deleteRelation}
            key={relation._id}
          />
        </div>
      );
    });
  }

  return (
    <div className="pt-8 pb-12 px-4 h-screen">
      {relations.length === 0 && (
        <div className="flex h-full w-full justify-center items-center text-center">
          <div className="text-slate-300 ">
            <p>No Information on your Relations.</p>
            <p>Add relations using the "+"!</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-6 gap-x-2 sm:gap-x-[10px] pb-12">
        {relationList()}
      </div>

      <div className="mt-4">
        <button
          className="bg-indigo-300 hover:bg-sky-100 hover:border hover:border-slate-900 fixed bottom-4 right-4 flex items-center justify-center rounded-full h-12 w-12"
          onClick={() => navigate("/users/relations")}
        >
          <svg
            className="w-6 h-6 text-bold text-2xl"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

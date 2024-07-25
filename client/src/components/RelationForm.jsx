import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Name from "./RelationFormComponents/Name";
import Pronouns from "./RelationFormComponents/Pronouns";
import Overview from "./RelationFormComponents/Overview";
import RelationshipType from "./RelationFormComponents/RelationshipType";
import ContactHistory from "./RelationFormComponents/ContactHistory";
// import ContactFrequency from "./RelationFormComponents/ContactFrequency";
import ReminderEnabled from "./RelationFormComponents/ReminderEnabled";
// component to help display each record in the recordlist
export default function RelationForm() {
  const [form, setForm] = useState({
    name: "",
    pronouns: "",
    relationship_type: "",
    contact_frequency: [],
    overview: "",
    contact_history: [],
    reminder_frequency: [],
    reminder_enabled: false,
  });
  const [isNew, setIsNew] = useState(true); // identifies if creating new record
  const params = useParams();
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);

  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if (!id) return;
      setIsNew(false);
      const response = await fetch(
        `http://localhost:5050/users/${profile.id}/relations/${id}`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const record = await response.json();
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/relations");
        return;
      }
      setForm(record);
    }
    fetchData();
  }, [params.id, navigate, profile]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const relation = { ...form };
    try {
      let response;
      if (isNew) {
        response = await fetch(
          `http://localhost:5050/users/${profile.id}/relations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(relation),
          }
        );
      } else {
        response = await fetch(
          `http://localhost:5050/users/${profile.id}/relations/${params.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(relation),
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred adding or updating a record: ", error);
    } finally {
      setForm({
        name: "",
        pronouns: "",
        relationship_type: "",
        contact_frequency: [],
        overview: "",
        contact_history: [],
        reminder_frequency: [],
        reminder_enabled: false,
      });
      navigate("/relations");
    }
  }

  // This following section will display the form that takes the input from the user.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">Relation Form</h3>
      <form
        onSubmit={onSubmit}
        className="border rounded-lg overflow-hidden p-4"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-slate-900/10 pb-12 md:grid-cols-2">
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">
              Relation Info
            </h2>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 ">
            <Name form={form} updateForm={updateForm} />
            <Pronouns form={form} updateForm={updateForm} />
            <RelationshipType form={form} updateForm={updateForm} />
            <Overview form={form} updateForm={updateForm} />
            <ReminderEnabled form={form} updateForm={updateForm} />
            <ContactHistory
              history={form.contact_history}
              setHistory={(newHistory) =>
                updateForm({ contact_history: newHistory })
              }
            />
          </div>
        </div>
        <input
          type="submit"
          value="Save Relation"
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
        />
      </form>
    </>
  );
}
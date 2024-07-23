import { NavLink } from "react-router-dom"; // links to other pages in application
import { useContext } from "react";

import { googleLogout } from "@react-oauth/google";
import { AuthContext } from "../AuthContext";

export default function Navbar() {
  const { profile, setProfile } = useContext(AuthContext);
  const logOut = () => {
    googleLogout();
    setProfile(null);
  };
  return (
    <div>
      <nav className="flex justify-between items-center mb-6">
        <NavLink
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to="/records"
        >
          Records
        </NavLink>

        <NavLink
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to="/create"
        >
          Create Employee
        </NavLink>

        <NavLink
          className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to="/"
          onClick={logOut}
        >
          <div className="flex flex-col items-center">
            <p>Sign Out</p>
            <p
              style={{
                fontSize: "10px",
                lineHeight: "0.5",
                paddingBottom: "5px",
              }}
            >
              Signed-in as: {profile.name}
            </p>
          </div>
        </NavLink>
      </nav>
    </div>
  );
}

// import { NavLink, useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();

//   const handleSignOut = () => {
//     // Add your sign-out logic here (e.g., clearing tokens)
//     navigate("/");
//   };

//   return (
//     <div>
//       <nav className="flex justify-between items-center mb-6">
//         <NavLink
//           className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
//           to="/"
//         >
//           Records
//         </NavLink>
//         <NavLink
//           className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
//           to="/create"
//         >
//           Create Employee
//         </NavLink>
//         <button
//           onClick={handleSignOut}
//           className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
//         >
//           Sign Out
//         </button>
//       </nav>
//     </div>
//   );
// }

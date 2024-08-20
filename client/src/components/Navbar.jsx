import { NavLink } from "react-router-dom";
import { useContext, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";
import { AuthContext } from "../AuthContext";
// import jwtDecode from "jwt-decode";

export default function Navbar({ toggleNavbar, xVisible }) {
  const { profile, setProfile } = useContext(AuthContext);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      const decoded = jwtDecode(token);
      fetch(`http://localhost:5050/users/${decoded.googleId}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setProfile(data);
        })
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [setProfile]);

  const logOut = () => {
    googleLogout();
    setProfile(null);
    sessionStorage.removeItem("chatHistory");
  };

  if (!profile) {
    return "Loading"; // or a loading spinner, or redirect to login
  }

  return (
    <div className="flex flex-col p-6 h-screen bg-indigo-50">
      {xVisible && (
        <button className="self-end mb-4 p-2" onClick={toggleNavbar}>
          <svg
            className="w-6 h-6 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      )}

      <nav className="flex flex-col justify-between items-center mb-8">
        <div className="flex flex-row p-0 md:p-2 pt-4 w-full items-center justify-start space-x-2">
          <img
            src={profile.picture}
            className={`rounded-full h-14 hidden md:block ${
              profile.picture ? "block" : "hidden"
            }`}
            alt="Profile"
            onLoad={(e) => (e.target.style.display = "block")}
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="pl-0 py-3">
            <p className="leading-4 font-bold text-lg tracking-tight">
              {profile.name.toUpperCase()}
            </p>
            <NavLink
              to="/"
              className="leading-3 text-sm top-1 rounded-xl py-1 hover:text-blue-600 hover:font-bold"
              onClick={logOut}
            >
              Sign Out
            </NavLink>
          </div>
        </div>
        <NavLink
          className=" my-1 font-semibold py-3 p-2 bg-sky-950 text-center text-white rounded-md w-full text-sm md:text-lg hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          to="/relations"
        >
          Relations
        </NavLink>
        <NavLink
          className=" my-1 font-semibold py-3 p-2 bg-sky-950 text-center text-white rounded-md w-full text-sm md:text-lg hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          to="/chat"
        >
          Chat
        </NavLink>
        <NavLink
          className=" my-1 font-semibold py-3 p-2 bg-sky-950 text-center text-white rounded-md w-full text-sm md:text-lg hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
          to="/settings"
        >
          Settings
        </NavLink>
      </nav>
    </div>
  );
}

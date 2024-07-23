// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     // Add your login logic here (e.g., API call to authenticate user)
//     // For now, we'll just navigate to the main page
//     navigate("/records");
//   };

//   return (
//     <div>
//       <button
//         onClick={handleLogin}
//         className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
//       >
//         LOGIN HERE
//       </button>
//     </div>
//   );
// }

import React, { useState, useEffect, useContext } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function Login() {
  const [user, setUser] = useState(null);
  const { profile, setProfile } = useContext(AuthContext);

  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed: ", error),
  });

  useEffect(() => {
    if (user) {
      fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setProfile(data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <h1 className="font-black text-3xl">AMIKA</h1>
      {profile == null ? (
        <button
          onClick={() => login()}
          className="mt-1.5 inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
        >
          Sign in with Google
        </button>
      ) : (
        navigate("/records")
        // <div>
        //   <img src={profile.picture} />
        //   <h3> User logged in </h3>
        //   <p> Name: {profile.name}</p>
        //   <p> Id: {profile.id}</p>
        //   <p> Email: {profile.email}</p>
        //   <br />
        //   <br />
        //   <button onClick={logOut}> Log out</button>
        // </div>
      )}
    </div>
  );
}

export default Login;

// import React, { useState, useEffect, useContext } from "react";
// import { useGoogleLogin } from "@react-oauth/google";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../AuthContext";

// function Login() {
//   const [user, setUser] = useState(null);
//   const { profile, setProfile } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const login = useGoogleLogin({
//     onSuccess: (codeResponse) => setUser(codeResponse),
//     onError: (error) => console.log("Login Failed: ", error),
//   });

//   useEffect(() => {
//     if (user) {
//       setLoading(true);
//       fetch(
//         `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
//         {
//           headers: {
//             Authorization: `Bearer ${user.access_token}`,
//             Accept: "application/json",
//           },
//         }
//       )
//         .then((response) => response.json())
//         .then((data) => {
//           setProfile(data);
//           console.log("_________________-DATA:", data);
//         })
//         .catch((err) => {
//           console.log(err);
//           setLoading(false);
//         });
//     }
//   }, [user, setProfile]);

//   useEffect(() => {
//     if (profile) {
//       fetch("http://localhost:5050/users", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           googleId: profile.id,
//           name: profile.name,
//           email: profile.email,
//           picture: profile.picture,
//         }),
//       });
//     }
//   }, [profile, navigate]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="flex flex-col justify-center items-center h-screen w-screen">
//       <h1 className="font-black text-3xl">AMIKA</h1>
//       {profile == null ? (
//         <button
//           onClick={() => login()}
//           className="mt-1.5 inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
//         >
//           Sign in with Google
//         </button>
//       ) : (
//         navigate("/relations")
//       )}
//     </div>
//   );
// }

// export default Login;

import React, { useState, useEffect, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
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
          // Call the new route to store the user profile
          fetch("http://localhost:5050/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              googleId: data.id,
              name: data.name,
              email: data.email,
              picture: data.picture,
            }),
          });
        })
        .catch((err) =>
          console.log(`ERROR GETTING PROFILE FROM GOOGLE API ${err}`)
        );
    }
  }, [user]);

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
        navigate("/relations")
      )}
    </div>
  );
}

export default Login;

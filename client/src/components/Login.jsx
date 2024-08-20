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
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-gradient-to-tr from-indigo-100 via-white to-blue-100">
      <h1
        className="font-black text-5xl lg:text-6xl text-indigo-950 wildy-sans"
        style={{ fontFamily: "Wildly Sans, sans-serif" }}
      >
        Amika
      </h1>
      {profile == null ? (
        <button
          onClick={() => login()}
          className="mt-4 lg:mt-5 items-center justify-center bg-sky-950 font-bold text-white border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-1 hover:bg-sky-100 hover:text-sky-950 hover:border hover:border-sky-950"
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

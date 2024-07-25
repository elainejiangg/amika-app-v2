import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // react router updates only the portion of the website that is changed instead of the entire website; essential for responsiveness
import App from "./App";
import RelationForm from "./components/RelationForm";
import RelationList from "./components/RelationList";
import Login from "./components/Login";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthContext";

const clientId =
  "182357756258-759f39bnehg84lammns3g3rcvnqjte2u.apps.googleusercontent.com";

// App is displayed on every load, outlet in App.jsx changes out what is loaded below as a child depending on the path
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Login />,
//   },
//   {
//     path: "/relations",
//     element: <App />,
//     children: [
//       {
//         path: "/relations",
//         element: <RelationList />,
//       },
//     ],
//   },
//   {
//     path: "/users/relations",
//     element: <App />,
//     children: [
//       {
//         path: "/users/relations",
//         element: <RelationForm />,
//       },
//     ],
//   },
//   {
//     path: "edit/:id",
//     element: <App />,
//     children: [
//       {
//         path: "edit/:id",
//         element: <RelationForm />,
//       },
//     ],
//   },
// ]);

// App is displayed on every load, outlet in App.jsx changes out what is loaded below as a child depending on the path
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/relations",
    element: <App />,
    children: [
      {
        path: "/relations",
        element: <RelationList />,
      },
    ],
  },
  {
    path: "/users/relations",
    element: <App />,
    children: [
      {
        path: "/users/relations",
        element: <RelationForm />,
      },
    ],
  },
  {
    path: "/users/:googleId/relations/edit/:id",
    element: <App />,
    children: [
      {
        path: "/users/:googleId/relations/edit/:id",
        element: <RelationForm />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </AuthProvider>
  </GoogleOAuthProvider>
);

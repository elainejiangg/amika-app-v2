// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

// import * as React from "react";
// import * as ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom"; // react router updates only the portion of the website that is changed instead of the entire website; essential for responsiveness
// import App from "./App";
// import Record from "./components/Record";
// import RecordList from "./components/RecordList";
// import "./index.css";

// // App is displayed on every load, outlet in App.jsx changes out what is loaded below as a child depending on the path
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         path: "/",
//         element: <RecordList />,
//       },
//     ],
//   },
//   {
//     path: "/create",
//     element: <App />,
//     children: [
//       {
//         path: "/create",
//         element: <Record />,
//       },
//     ],
//   },
//   {
//     path: "/edit/:id",
//     element: <App />,
//     children: [
//       {
//         path: "/edit/:id",
//         element: <Record />,
//       },
//     ],
//   },
// ]);

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // react router updates only the portion of the website that is changed instead of the entire website; essential for responsiveness
import App from "./App";
import RecordForm from "./components/RecordForm";
import RecordList from "./components/RecordList";
import Login from "./components/Login";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthContext";

const clientId =
  "182357756258-759f39bnehg84lammns3g3rcvnqjte2u.apps.googleusercontent.com";

// App is displayed on every load, outlet in App.jsx changes out what is loaded below as a child depending on the path
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/records",
    element: <App />,
    children: [
      {
        path: "/records",
        element: <RecordList />,
      },
    ],
  },
  {
    path: "/create",
    element: <App />,
    children: [
      {
        path: "/create",
        element: <RecordForm />,
      },
    ],
  },
  {
    path: "/edit/:id",
    element: <App />,
    children: [
      {
        path: "/edit/:id",
        element: <RecordForm />,
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

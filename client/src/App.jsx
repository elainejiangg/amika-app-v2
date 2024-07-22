import { Outlet } from "react-router-dom"; // displays child components defined in routes in main.jsx
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="w-full p-6">
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App;

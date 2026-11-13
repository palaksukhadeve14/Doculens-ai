import { Routes,Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoutes from "./components/ProtectedRoutes";
import HomeRedirect from "./components/HomeRedirect";

function App(){
  return(
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/dashboard"  
      element={
        <ProtectedRoutes>
      <Dashboard />
      </ProtectedRoutes>
       }
      />
      <Route path="/login"  element={<Login />} />
      <Route path="/register"  element={<Register />} />
    </Routes>
  )
}
export default App;
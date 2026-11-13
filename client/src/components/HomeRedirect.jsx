import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function HomeRedirect(){
    const {loading,isAuthenticated}=useAuth();
    if(loading)
    {
        return <p>Checking Authentication...</p>;
    }
    if(isAuthenticated){
        return <Navigate to='/dashboard' replace />
    }
    return <Navigate to='/register' replace /> 
}
export default HomeRedirect;
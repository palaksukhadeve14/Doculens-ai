import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoutes({children})
{
    const {loading,isAuthenticated}=useAuth();
    if(loading)
    {
        return <p>Checking Authentication...</p>
    }
    if(isAuthenticated){
        return children;
    }
    return <Navigate to='/login' replace />
    
}
export default ProtectedRoutes;
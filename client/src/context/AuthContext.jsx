import { useState,useEffect,useContext,createContext } from "react";

 const AuthContext= createContext();

 export const AuthProvider= ({children})=>{
    const [user,setuser] = useState(null);
    const [loading,setloading]= useState(true);
    useEffect(()=>{
        const checkAuth=async ()=>{
            try{
            const response= await fetch('http://localhost:3000/api/auth/me',{
                credentials:'include'
            });
            if(!response.ok)
            {
               setuser(null);
               return;
            }
            const data= await response.json();
            setuser(data.user);
        }
        catch(error)
        {
            console.error("Authentication check failed",error.message);
            setuser(null);
        }
        finally{
            setloading(false);
        }
    };
    checkAuth();
    },[]);

    const isAuthenticated=Boolean(user);
    return(
        <AuthContext.Provider value={{user,setuser,loading,isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
 };

 export const useAuth = ()=>{
    return useContext(AuthContext);
 }
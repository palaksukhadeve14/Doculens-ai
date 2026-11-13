import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import { useState } from "react";

function Header() {
    const { setuser } = useAuth();
    const [error, seterror] = useState('')
    const navigate = useNavigate();
    const handlelogout = async (event) => {

        try {
            const response = await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Logout failed');
            }

            setuser(null);
            navigate('/register');
        }
        catch (error) {
            seterror(error.message);
        }
    }
    return (
        <header className="mb-8">
            <div className="flex justify-end mb-2">
                <button
                    className="border border-slate-600 rounded-lg px-4 py-2 text-white bg-slate-900/60 text-sm font-medium text-slate-300 transition-colors hover:bg-blue-500/10 hover:text-blue-300"
                    type="button"
                    onClick={handlelogout}>Logout</button>
            </div>
            <h1 className='text-2xl font-bold text-center tracking-wide text-white'>PDF
                <span className="text-blue-400"> AI</span> ASSISTANT</h1>
            <p className='mt-4 text-sm text-gray-200 text-center'>Upload a PDF and ASK question about it</p>

            {error && (
                <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
            )}
        </header>
    )
}
export default Header
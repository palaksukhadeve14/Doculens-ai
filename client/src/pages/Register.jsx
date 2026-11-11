import { useState } from "react"
import { Link,useNavigate } from "react-router-dom";

 function Register() {

    const [name, setname] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [loading,setloading]=useState(false);
    const [error,seterror]=useState('');
    const [success,setsuccess]=useState('');

     const navigate=useNavigate();

     const handleSubmit = async (event) => {
        event.preventDefault();
       
        setloading(true);
        seterror('');
        try{
        const response = await fetch('http://localhost:3000/api/auth/register',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                name,
                email,
                password
            })
        }); 
        const data = await response.json();
        if(!response.ok)
        {
            throw new Error(data.message || 'Registration failed');
        }
        setsuccess(data.message);
        
        navigate('/login');
    }
    catch(error){
        seterror(error.message);
    }
    finally{
        setloading(false);
    }
    };
    return (
        <div className="app-background min-h-screen flex items-center justify-center p-4 text-white">
            <div className="blue-sphere" />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Doculens<span className="text-blue-400">AI</span></h1>
                    <p className="pt-2 text-sm text-slate-400">Create your account to get started.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm text-slate-white">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setname(event.target.value)}
                            placeholder="Enter your name"
                            required
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setemail(event.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setpassword(event.target.value)}
                            placeholder="Create a password"
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                <button type='submit'
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-medium transition hover:bg-blue-500">{loading?'Creating Account..':'Create Account'}</button>
                </form>
                <p className="">Already have an account?{' '}
                    <Link
                    to='/login'
                    className="font-medium text-blue-400 hover:text-blue-300">Login</Link>
                </p>
            </div>
        </div>
    )
}
export default Register;
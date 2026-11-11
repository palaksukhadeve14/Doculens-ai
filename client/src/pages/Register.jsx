import { useState } from "react"
import { Link } from "react-router-dom";

function Register() {
    const [name, setname] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const handleSubmit = (event) => {
        event.preventDefault();

        //backend registration integration comes next
        console.log({ name, email, password });
    }
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
                            onChange={(event) => setEmail(event.target.value)}
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
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Create a password"
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                    </div>
                <button type='submit'
                className="w-full rounded-lg bg-blue-600 py-3 font-medium transition hover:bg-blue-500">Create Account</button>
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
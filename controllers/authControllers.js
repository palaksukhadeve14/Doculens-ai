const User = require("../models/User");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if ( typeof name !== 'string' || typeof email !== 'string' || typeof password !=='string' || !name.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({
                error: "Please provide valid name,email and password"
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be atleast 8 characters long"
            });
        }
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                error: "user already registered"
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "User registered Successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.error("Registration error : ", error);
        if(error.code === 11000)
        {
            return res.status(409).json({
                error:"Email is already registered"
            });
        }
        return res.status(500).json({
            error: "Server error during registration"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if ( typeof email !=='string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
            return res.status(400).json({
                error: 'Please provide valid email and password'
            });
        }
        if(password.length<8)
        {
            return res.status(400).json({
                error:"Password length must be 8 characters long"
            }
            )
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email:normalizedEmail }).select('+password');

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                console.error('Session regeneration error:', error);

                return res.status(500).json({
                    error: 'Could not create session'
                });
            }

            req.session.userId = user._id.toString();

            req.session.save((error) => {
                if (error) {
                    console.error('Session save error:', error);

                    return res.status(500).json({
                        error: 'Could not save session'
                    });
                }

                return res.status(200).json({
                    message: 'Login successful',
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                });
            });
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            error: 'Server error during login'
        });
    }
};
const getMe = (req, res) => {
    res.set('Cache-Control', 'no-store');
    return res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
}
const logout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("logout error : ", error.message);

            return res.status(500).json({
                error: "Could not logout"
            });
        }
        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: '/'
        });
        return res.status(200).json({
            message: "Logout successfully"
        });
    });
}
module.exports = { register, login, getMe, logout };
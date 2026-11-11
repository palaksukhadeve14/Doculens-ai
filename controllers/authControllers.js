const User=require("../models/User");
const bcrypt=require("bcrypt");

const register=async (req,res)=>{
    try{
    const {name,email,password}=req.body;

    if(!name || !email || !password)
    {
        return res.status(400).json({
            message:"All fields are require"
        });
    }
    const existingUser= await User.findOne({email});
    if(existingUser)
    {
        return res.status(409).json({
            message:"user already registered"
        });
    }
    const hashedPassword=await bcrypt.hash(password,12);
    const newUser=await User.create({
        name,email,password:hashedPassword
    });
    return res.status(201).json({
        message:"User registered Successfully",
        user:{
            id:newUser._id,
            name:newUser.name,
            email:newUser.email
        }
    });
}
catch(error)
{
    console.error("Registration error : ",error.message);

    return res.status(400).json({
        message:"Server error during registration"
    });
}
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                console.error('Session regeneration error:', error);

                return res.status(500).json({
                    message: 'Could not create session'
                });
            }

            req.session.userId = user._id.toString();

            req.session.save((error) => {
                if (error) {
                    console.error('Session save error:', error);

                    return res.status(500).json({
                        message: 'Could not save session'
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
            message: 'Server error during login'
        });
    }
};
const getMe=(req,res)=>{
    res.set('Cache-Control','no-store');
    return res.status(200).json({
    user:{
        id:req.user._id,
        name:req.user.name,
        email:req.user.email
    }
    });
}
const logout=(req,res)=>{
    req.session.destroy((error)=>{
        if(error)
        {
            console.error("logout error : ",error.message);

            return res.status(500).json({
                message:"Could not logout"
            });
        }
    });
    res.clearCookie('connect.sid',{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            path:'/'
        });
        return res.status(200).json({
            message:"Logout successfully"
        });
}
module.exports = {register,login,getMe,logout};
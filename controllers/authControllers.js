const User=require("../models/User");
const bcrypt=require("bcrypt");

const require=async (req,res)=>{
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
        message:"User registered Successfully"
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
module.exports = {register};
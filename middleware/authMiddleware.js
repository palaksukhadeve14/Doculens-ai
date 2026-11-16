const User=require('../models/User');

const authMiddleware = async (req, res, next) => {
    // console.log('AUTH MIDDLEWARE EXECUTED');
    try{
        if(!req.session.userId)
        {
            return res.status(401).json({
                error :'Unauthorized.Pleae login first.'
            });
        }
        // console.log('Session ID:', req.sessionID);
// console.log('Session userId:', req.session.userId);
        const user=await User.findById(req.session.userId);
        if(!user)
        {
            return res.status(401).json({
                error :"user not found.Please login again"
            });
        }
        req.user=user;
        next();
    }
    catch(error)
    {
        console.error("Authentication Error : ",error.message);
        return res.status(500).json({
            error:"Authentication failed"
        });
    }
}

module.exports=authMiddleware;
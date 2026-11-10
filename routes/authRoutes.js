const express=require('express');
const router=express.Router();

const {register,login,getMe}=require('../controllers/authControllers');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register',register);
router.post('/login',login);
router.get('/me',authMiddleware,getMe)

module.exports=router;


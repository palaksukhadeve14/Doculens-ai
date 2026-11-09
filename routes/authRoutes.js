const express=require('express');
const router=express.Router();

const {register}=require('../controllers/authControllers');

router.post('/register');

module.exports=router;


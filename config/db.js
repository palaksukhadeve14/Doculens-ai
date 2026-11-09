const mongoose=require("mongoose");

const connectDB=async ()=>{
    try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDb connection successfull");
}
catch(error)
{
    console.error("MongoDb connection failed : ",error.message);
    process.exit(1);
}
};
module.exports=connectDB;
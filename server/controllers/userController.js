import userModel  from "../models/userModel.js";

export const getUserData =async(req,res)=>{
    try{
      // Get userId from req.user (set by userAuth middleware)
      const userId = req.user.id || req.user.userId;
      
      if (!userId) {
        return res.json({success:false, message:"User ID not found in request"});
      }

      const user = await userModel.findById(userId);

      if(!user){
        return res.json({success:false, message:"user not found"});
      }

      return res.json({success:true,userData:{
        name:user.name,
        isAccountVerified:user.isAccountVerified,
      }})


    }catch(error){
        console.log("Error in getUserData:", error);
        res.json({success:false,message:error.message})
    }
}
import jwt from 'jsonwebtoken';

const userAuth = async (req,res,next)=>{
   const {token} =req.cookies;


   if(!token){
        return res.json({success:false,message: 'Not Authorized. Login Again'})
   }

   try{
 
    const tokenDecode = jwt.verify(token,process.env.Jwt_SECRET);
    if(tokenDecode.id){
        req.user={userId : tokenDecode.id}
    }
    else{
      console.log("Auth failed: token decoded without id", tokenDecode)
        return res.json({success:false,message:'Not Authoried. Login Again'})
    }

    next();
   }
   catch(error){
     console.error("JWT verify error:", error && error.message ? error.message : error)
     return res.json({success:false,message: 'Not Authorized. Login Again'})

   }
}

 export default userAuth;
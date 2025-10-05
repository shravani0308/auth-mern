import jwt from 'jsonwebtoken';

const userAuth = async (req,res,next)=>{
   const {token} =req.cookies;
  console.log("token",token)
   if(!token){
    console.log("Auth failed: no token")
        return res.json({success:false,message: 'Not Authorized. Login Again'})
   }

   try{
    const tokenDecode = jwt.verify(token,process.env.Jwt_SECRET);
    
    // Ensure req.body exists before setting userId
    console.log("req.body",req.body)
    if(!req.body) {
        req.body = {};
    }
    
    if(tokenDecode && tokenDecode.id){
        req.user = { id: tokenDecode.id, userId: tokenDecode.id };
    }
    else{
      
        return res.json({success:false,message:'Not Authorized. Login Again'});
    }
  
    next();
   }
   catch(error){

    return res.json({success:false,message: 'Not Authorized. Login Again'});
   }
}

export default userAuth;
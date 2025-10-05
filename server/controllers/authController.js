import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';


export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.Jwt_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Generate OTP for email verification
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // ✅ Send welcome email here
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to GreatStarts! 🎉',
     text:`Welcome to GreatStarts! 🎉  
Your account has been successfully created using the email ID: ${email}.  
We’re excited to have you on board!
`    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const login = async (req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return res.json({success:false,message:'Email and password are required'})
    }
    try{

        const user =await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(! isMatch){
           return res.json({success:false,message:'Invalid password'})
   
        }

const token =jwt.sign({id:user._id}, process.env.Jwt_SECRET, {expiresIn:'7d'});

       res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:process.env.NODE_ENV === 'production' ? 'none': 'strict',
        maxAge:7 * 24* 60* 60* 1000
       });


        //sending welcome email
         const mailOptions ={
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:'welcome to greatstarts website. Your account ',
            text:`welcome to greatstarts website. your account has been
            created with email id: ${email}`
         }

      const info = await transporter.sendMail(mailOptions);
console.log("✅ Email sent:", info.response);

       return res.json({success:true});

    }catch(error){
            res.json({success : false,message :error.message})

    }

}

export const logout = async (req,res)=>{
    try{
      res.clearCookie('token',{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:process.env.NODE_ENV === 'production' ? 'none': 'strict',
      })

      return res.json({success:true,message:"Logged Out"})
    }catch(error){
   res.json({success : false,message :error.message})

    }
}

// swnd verfication OTP to User's Email
// export const sendVerifyOtp  =async (req,res)=>{
//     try{

//       const{userId} =req.body;

//       const user = await userModel.findById(userId);

//       if(user.isAccountVerified){
//         return res.json({success:false, message:"Account Already verified"})
//       }
// const otp = String(Math.floor(100000 + Math.random() * 900000));

//     user.verifyOtp = otp;
//     user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

// let email=user.email;
// await user.save();

// const mailOption ={
//             from:process.env.SENDER_EMAIL,
//             to:email,
//             subject:'Account verfication OTP ',
//             text:`your OTP is ${otp}. Verify your account using this OTP`
//          }
//  const ing= await transporter.sendMail(mailOption);
//  console.log("✅ otp sent to Email :", ing.response);


//   res.json({success:true,message:'verification OTP Sent on mail'})
//     }catch(error){
//  res.json({success: false,message:error.message});
        
//     }
// }

export const sendVerifyOtp =async (req,res)=>{
 try{

 const{userId} =req.user;

 const user = await userModel.findById(userId);

 if(!user){
 return res.json({success:false, message:"User not found"});
 }

 if(user.isAccountVerified){
 return res.json({success:false, message:"Account Already verified"})
 }

 const otp = String(Math.floor(100000 + Math.random() * 900000));

 user.verifyOtp = otp;
 user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
 const email = user.email; 

 await user.save();

 const mailOption ={
 from:process.env.SENDER_EMAIL,
 to:email,
 subject:'Account verfication OTP ',
 text:`your OTP is ${otp}. Verify your account using this OTP`
 }
 const ing= await transporter.sendMail(mailOption);
 console.log("✅ otp sent to Email :", ing.response);

 res.json({success:true,message:'verification OTP Sent on mail'})
 }catch(error){
 res.json({success: false,message:error.message});
 }
}

//verfiy the email using otp
export const  verifyEmail = async (req,res)=>{
  const {otp}= req.body;
 const userId= req.user.id || req.user.userId;
  if(!userId  || !otp){
    return res.json({success:false, message:'Missing Details'})
  }
  try{

    const user = await userModel.findById(userId);

    if(!user){
    return res.json({success:false,message:'User not found'});

    }

    if(user.verifyOtp === '' || user.verifyOtp !== otp){
    return res.json({success:false,message:'User not found'});

    }
   if(user.verifyOtpExpireAt < Date.now()){
    return res.json({success:false,message:'OTP Expried'});
   }
   user.isAccountVerified =true;
   user.verifyOtp = '';
   user.verifyOtpExpireAt = 0;

   await user.save();
   return res.json({success:true,user:user, message:'Email verfied successfully'});
   console.log("verifyEmail req.body:", req.body);

  }
  catch(error){
    return res.json({success:false,message:'Invaild OTP'})
  }
}

//check if user is authenticted
export const isAuthenticed = async(req,res)=>{
try{
  
    return res.json({success:true});
}catch(error){
  res.json({success:false,message:'error.message'});
}
}

//send password reset otp 
export const sendResetOtp= async(req,res)=>{
    const {email}=req.body;

    if(!email){
      return res.json({success:false,message:'Email is required'})
    }
    try{
       const user = await userModel.findOne({email});
       if(!user){
        return res.json({
          success:false,message:"user not found"
        });
       }
const otp = String(Math.floor(100000 + Math.random() * 900000));

 user.resetOtp = otp;
 user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
//  const email = user.email; 

 await user.save();

 const mailOption ={
 from:process.env.SENDER_EMAIL,
 to:email,
 subject:'Password Reset OTP',
//  text:`Your OTP for resetting your password is ${otp}.Use the OTP to proceed with resettung your password`
html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)

}

await transporter.sendMail(mailOption);

return res.json({success:true,message:'OTP  to your email'})
    }

    catch(error){
      res.json({success:false,message:error.message})
    }
}

//reset user password
export const resetPassword =async (req,res)=>{
    const {email,otp,newPassword}=req.body;

    if(!email || !otp || !newPassword){
      return res.json({success:false,message:'email ,otp ,and password are required'});
    }

    try{
      const user = await userModel.findOne({email});

      if(!user){
        return res.json({success:false,message:"usernot found"});

      }
      if(user.resetOtp === "" || user.resetOtp !== otp){
        return res.json({success:false,message:'Invaild OTP'});
      }

      if(user.resetOtpExpireAt <Date.now()){
        return res.json({success:false,message:"OTP Expried"});
      }

      const hashedPassword =await bcrypt
.hash(newPassword,10);

user.password =hashedPassword;
user.resetOtp= "";
user.resetOtpExpireAt=0;

await user.save();

        return res.json({success:true,message:'password has been reset successfully'});

    }catch(error){
      res.json({success:false,message:error.message});
    }
}


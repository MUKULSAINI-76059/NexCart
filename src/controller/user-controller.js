const userModel = require("../models/user-model");
const sessionModel = require("../models/session-model")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {sendRegistrationEmail, sendPasswordResetOTPEmail, sendOTPVerifiedEmail, sendPasswordResetSuccessEmail} = require("../services/email-service");
require("dotenv").config();

async function registerUser(req, res) {

try {
  //Input validation
  const { firstName, lastName, email, password, role } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  
    //Find if user already exists
    const isUser = await userModel.findOne({ email });
    if (isUser) {
      return res.status(400).json({ message: "User already exists." });
    }
   
    //Hash the password before saving to database
    const hash = await bcrypt.hash(password, 10);

    //Create new user in database
    const userRegister = await userModel.create({
      firstName,
      lastName,
      email,
      password: hash,
      role: role || "user", 
    });
 
    //Generate a verification token and send email to user
    const token = jwt.sign(
      { email: userRegister.email, _id: userRegister._id },
      process.env.SECRET_KEY,
      { expiresIn: "10min" },
    );

    //Generate verification link and send email to user
    const port = process.env.PORT 
    const verifyLink = `http://localhost:${port}/api/verify?token=${token}`;

    //Send registration email to user
    await sendRegistrationEmail(userRegister.email, userRegister.firstName+" "+userRegister.lastName, verifyLink)

    return res.status(201).json({
        message: "User registered successfully.",
        userData: userRegister,
      });
  } catch (err) {
    console.log("registerUser Error : ", err);
    return res.status(400).json({ message: err.message });
  }
}

async function verifyUser(req, res) {

  //verify the token sent in query params
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Unauthorized user." });
  }
  try {
    //Verify the token and find the user in database
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    //If user is found
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    //verify the user and save to database
    user.isVerified = true;
    await user.save();

    //Generate an auth token and set it in cookie
    const authToken = jwt.sign({ _id: user._id, email:user.email }, process.env.SECRET_KEY);
    res.cookie("token", authToken, { httpOnly: true });

    return res.status(200).json({ message: "User verified successfully." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token expired." });
    }
    return res.status(400).json({ message: "Invalid token." });
  }
}

async function loginUser(req, res){
  // Check if request body exists
  if (!req.body) {
    return res.status(400).json({ message: "Request body is required." });
  }

  //Input validation
  const {email, password} = req.body;
  if(!email || !password){
    return res.status(400).json({message:"All fields are required."})
  }
  try{
    //Find user and check its verified or not
    const user = await userModel.findOne({email});
    if(!user){
      return res.status(400).json({message:"User not found."})
    }
    if(!user.isVerified){
      return res.status(400).json({message:"Please verify your email before logging in."})
    }

    //Match password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      return res.status(400).json({message:"Invalid credentials."})
    }

    //Generate token with expire in 10 days
    const authToken = jwt.sign({ _id: user._id, email:user.email }, process.env.SECRET_KEY,{ expiresIn: "10d" });
    res.cookie("token", authToken, { httpOnly: true });

    //Set isLoggedIn to true and save to database
    user.isLoggedIn = true;
    await user.save();


    //Check if session already exists for user, if yes then delete it and create a new session
    const isSession = await sessionModel.findOne({userId:user._id})
    if(isSession){
      await sessionModel.findByIdAndDelete(isSession._id)
    }

    // Create a new session
    const session = await sessionModel.create({userId: user._id});

    return res.status(200).json({ message: `Welcome ${user.firstName}, login successful.`, authToken });

  } catch (error) {
    return res.status(400).json({message:"Error occurred while logging in."})
  }
}

async function logoutUser(req,res){
  try{
   
    //Set isLoggedIn to false and delete the session from database
    req.user.isLoggedIn = false;
    await req.user.save();
    await sessionModel.findOneAndDelete({userId:req.user._id})

    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });

    return res.status(200).json({message:"Logout successful."})

  } catch (error) {
    return res.status(400).json({message:error.message})
  }
}

async function otpSend(req, res){
  try{
    // Check if request body exists
    const email = req.body?.email;
    if (!req.body) {
      return res.status(400).json({ message: "Request body is required." });
    }

    
    if(!email){
      return res.status(400).json({message:"Email is required."})
    }
    const user = await userModel.findOne({email:email})
    if(!user){
      return res.status(400).json({message:"User not found."})
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    await sendPasswordResetOTPEmail(user.email, user.firstName+" "+user.lastName, otp)
    return res.status(200).json({message:"OTP sent to email."})
  } catch (error) {
    return res.status(400).json({message:error.message})
  }
}

async function verifyOTP(req, res){
  try{
    const {otp} = req.body;
    console.log("OTP:", otp);
    if(!otp){
      return res.status(400).json({message:"OTP is required."})
    }
    const user = await userModel.findOne({otp:otp, otpExpiry:{$gt:Date.now()}})
    if(!user){
      return res.status(400).json({message:"Invalid OTP."})
    }
    if(user.otpExpiry < Date.now()){
      return res.status(400).json({message:"OTP expired."})
    }
    if(user.otp !== otp){
      return res.status(400).json({message:"Invalid OTP."})
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    await sendOTPVerifiedEmail(user.email, user.firstName+" "+user.lastName, otp)

    return res.status(200).json({message:"OTP verified successfully."})
  } catch (error) {
    return res.status(400).json({message:error.message})
  }
}

async function passwordReset(req, res){
  
  try{
  
    const {confirmPassword,email, newPassword} = req.body;
    if(!email || !newPassword || !confirmPassword){
      return res.status(400).json({message:"All fields are required."})
    }
    const user = await userModel.findOne({email:email})
    if(!user){
      return res.status(400).json({message:"User not found."})
    }
    if(newPassword !== confirmPassword){
      return res.status(400).json({message:"New password and confirm password do not match."})
    }
    console.log(user.token)
    const hash = await bcrypt.hash(newPassword, 10)
    const oldPassword = user.password;
     if(await bcrypt.compare(newPassword, oldPassword)){
      return res.status(400).json({message:"New password cannot be same as old password."})
    }
    user.password = hash;
    await user.save();
    await sendPasswordResetSuccessEmail(user.email, user.firstName+" "+user.lastName);
    return res.status(200).json({message:"Password reset successful."})
  } catch (error) {
    return res.status(400).json({message:error.message})

  }
}

async function allUsers(req,res){
  try{
    const users = await userModel.find();
    return res.status(200).json({message:"All users fetched successfully.", users})
  } catch (error) {
    return res.status(400).json({message:error.message})
  }
}

async function deleteUser(req,res){
  try{
    const {token} = req.cookies;
    if(!token){
      return res.status(400).json({message:"Unauthorized user."})
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await userModel.findByIdAndDelete(decoded._id);
    if(!user){
      return res.status(400).json({message:"User not found."})
    } 
    return res.status(200).json({message:"User deleted successfully."})
  }catch(error){
    return res.status(400).json({message:error.message})
  } 
}

module.exports = { registerUser, verifyUser, loginUser, logoutUser, otpSend, verifyOTP, passwordReset, allUsers, deleteUser };

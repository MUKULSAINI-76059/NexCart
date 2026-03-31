const jwt = require("jsonwebtoken")
const userModel = require("../models/user-model")
const bcrypt = require("bcrypt")
require("dotenv").config();

async function authMiddleware(req, res, next){
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({message:"Unauthorized user. "})
        }
        let decoded;
        try{
             decoded = jwt.verify(token, process.env.SECRET_KEY)
        } catch (error) {
            if(error.name === "TokenExpiredError"){
                return res.status(400).json({message:"Token expired."})
            }
            return res.status(400).json({message:"Invalid token."})
        }
            const user = await userModel.findById(decoded._id)
            if(!user){
                return res.status(400).json({message:"User not found"})
            }
            req.user = user;
            next();
        
    } catch (error) {
        return res.status(400).json({message:error.message})

    }
}

async function isAdmin(req, res, next){
    try{
        if(req.user.role !== "admin"){
            return res.status(403).json({message:"Access denied. Admins only."})
        }
        next();
    } catch (error) {
        return res.status(400).json({message:error.message})

    }
}
module.exports = {authMiddleware, isAdmin}
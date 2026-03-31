const express = require("express")
const router = express.Router()
const  {registerUser, verifyUser, loginUser, logoutUser, otpSend, verifyOTP, passwordReset, deleteUser, allUsers} = require("../controller/user-controller")
const {authMiddleware, isAdmin} = require("../middlewares/auth-middleware")


router.post("/register", registerUser)
router.get("/verify", verifyUser)
router.post("/login", loginUser)
router.post("/otp", otpSend)
router.get("/delete", authMiddleware, deleteUser)
router.post("/otp/verify", verifyOTP)
router.get("/users", authMiddleware, isAdmin, allUsers)
router.post("/password-reset", passwordReset)
router.get("/logout", authMiddleware, logoutUser)

module.exports = router
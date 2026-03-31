const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required."],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required."],
  },
  profilePic: {
    type: String,
    default: "",
  },
  profilePublicId: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: [true, "Email must be required."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password must be required."],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  token: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Number,
    default: null,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
},{timestamps:true});

module.exports = mongoose.model("user", userSchema)

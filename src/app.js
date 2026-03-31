const express = require("express")
const app = express()
const userRouter = require("./routes/user-route")
const cookieParser = require("cookie-parser")

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use("/api", userRouter)


module.exports = app
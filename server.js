const app = require("./src/app")
const dns = require("dns")
const connectDB = require("./src/db/db")
require("dotenv").config()
dns.setServers(['8.8.8.8','8.8.4.4'])
connectDB()


const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`http://localhost:${port}`)
})
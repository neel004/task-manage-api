const express = require('express')
const userRouter = require('../src/routers/users')
const taskRouter = require('../src/routers/tasks')
require('./db/mongoose')
const app = express()
const port = process.env.PORT

//without express middleware req->route handler
//with express middleware req->do something=>route handler

// // app.use((req,res,next)=>{
// //     if(req.method === "GET"){
// //         res.send("Get Requests are disabled")
// //     }else{
// //         next()
// //     }
    
// // })
// app.use((req,res,next)=>{
//     const maintainance = true
//     if(maintainance){
//         res.status(503).send("Servers are in maintainance , Check back soon")
//     }
//     else{
//         next()
//     }
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("server is up on port %d",port)
})
const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendGoodByEmail} = require('../emails/account')
const router = new express.Router()

router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(401).send(e)
    }
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        return res.send({ user ,token })
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/me', auth , async (req,res)=>{
    try{
        res.send(req.user)
    }catch(e){
        res.status(400).send()        
    }   
})

router.patch('/users/me',auth , async(req,res)=>{
    const allowedUpdates = ['name','email','password','age']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update) )
    if(!isValidOperation){
        return res.status(400).send({Error: "Invalid Updates Requested."})
    }
    try{
        // //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new : true,runValidators : true})
        //const user = await User.findById(req.params.id)
        updates.forEach((update)=>req.user[update] = req.body[update])
        await req.user.save()  
        res.send(req.user)        
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout',auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    }catch(e){  
        res.status(500).send()

    }
})

router.post('/users/logoutall',auth , async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

const avatar = multer({
    limits :{
        fileSize : 1000000
    },
    fileFilter(rea,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error("Please upload png , jpg or jpeg file"))
        }
        cb(undefined,true)
    }

})

router.post('/users/me/avatar', auth, avatar.single('avatar') ,async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width : 250 ,height : 250}).png().toBuffer() 
    req.user.avatar = buffer
    await req.user.save()
    res.send("Avatar is Uploaded")     
},(error,req,res,next)=>{
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined 
    await req.user.save()
    res.status(200).send()
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        console.log(e)
        res.status(404).send()
    }
})

router.delete('/users/me',auth , async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send({Error : "User With current id not found"})
        // }
        await req.user.remove()
        // const email = req.user.email
        // const name = req.user.name
        sendGoodByEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        console.log(e)
        res.status(400).send({Error : "Error Deleting Object"})
    }
    
})


module.exports = router
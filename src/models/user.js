const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        unique : true,
        type : String,
        required : true ,
        trim : true,
        lowercase : true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error("Email is invalid!")
            }
        }
    },
    password:{
        type : String,
        required : true,
        minLength : 6,
        trim:true,
        validate(password){
            if(password.toLowerCase().includes("password")){
                throw new Error("!!Password cant be the\"password\" it self!! ")
            }
        }

    },
    age : {
        type : Number,
        validate(age) {
            if(age < 0){
                throw new Error("Age must be positive number")
            }
        },
        default: 12
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
},{
    timestamps : true
})

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        
        throw new Error("Unable to login")
    }
    const isMatch = await bcrypt.compare(password , user.password)
    if(!isMatch){
        throw new Error("Unable to login")
    }
    return user
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id : user._id.toString() },process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject._id
    delete userObject.__v
    delete userObject.avatar
    return userObject
}
//Hash the plaintext password before saving
userSchema.pre('save' ,async function (next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8 )
    }
    next()
})

userSchema.post('remove' , async function(next){
    const user =this
    await Task.deleteMany({owner : user._id})
    //next() is removed by me as i was forcing errors due to it.
})

userSchema.virtual('tasks',{
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

const User = mongoose.model('User',userSchema)

module.exports = User

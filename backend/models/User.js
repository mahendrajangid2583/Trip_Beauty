import mongoose from 'mongoose'
const userSchema= new mongoose.Schema({
    name:{type:String,required:true,trim:true},
    handle:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},
    gender:{type:Boolean,requried:true},//0:female and 1: male
    dob:{type:Date,required:true},
    email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},
    password:{type:String,required:true},
    profilePic:{
        url:{type:String},
        public_id:{type:String},//for cloudinary
        },
     //i want to add a field to define if it's a pro account or not (has user subscribed to pro features )
    proAccount:{type:Boolean,default:false},
    subscriptionStatus: { type: String, enum: ['normal','premium','travel_pro'], default: 'normal' }
    },{
        timestamps:true
    },
   


);
const User=mongoose.model("User",userSchema);
export default User;
//User.find()
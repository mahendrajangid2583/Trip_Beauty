import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateTokens.js";
import setAuthCookie from "../utils/setAuthCookes.js";

export const registerUser=async(req,res)=>{
    try{
        const{name,handle,gender,dob,email,password}=req.body;
        if(!name || !handle || !email || !password ||!gender ||!dob){
            return res.status(400).json({message:"Please provid all required fields"});

        }
        const existing=await User.findOne ({email});
        if(existing)return res.status(400).json({message:"Email already in use"});
        const existingHandle= await User.findOne({handle});
        if(existingHandle) return res.status(400).json({message:"Handle already in use"});
        //hash password
        const salt =await bcrypt.genSalt(10);
        const hashed=await bcrypt.hash(password,salt);
        //handle profile pic if uploaded
        let profilePic={};
        if(req.file&&req.file.path){
            profilePic={
                url:req.file.path,
                public_id:undefined,
            };
        }
        const user=await User.create({
            name,
            handle,
            gender,
            dob,
            email,
            password:hashed,
            profilePic,
            proAccount
        })
        const token=generateToken(user);
        setAuthCookie(res, token);
        res.status(201).json({
            token,
            user:{id:user._id,name:user.name,email:user.email,handle:user.handle,gender:user.gender,profilePic:user.profilePic,proAccount:user.proAccount},
        });
    }catch(err){
        console.error(err);
        res.status(500).json({messange:"server error"});

    }
};

//Login
export const loginUser=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password)return res.status(400).json({message:"Provide email and password"});
        const user=await User.findOne({email});
        if(!user)return res.status(401).json({message:"Invalid credentials"});
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)return res.status(401).json({message:"Invalid credentials"});
        const token=generateToken(user);
        res.json({
            token,
            user:{id:user._id,name:user.name,email:user.email,handle:user.handle,gender:user.gender,profilePic:user.profilePic},
        })

    }catch(err){
        console.error(err);
        res.status(500).json({message:"server error"});
    }
};
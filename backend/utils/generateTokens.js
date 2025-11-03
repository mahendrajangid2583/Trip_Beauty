import jwt from "jsonwebtoken"
const generateToken=(user)=>{
    return jwt.sign(
        { id: user._id, name:user.name, email:user.email, handle:user.handle, dob:user.dob, gender:user.gender },
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES_IN || "7d"}
    );
};
export default generateToken;
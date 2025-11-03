import {v2 as cloudinary} from "cloudinary";
//for configuration of account
import {CloudinaryStorage} from "multer-storage-cloudinary";
//acts as bridge tellint how to store files to cloudianry
import multer from "multer";
//multer is nodejs middlewhere designed to handle file upload
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});
const storage=new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"profile-pics",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation:[{width:800,height:800,crop:"limit"}],
    },
});
const parser=multer({storage});
export {cloudinary, parser};
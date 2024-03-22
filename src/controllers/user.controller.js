import Dress from "../models/dress.model.js";
import User from "../models/user.model.js";
import DRESSUSER from "../models/userDress.model.js"
import USERDRESS from "../models/userDress.model.js";
import USERCUSTOMDRESS from "../models/userCustomDress.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
    
        if(!user){
            throw new ApiError(400, "User Not Exist");
        }
    
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
    
        if(!(accessToken && refreshToken)){
            throw new ApiError(500, "Token Not generated");
        }
    
        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});
    
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, error?.message || "Token Not Generated")
    }
} 

const registerUser = asyncHandler( async (req, res) => {
    try {
        const {name, phoneNumber, email, password} = req.body;
        if(!(name && phoneNumber && email && password)){
            throw new ApiError(400, "All fields are required");
        }
        
        if(!email.includes("@"))
            throw new ApiError(400, "Email syntax is wrong");
        
        
        const isUser = await User.findOne({
            $or: [{phoneNumber}, {email}]
        })
        
        if(isUser){
            throw new ApiError(400, "User Already Exist");
        }
        
        const user = await User.create({
            name,
            phoneNumber,
            email, 
            password
        });
        
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        return res.status(200).json(
            new ApiResponse(200, createdUser, "User Created Successfully")
        )

    } catch (error) {
        throw new ApiError(400, error.message);
    }
})



const loginUser = asyncHandler( async (req, res) => {
    try {
        const {phoneNumber, password} = req.body;

        if(!(phoneNumber && password)){
            throw new ApiError(400, "Field Required");
        }

        const user = await User.findOne({phoneNumber});

        if(!user){
            return res.status(400)
            .json(
                new ApiError(404, "User not exist")
            )
            throw new ApiError(400, "User not exist");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if(!isPasswordCorrect){
            throw new ApiError(400, "Password is Incorrect");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {createdUser}, "User Login Successfully")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "User not login")
    }
})

const logoutUser = asyncHandler( async (req, res) => {
    try {
        const user_id = req.user?._id;

        if(!user_id)
            throw new ApiError(400, "UnAuthorized Access");

        const user = await User.findByIdAndUpdate(
            user_id, 
            {
                $set: {refreshToken: ""}
            }
            , 
            {
                new: true
            }
        ).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(201, {user}, "User Logout Successfully")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "User Not Get Logout")
    }
} )


// Refresh the Access Token


//  For User To Upload Dresses Which will show in Cart Page Of User And Admin Page
const userDressUpload = asyncHandler( async (req, res) => {
    try {
        let { dressName, phoneNumber, details } = req.body;
        const userId = req.user?._id;

        const user = await User.findById(userId).select("-password -refreshToken");

        if(!dressName || !phoneNumber){
            throw new ApiError(400, "Field Reuired");
        }

        phoneNumber = Number(phoneNumber)
        const dressCount = await USERDRESS.aggregate([
            {
                $match:{
                    phoneNumber: phoneNumber
                }
            }
        ])

        
        

        console.log("Dress before uploded localpath");
        console.log("REQ FILE: ", req.file)
        const dressImageLocalPath = await req.file?.path;
        console.log("Dress After uploded localpath");
        console.log(dressImageLocalPath)
        if(!dressImageLocalPath){
            throw new ApiError(400, "Uploaded of Dress image in local path failed");
        }
        
        console.log("Dress after after uploaded localpath");
        const dressImage = await uploadOnCloudinary(dressImageLocalPath);
        console.log("Dress after uploaded cloudinary");

        if(!dressImage){
            throw new ApiError(400, "Dress Image Not Uploaded In Cloudinary");
        }
        
        const userDress = await USERDRESS.create({
            dressName,
            phoneNumber,
            dressImage: dressImage.url,
            details
        })

        return res.status(200)
        .json(
            new ApiResponse(201, {user, userDress}, "User Dress Uploaded Successfully")
        )


        
    } catch (error) {
        throw new ApiError(400, error?.message || "Dress Not Uploaded")
    }
})


// For Searching a particular dress from dress section by user
const particularDressSection = asyncHandler( async (req, res) => {
    try {
        const { dressName } = req.body;

        const user = await User.findById(req.user?._id);

        if(!user){
            throw new ApiError(400, "Unauthorized Access");
        }

        const allDress = await Dress.aggregate([
            {
                $match:{
                    name: dressName 
                }
            }
        ])

        if(!allDress){
            throw new ApiError(400, "Dress Not Present")
        }

        return res.status(201)
        .json(
            new ApiResponse(201, {allDress}, "Dress Selected Successfully")
        )
        
    } catch (error) {
        throw new ApiError(400, error?.message || "Not Get Particular Dress");
    }
})




// Route for user all coustom design dress
const allCustomDresses = asyncHandler( async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if(!user){
            throw new ApiError(500, "Internal Server Error")
        }

        const allCoustomDresses = await USERCUSTOMDRESS.find();

        return res.status(200).json(
            new ApiResponse(200, {allCoustomDresses}, "Success")
        )
    } catch (error) {
        throw new ApiError(400, "Cannot fetched User Coustom Dresses")
    }
})


// Route for Particular user custom design in previous order section
const particularCustomDress = asyncHandler( async(req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)

        if(!user){
            throw new ApiError(400, "Unauthorized Access")
        }

        const userCustomDress = await USERCUSTOMDRESS.aggregate([
            {
                $match:{
                    phoneNumber: user.phoneNumber
                }
            }
        ])

        if(!userCustomDress){
            throw new ApiError(400, "User Particular Dress Not Fetched")
        }

        return res.status(200)
        .json(
            new ApiResponse(200, {userCustomDress}, "User Dress Successfully Fetched")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "Particular dress not fetched from user custom dresses")
    }
} )


// is User Auth
const isUserAuth = asyncHandler( async (req, res) => {
    try {
        const isAccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!isAccessToken){
            let isRefreshToken = req.cookies?.refreshToken;
            if(!isRefreshToken){
                return res.status(400).json({
                    message: "Plz Login or Sign Up",
                    success: false
                })
            }
            const decode_val = jwt.verify(isRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
            if(!decode_val){
                return res.status(400).json({
                    message: "Plz Login or Sign Up",
                    success: false
                })
            }

            const {accessToken, refreshToken} = await generateAccessAndRefreshToken(decode_val._id);
            const decode_acc = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
            
            const user = await User.findById(decode_acc._id).select("-password -refreshToken");

            const options = {
                httpOnly: true,
                secure: true
            }

            return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "User Authorized",
                data: {user},
                success: true
            })
        }
        else{
            const decode_acc = jwt.verify(isAccessToken, process.env.ACCESS_TOKEN_SECRET_KEY);

            if(!decode_acc){
                return res.json(
                    {
                        message: "Plz Login Fisrt",
                        success: false
                    }
                )
            }
            
            const user = await User.findById(decode_acc._id).select("-password -refreshToken");

            res.status(200)
            .json({
                message: "User Authorized",
                data: {user},
                success: true
            })
        }   
    } catch (error) {
        console.log(error?.message || "NOT AUTH USER");
    }
})


// User Who select dress from dress section 
const userDressFromDressSection = asyncHandler(async (req, res) => {
    try {
        let { dressName, phoneNumber, dressImage, price, details } = req.body;

        if(!(dressName && phoneNumber && dressImage && price && details)){
            throw new ApiError(500, "Server Error, All Field Required")
        }

        phoneNumber = Number(phoneNumber)
        price = Number(price)
        const user_dress = await USERDRESS.create({
            dressName,
            phoneNumber,
            dressImage,
            price,
            details,
            stage: false,
        })

        if(!user_dress){
            throw new ApiError(500, "Server Error, Dress not Uploaded")
        }

        res.status(200)
        .json(
            new ApiResponse(200, user_dress, "Dress uploaded Successfully")
        )

    } catch (error) {
        throw new ApiError(400, error);
    }
})



// Getting particular User Dress how ordered or get custom dress design and data From USERDRESS Section For Cart of user
const particularUserDressFromUserDress = asyncHandler( async (req, res) => {
    try {
        const user_id = req.user._id;
    
        const user = await User.findById(user_id);
    
        if(!user){
            throw new ApiError(400, "Un Authorized Access")
        }
    
        const phoneNumber = user.phoneNumber;

        const userDress = await USERDRESS.aggregate([
            {
                $match: {
                    phoneNumber: phoneNumber
                }
            }
        ])

        res.status(200)
        .json(
            new ApiResponse(200, userDress, "User Dress Fetched Successfully")
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Un Authorized Access")
    }


})


// Delete Order From Cart For User
const deleteOrder = asyncHandler( async (req, res) => {
    try {
        const {dress_id} = req.body;
        console.log(dress_id)

        const user = await USERDRESS.findOne({_id: dress_id});

        await USERDRESS.findOneAndDelete({_id: dress_id})

        res.status(200)
        .json(
            new ApiResponse(200, {}, "Order Deleted Successfully")
        )
    } catch (error) {
        console.log(error)
    }
})

export { registerUser, loginUser, logoutUser,
        userDressUpload, particularDressSection,
        allCustomDresses, particularCustomDress, isUserAuth,
        userDressFromDressSection, particularUserDressFromUserDress, deleteOrder
    }
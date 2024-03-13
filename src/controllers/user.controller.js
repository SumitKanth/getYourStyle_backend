import Dress from "../models/dress.model.js";
import User from "../models/user.model.js";
import DRESSUSER from "../models/userDress.model.js"
import USERDRESS from "../models/userDress.model.js";
import USERCUSTOMDRESS from "../models/userCustomDress.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    let dressNamePresentErr = "Same Dress Name is already present in your cart, so plz provide unique dress name"
    let isDressNamePresent = false;
    try {
        let { dressName, phoneNumber, details } = req.body;
        const userId = req.user?._id;

        const user = await User.findById(userId).select("-password -refreshToken");

        if(!dressName || !phoneNumber){
            throw new ApiError(400, "Field Reuired");
        }

        phoneNumber = Number(phoneNumber)
        const userByNumber = await USERDRESS.aggregate([
            {
                $match:{
                    phoneNumber: phoneNumber
                }
            },
        ])

        for(let i=0; i<userByNumber.length; i++){
            if(userByNumber[i].dressName === dressName){
                isDressNamePresent = true;
                break;
            }
        }
        
        if(isDressNamePresent){
            throw new ApiError(400, dressNamePresentErr)
        }

        console.log("Dress before uploded localpath");
        const dressImageLocalPath = req.file?.path;
        console.log("Dress After uploded localpath");
        console.log(dressImageLocalPath)
        if(!dressImageLocalPath){
            throw new ApiError(400, "Uploaded of Dress image failed");
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
        if(isDressNamePresent){
            throw new ApiError(400, dressNamePresentErr)
        }
        else throw new ApiError(400, error?.message || "Dress Not Uploaded")
    }
})


// Route for fetching all dresses
const allDress = asyncHandler( async(req, res) => {
    try {
        
        const dresses = await Dress.find();

        if(!dresses){
            throw new ApiError(400, "All dresses not fetched")
        }

        return res.status(200).json(
            new ApiResponse(200, dresses, "All dresses Fetched Successfully")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "All Dresses Not Feteched")
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


// Route When Order Get Completed
const orderCompleted = asyncHandler( async (req, res) => {
    try {
        const { phoneNumber, dressName } = req.body;

        if(!(phoneNumber && dressName)){
            throw new ApiError(400, "Provide phoneNumber and dressName")
        }

        const user = await User.findOne({phoneNumber});
        if(!user){
            throw new ApiError(400, "Unauthorized Access")
        }

        console.log("Before user dress finding");
        const dressUser = await DRESSUSER.findOne({
            $and: [{phoneNumber}, {dressName}]
        });


        if(!dressUser)
            throw new ApiError(400, "Phone Number or Dress Name is wrong")
        
        console.log("Before Creatintg User Dress Completed");
        console.log("Number Type: ", typeof(phoneNumber));

        console.log("dressUser: ", dressUser)

        const userCustomDress = await USERCUSTOMDRESS.create({
            dressName,
            phoneNumber,
            dressImage: dressUser.dressImage,
            price: dressUser.price,
            details: dressUser.details || "Dress Image"
        })
        
        console.log("After Creatintg User Dress Completed");

        if(!userCustomDress)
            throw new ApiError(400, "user dress is not completed")

        const orderCompleted = await DRESSUSER.deleteOne({
            $and: [{phoneNumber}, {dressName}]
        })

        if(!orderCompleted){
            throw new ApiError(400, "Dress Not Present")
        }

        return res.status(201)
        .json(
            new ApiResponse(201, {userCustomDress}, "Order Completed")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "Order Not Completed")
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


// Updating price and stage of user custom dress
const updatingUserCustomDressPrice = asyncHandler( async(req, res) => {
    try {
        
        const userId = req.user._id;
        const { dressName, price } = req.body;

        const userDress = await USERDRESS.findOneAndUpdate({dressName},
            {
                $set: {price, stage: true}
            },
            {
                new: true
            }
            );

        if(!userDress){
            throw new ApiError(400, "User Dress Not Found")
        }


        return res.status(200).
        json(
            new ApiResponse(200, {userDress}, "User price and Stage Updated Successfully")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "User Price and Stage Not Updated")
    }
})

export { registerUser, loginUser, logoutUser,
        userDressUpload, allDress, particularDressSection,
        orderCompleted, allCustomDresses, particularCustomDress,
        updatingUserCustomDressPrice
    }
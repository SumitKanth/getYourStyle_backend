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


// Dress upload by admin in dress section
const dressUpload = asyncHandler(async (req, res) => {
    console.log("I am here")
    try {
        const {dressName, price, details} = req.body;
    
        const dressImageLocalPath = req.file?.path;
        if(!dressImageLocalPath){
            throw new ApiError(400, 'Dress not Uploaded in multer')
        }

        const dressImage = await uploadOnCloudinary(dressImageLocalPath);
        
        if(!dressImage){
            throw new ApiError(400, "Dress not uploaded in cloudinary")
        }
    
        const dress = await Dress.create({
            name: dressName,
            image: dressImage.url,
            price,
            details
        })
    
        return res.status(200)
        .json(
            new ApiResponse(200, dress, 'Dress Uploaded Successfully')
        )
    } catch (error) {
        console.log("I am here")
        throw new ApiError(400, error?.message || "Dress not Uploded")
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

export {
    updatingUserCustomDressPrice, dressUpload, allDress
}
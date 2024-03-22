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
const updatingUserCustomDressPriceAnduserDressOrderInfo = asyncHandler( async(req, res) => {
    try {
        let { dress_id, price, phoneNumber, orderInfo } = req.body;

        price = Number(price)
        const user = await USERDRESS.aggregate([
            {
                $match:{
                    phoneNumber: phoneNumber
                }
            }
        ])

        if(!user){
            throw new ApiError(400, "User Not Found")
        }

        const userDress = await USERDRESS.findOneAndUpdate({_id: dress_id}, 
            {
                $set: {price, stage: true, orderInfo}
            },
            {
                new: true
            }
            )

        return res.status(200).
        json(
            new ApiResponse(200, userDress, "User price and Stage Updated Successfully")
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


// Route for getting orders of customer to admin cart section from userDress Model
const userOrders = asyncHandler(async(req, res) => {
    try {

        const dress = await USERDRESS.find();

        res.status(200)
        .json(
            new ApiResponse(200, dress, "Dress Fetched Successfully")
        )
        
    } catch (error) {
        throw new ApiError(400, "User Orderes Not Fetched")
    }
})

// Route When Order Get Completed
const orderCompleted = asyncHandler( async (req, res) => {
    try {
        let { phoneNumber, dress_id } = req.body;

        if(!(phoneNumber)){
            throw new ApiError(400, "Provide phoneNumber and dress_id")
        }

        console.log("Before user dress finding");
        console.log("Dress id: ", dress_id)
        console.log("Dress Info: ", req.body)
        const dressUser = await DRESSUSER.findById({
            _id: dress_id
        });


        if(!dressUser)
            throw new ApiError(400, "Phone Number or Dress Id is wrong")
        
        console.log("Before Creatintg User Dress Completed");
        console.log("Number Type: ", typeof(phoneNumber));

        console.log("dressUser: ", dressUser)

    
            const userCustomDress = await USERCUSTOMDRESS.create({
                dressName: dressUser.dressName,
                phoneNumber,
                dressImage: dressUser.dressImage,
                price: dressUser.price,
                details: dressUser.details || "Dress Image"
            })

            
            if(!userCustomDress)
            throw new ApiError(400, "user dress is not completed")
        
        
        console.log("After Creatintg User Dress Completed");


        const orderCompleted = await DRESSUSER.deleteOne({
            $and: [{phoneNumber}, {_id: dress_id}]
        })

        if(!orderCompleted){
            throw new ApiError(400, "Dress Not Present")
        }

        return res.status(201)
        .json(
            new ApiResponse(201, {}, "Order Completed")
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "Order Not Completed")
    }
})

export {
    updatingUserCustomDressPriceAnduserDressOrderInfo, dressUpload, allDress, userOrders, orderCompleted
}
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const validateUser = asyncHandler( async(req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!accessToken){
            throw new ApiError(400, "Unauthorized Access");
        }

        const decodedToken =  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        if(!decodedToken){
            throw new ApiError(400, "UnAuthorized Access");
        }

        const user = await User.findById(decodedToken._id);

        if(!user){
            throw new ApiError(400, "Invalid Access Token");
        }
        
        req.user = user;

        next();

    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Access Token")
    }
})


export { validateUser }
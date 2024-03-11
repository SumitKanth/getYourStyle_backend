import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";

const userRegister = asyncHandler( async (req, res) => {
    try {
        
    } catch (error) {
        throw new ApiError(400, "User not registered");
    }
})

export { userRegister }
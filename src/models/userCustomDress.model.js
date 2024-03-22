import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

// For User Who select dress from dress section and whose order got successfully completed
const userCustomDressSchema = new mongoose.Schema({
    dressName:{
        type: String,
        required: true
    },

    phoneNumber: {
        type: Number,
        required: true
    },

    dressImage:{
        type: String,
        required: true
    },

    price:{
        type: Number,
        required: true
    },

    details:{
        type: String,
        required: true
    }

}, {timestamps: true});

userCustomDressSchema.plugin(mongooseAggregatePaginate)
const USERCUSTOMDRESS = mongoose.model("USERCUSTOMDRESS", userCustomDressSchema);

export default USERCUSTOMDRESS
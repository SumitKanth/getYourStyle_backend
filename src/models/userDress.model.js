import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

// Ye Cart m rahega Jb Order Complete ho jaega to user and uska dress userCustomDress m daal denge or yaha se delete kr denge.
const userDressSchema = new mongoose.Schema({
    dressName: {
        type: String,
        required: true,
        lowercase: true
    },

    phoneNumber:{
        type: Number,
        required: true,
        index: true
    },

    dressImage:{
        type: String,
        required: true
    },

    price:{
        type: Number,
        default: 0
    },

    details: {
        type: String,
        default: ""
    },

    orderInfo:{
       type: String,
       default: ""
    },

    stage:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})

userDressSchema.plugin(mongooseAggregatePaginate);
const USERDRESS = mongoose.model("USERDRESS", userDressSchema);

export default USERDRESS
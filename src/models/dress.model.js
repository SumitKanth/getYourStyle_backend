import mongoose from 'mongoose'

const dressSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    image:{
        type: String,
        required: true,
        unique: true
    },

    price: {
        type: String,
        required: true
    },

    details:{
        type: String,
        required: true
    }
}, {timestamps: true})


const Dress = mongoose.model("Dress", dressSchema);

export default Dress
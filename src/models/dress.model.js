import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const dressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },

    image:{
        type: String,
        required: true,
        unique: true
    },

    price: {
        type: Number,
        required: true
    },

    details:{
        type: String,
        required: true
    }
}, {timestamps: true})

// Mongoose Aggregate Pipeline
dressSchema.plugin(mongooseAggregatePaginate);

const Dress = mongoose.model("Dress", dressSchema);

export default Dress
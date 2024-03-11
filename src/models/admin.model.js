import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    dress:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dress"
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

const Admin = mongoose.model("Admin", adminSchema);

export default Admin
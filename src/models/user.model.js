import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    phoneNumber:{
        type: Number,
        required: true,
        unique: true,
        length: 10
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    refreshToken:{
        type: String,
    },

    userDress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dress"
        }
    ]
}, {timestamps: true})

userSchema.pre("save", async function () {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, process.env.BCRYPT_HASH_NUMBER);
    }

    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
        _id: this._id,
        name: this.name,
        phoneNumber: this.phoneNumber
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

const User = mongoose.model('User', userSchema);

export default User
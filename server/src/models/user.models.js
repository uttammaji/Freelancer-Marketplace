import mongoose from 'mongoose'

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,

    },
    role: {
        type: String,
        required: true,
        enum: ["client", "freelancer", "admin"],
    },
    avatar: {
        type: String,
        required: true,

    },
    phone: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
    },
    isPhoneVerified: {
        type: Boolean,
    },
    isBlocked: {
        type: Boolean,
    },
    lastlogin: {
        type: Date,
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    }
})


export const User = mongoose.model("User", userSchema)
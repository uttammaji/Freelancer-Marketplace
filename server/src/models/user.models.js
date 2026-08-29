// server/src/models/user.models.js
import mongoose, { Schema } from 'mongoose';

// User Schema Definition
const userSchema = new Schema({
    name: {
        type: String,
        required: true,       
        trim: true             
    },
    // Username
    username: {
        type: String,
        required: true,
        unique: true,        
        lowercase: true,     
        trim: true,          
        index: true          
    },
    // Email 
    email: {
        type: String,
        required: true,
        unique: true,        
        lowercase: true,     
        trim: true,         
    },
    // Password 
    password: {
        type: String,
        required: true,
    },
    // Role 
    role: {
        type: String,
        required: true,
        enum: ["client", "freelancer", "admin"], 
        default: "client"    
    },
    // Avatar URL
    avatar: {
        type: String,
        default: ""          
    },
    // Cloudinary public ID for avatar (used for deletion)
    avatarPublicId: {
        type: String,
        default: null
    },
    // Phone
    phone: {
        type: String,
        default: ""
    },
    // Email verification status
    isEmailVerified: {
        type: Boolean,
        default: false        
    },
    // Phone verification status
    isPhoneVerified: {
        type: Boolean,
        default: false        
    },
    // Block status - admin can block users
    isBlocked: {
        type: Boolean,
        default: false        
    },
    // Last login timestamp
    lastLogin: {              
        type: Date,
    },
}, {
    timestamps: true          
});

// Export User model
export const User = mongoose.model("User", userSchema);
// server/src/models/user.models.js
import mongoose, { Schema } from 'mongoose';

// User Schema Definition
const userSchema = new Schema({
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
        // select: false 
    },
    // Role 
    role: {
        type: String,
        required: true,
        enum: ["client", "freelancer", "admin"], 
        default: "client"    
    },
    // Avatar 
    avatar: {
        type: String,
        // required: true,  
        default: ""          
    },
    // Phone
    phone: {
        type: String,
        // required: true,    
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
    // Timestamps for record tracking
    createdAt: {
        type: Date,
        default: Date.now     
    },
    updatedAt: {
        type: Date,
        default: Date.now    
    }
}, {
    timestamps: true          
});

// Export User model
export const User = mongoose.model("User", userSchema); 
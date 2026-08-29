// server/src/models/user.models.js
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,       
        trim: true             
    },
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
        lowercase: true,     
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
        default: "client"    
    },
    avatar: {
        type: String,
        default: ""          
    },
    avatarPublicId: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: ""
    },
    isEmailVerified: {
        type: Boolean,
        default: false        
    },
    isPhoneVerified: {
        type: Boolean,
        default: false        
    },
    isBlocked: {
        type: Boolean,
        default: false        
    },
    lastLogin: {              
        type: Date,
    },

    // ============ SECURITY FIELDS ============
    
    // Account lockout tracking
    loginAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    
    // Password tracking
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    
    // Token rotation version
    tokenVersion: {
        type: Number,
        default: 0
    },
    
    // Social login
    googleId: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    },
    
    // Email change tracking
    pendingEmail: {
        type: String,
        default: null
    },
    pendingEmailExpires: {
        type: Date,
        default: null
    },
}, {
    timestamps: true          
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ googleId: 1 });

export const User = mongoose.model("User", userSchema);
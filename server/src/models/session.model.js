// server/src/models/session.model.js
import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    
    // Token information
    refreshTokenHash: {
        type: String,
        required: true,
    },
    
    // Device information
    deviceInfo: {
        userAgent: {
            type: String,
            default: null,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown',
        },
        browser: {
            type: String,
            default: null,
        },
        os: {
            type: String,
            default: null,
        },
    },
    
    // Session status
    isActive: {
        type: Boolean,
        default: true,
    },
    
    // Timestamps
    lastActiveAt: {
        type: Date,
        default: Date.now,
    },
    
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    
    // Logout/revoke info
    revokedAt: {
        type: Date,
        default: null,
    },
    
    revokedReason: {
        type: String,
        enum: ['user_logout', 'password_change', 'admin_revoke', 'expired', null],
        default: null,
    },
}, {
    timestamps: true,
});

// Indexes
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ refreshTokenHash: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
sessionSchema.methods.revoke = async function(reason = 'user_logout') {
    this.isActive = false;
    this.revokedAt = new Date();
    this.revokedReason = reason;
    await this.save();
};

sessionSchema.methods.isExpired = function() {
    return this.expiresAt < new Date();
};

sessionSchema.methods.isValid = function() {
    return this.isActive && !this.isExpired();
};

// Static methods
sessionSchema.statics.findActiveSessions = function(userId) {
    return this.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() },
    }).sort({ lastActiveAt: -1 });
};

sessionSchema.statics.revokeAllForUser = async function(userId, reason = 'password_change') {
    return this.updateMany(
        { userId, isActive: true },
        { 
            isActive: false, 
            revokedAt: new Date(), 
            revokedReason: reason 
        }
    );
};

sessionSchema.statics.revokeSession = async function(sessionId, reason = 'user_logout') {
    return this.findByIdAndUpdate(
        sessionId,
        { 
            isActive: false, 
            revokedAt: new Date(), 
            revokedReason: reason 
        },
        { new: true }
    );
};

export const Session = mongoose.model("Session", sessionSchema);
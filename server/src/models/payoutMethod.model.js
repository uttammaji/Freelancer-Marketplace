// server/src/models/payoutMethod.model.js
import mongoose from "mongoose";

const payoutMethodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    type: {
        type: String,
        enum: ["upi", "bank"],
        required: true,
    },

    // ============ UPI FIELDS ============
    upiId: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
    },

    // ============ BANK FIELDS ============
    accountHolderName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
    },

    accountNumber: {
        type: String,
        trim: true,
        maxlength: 20,
        default: null,
    },

    ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
    },

    bankName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
    },

    branchName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
    },

    // ============ COMMON FIELDS ============
    isPrimary: {
        type: Boolean,
        default: false,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    verifiedAt: {
        type: Date,
        default: null,
    },

    displayInfo: {
        type: String,
        default: null,
    },

    razorpayFundAccountId: {
        type: String,
        default: null,
    },

    razorpayContactId: {
        type: String,
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    totalWithdrawn: {
        type: Number,
        default: 0,
        min: 0,
    },

    lastWithdrawalAt: {
        type: Date,
        default: null,
    },

    lastWithdrawalAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});

// Indexes only — NO hooks, NO methods
payoutMethodSchema.index({ userId: 1, isPrimary: -1 });
payoutMethodSchema.index({ userId: 1, type: 1 });

export const PayoutMethod = mongoose.model("PayoutMethod", payoutMethodSchema);
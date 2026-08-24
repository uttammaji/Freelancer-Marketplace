import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },

    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
        required: true,
        index: true,
    },

    orderId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },

    paymentId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },

    signature: {
        type: String,
        default: null,
    },

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    currency: {
        type: String,
        default: "INR",
        uppercase: true,
    },

    status: {
        type: String,
        enum: [
            "created",
            "pending",
            "paid",
            "failed",
            "refunded",
        ],
        default: "created",
        index: true,
    },

    paymentMethod: {
        type: String,
        default: null,
    },

    paidAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

export default mongoose.model(
    "Payment",
    paymentSchema
);
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    },

    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
        default: null,
    },

    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
    },

    type: {
        type: String,
        enum: [
            "project_payment",
            "platform_fee",
            "freelancer_earning",
            "refund",
            "withdrawal",
        ],
        required: true,
        index: true,
    },

    direction: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
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
            "pending",
            "completed",
            "failed",
            "reversed",
        ],
        default: "pending",
        index: true,
    },

    description: {
        type: String,
        maxlength: 1000,
    },
}, {
    timestamps: true,
});

transactionSchema.index({
    userId: 1,
    createdAt: -1,
});

export default mongoose.model(
    "Transaction",
    transactionSchema
);
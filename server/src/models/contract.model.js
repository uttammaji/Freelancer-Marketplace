import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },

    proposalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
        required: true,
        unique: true,
    },

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

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    platformFee: {
        type: Number,
        required: true,
        min: 0,
    },

    freelancerAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    startDate: {
        type: Date,
        default: null,
    },

    deadline: {
        type: Date,
        required: true,
    },

    status: {
        type: String,
        enum: [
            "pending_payment",
            "active",
            "submitted",
            "completed",
            "cancelled",
            "disputed",
        ],
        default: "pending_payment",
        index: true,
    },

    terms: {
        type: String,
        maxlength: 10000,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Contract", contractSchema);
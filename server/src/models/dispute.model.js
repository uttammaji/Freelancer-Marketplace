import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        enum: [
            "image",
            "video",
            "document",
            "other",
        ],
        default: "other",
    },

    filename: {
        type: String,
        default: null,
    },
}, { _id: false });

const disputeSchema = new mongoose.Schema({
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

    openedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    against: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    reason: {
        type: String,
        enum: [
            "quality_issue",
            "incomplete_work",
            "late_delivery",
            "payment_issue",
            "communication",
            "other",
        ],
        required: true,
    },

    description: {
        type: String,
        required: true,
        maxlength: 10000,
    },

    evidence: [evidenceSchema],

    status: {
        type: String,
        enum: [
            "open",
            "under_review",
            "resolved",
            "closed",
        ],
        default: "open",
        index: true,
    },

    resolution: {
        type: String,
        enum: [
            "refund_client",
            "release_payment",
            "partial_refund",
            "no_action",
            null,
        ],
        default: null,
    },

    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    adminNote: {
        type: String,
        maxlength: 5000,
        default: null,
    },

    resolvedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

export default mongoose.model(
    "Dispute",
    disputeSchema
);
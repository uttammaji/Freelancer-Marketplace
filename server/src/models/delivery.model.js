import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
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

    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    message: {
        type: String,
        maxlength: 10000,
    },

    files: [{
        url: {
            type: String,
            required: true,
        },

        filename: String,

        size: Number,

        type: String,

        publicId: String,
    }, ],

    githubUrl: {
        type: String,
        default: null,
    },

    liveUrl: {
        type: String,
        default: null,
    },

    version: {
        type: Number,
        default: 1,
        min: 1,
    },

    status: {
        type: String,
        enum: [
            "submitted",
            "revision_requested",
            "accepted",
        ],
        default: "submitted",
        index: true,
    },

    revisionMessage: {
        type: String,
        default: null,
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },

    acceptedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

deliverySchema.index({
    contractId: 1,
    version: -1,
});

export default mongoose.model(
    "Delivery",
    deliverySchema
);
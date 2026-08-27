import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },

    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    coverLetter: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 5000,
    },

    bidAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    deliveryDays: {
        type: Number,
        required: true,
        min: 1,
    },

    attachments: [{
        url: String,
        filename: String,
        size: Number,
        type: String,
    }, ],

    status: {
        type: String,
        enum: [
            "pending",
            "shortlisted",
            "accepted",
            "rejected",
            "withdrawn",
        ],
        default: "pending",
        index: true,
    },

    clientMessage: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

proposalSchema.index({
    projectId: 1,
    freelancerId: 1,
}, {
    unique: true,
});

export default mongoose.model("Proposal", proposalSchema);
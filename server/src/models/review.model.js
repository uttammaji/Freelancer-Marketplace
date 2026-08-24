import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
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
    },

    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    communicationRating: {
        type: Number,
        min: 1,
        max: 5,
    },

    qualityRating: {
        type: Number,
        min: 1,
        max: 5,
    },

    professionalismRating: {
        type: Number,
        min: 1,
        max: 5,
    },

    comment: {
        type: String,
        maxlength: 3000,
    },

    isPublic: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// One reviewer can review a particular project only once.
reviewSchema.index({
    projectId: 1,
    reviewerId: 1,
}, {
    unique: true,
});

export default mongoose.model(
    "Review",
    reviewSchema
);
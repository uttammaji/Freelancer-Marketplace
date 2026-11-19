import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },

    description: {
        type: String,
        maxlength: 3000,
    },

    thumbnail: {
        type: String,
        default: null,
    },

    images: [{
        type: String,
    }, ],

    technologies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    }, ],

    githubUrl: {
        type: String,
        default: null,
    },

    liveUrl: {
        type: String,
        default: null,
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

portfolioSchema.index({
    freelancerId: 1,
    createdAt: -1,
});

export const Portfolio = mongoose.model(
    "Portfolio",
    portfolioSchema
);
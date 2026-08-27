import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
    },

    description: {
        type: String,
        maxlength: 500,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    usageCount: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});

export const Skill = mongoose.model("Skill", skillSchema);
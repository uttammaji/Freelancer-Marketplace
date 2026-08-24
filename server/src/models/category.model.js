import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
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

    description: {
        type: String,
        maxlength: 1000,
    },

    icon: {
        type: String,
        default: null,
    },

    image: {
        type: String,
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    projectCount: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Category", categorySchema);
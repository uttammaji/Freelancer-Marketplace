import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },

    publicId: {
        type: String,
        default: null,
    },

    filename: {
        type: String,
        required: true,
    },

    size: {
        type: Number,
        default: 0,
    },

    type: {
        type: String,
        default: null,
    },
}, { _id: false });

const projectSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200,
    },

    description: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 10000,
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
    },

    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    }, ],

    budget: {
        type: {
            type: String,
            enum: ["fixed", "hourly"],
            required: true,
        },

        min: {
            type: Number,
            required: true,
            min: 0,
        },

        max: {
            type: Number,
            required: true,
            min: 0,
        },
    },

    experienceLevel: {
        type: String,
        enum: [
            "beginner",
            "intermediate",
            "expert",
        ],
        default: "intermediate",
    },

    deadline: {
        type: Date,
        required: true,
    },

    status: {
        type: String,
        enum: [
            "open",
            "in_progress",
            "submitted",
            "completed",
            "cancelled",
            "disputed",
        ],
        default: "open",
        index: true,
    },

    attachments: [attachmentSchema],

    proposalCount: {
        type: Number,
        default: 0,
        min: 0,
    },

    hiredFreelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});

projectSchema.index({
    status: 1,
    categoryId: 1,
    createdAt: -1,
});

projectSchema.index({
    skills: 1,
});

export default mongoose.model("Project", projectSchema);
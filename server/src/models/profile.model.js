import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    level: {
        type: String,
        enum: [
            "basic",
            "conversational",
            "fluent",
            "native",
        ],
        default: "conversational",
    },
}, { _id: false });

const educationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: true,
    },

    degree: {
        type: String,
    },

    field: {
        type: String,
    },

    startYear: {
        type: Number,
    },

    endYear: {
        type: Number,
    },
}, { _id: false });

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },

    headline: {
        type: String,
        maxlength: 150,
        trim: true,
    },

    bio: {
        type: String,
        maxlength: 3000,
        trim: true,
    },

    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    }, ],

    hourlyRate: {
        type: Number,
        min: 0,
        default: 0,
    },

    experienceYears: {
        type: Number,
        min: 0,
        default: 0,
    },

    location: {
        country: String,
        state: String,
        city: String,
    },

    languages: [languageSchema],

    availability: {
        status: {
            type: String,
            enum: [
                "available",
                "busy",
                "unavailable",
            ],
            default: "available",
        },

        hoursPerWeek: {
            type: Number,
            min: 0,
            max: 168,
            default: 40,
        },
    },

    education: [educationSchema],

    rating: {
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        count: {
            type: Number,
            min: 0,
            default: 0,
        },
    },

    completedProjects: {
        type: Number,
        default: 0,
        min: 0,
    },

    totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },

    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
});

export const Profile = mongoose.model("Profile", profileSchema);
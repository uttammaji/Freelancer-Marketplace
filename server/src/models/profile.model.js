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

    // ============ ROLE ============
    role: {
        type: String,
        enum: ["client", "freelancer"],
        required: true,
    },

    // ============ COMMON FIELDS (Both Client & Freelancer) ============
    bio: {
        type: String,
        maxlength: 3000,
        trim: true,
    },

    location: {
        country: String,
        state: String,
        city: String,
    },

    languages: [languageSchema],

    // ============ FREELANCER-SPECIFIC FIELDS ============
    headline: {
        type: String,
        maxlength: 150,
        trim: true,
    },

    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    }],

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

    // ============ CLIENT-SPECIFIC FIELDS ============
    companyName: {
        type: String,
        maxlength: 200,
        trim: true,
    },

    industry: {
        type: String,
        maxlength: 100,
        trim: true,
    },

    website: {
        type: String,
        maxlength: 200,
        trim: true,
    },

    totalSpent: {
        type: Number,
        default: 0,
        min: 0,
    },

    projectsPosted: {
        type: Number,
        default: 0,
        min: 0,
    },

    totalHired: {
        type: Number,
        default: 0,
        min: 0,
    },

    // ============ COMMON METADATA ============
    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Index for search
profileSchema.index({
    role: 1,
    "rating.average": -1,
});

profileSchema.index({
    skills: 1,
});

profileSchema.index({
    companyName: 1,
});

export const Profile = mongoose.model("Profile", profileSchema);
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    headline: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    skills: {
        type: String,
        required: true,
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    experienceYears: {
        type: Number,
        required: true,
    },
    location: {
        country: String,
        state: String,
        city: String,
    },

    language: [{
        name: {
            type: String,
            required: true
        },
        level: {
            type: String,
            enum: ["Native", "Fluent", "Intermediate"],
            required: true
        }
    }],

    availability: {
        status: {
            type: String,
            enum: ["available", "busy", "unavailable"],
            required: true
        }
    },
    hoursPerWeek: {
        type: Number,
    },
    education: {
        institution: String,
        degree: String,
        field: String,
    },
    rating: {
        average: Number,
        count: Number,
    },
    completedProjects: {
        type: Number,
    },
    totalEarning: {
        type: Number,
    },
}, { timestamps: true });


const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
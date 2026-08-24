import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    type: {
        type: String,
        enum: [
            "proposal",
            "contract",
            "payment",
            "message",
            "delivery",
            "review",
            "dispute",
            "system",
        ],
        required: true,
    },

    title: {
        type: String,
        required: true,
        maxlength: 200,
    },

    message: {
        type: String,
        required: true,
        maxlength: 1000,
    },

    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },

    relatedType: {
        type: String,
        enum: [
            "project",
            "proposal",
            "contract",
            "payment",
            "message",
            "delivery",
            "review",
            "dispute",
            null,
        ],
        default: null,
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },

    readAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

notificationSchema.index({
    userId: 1,
    createdAt: -1,
});

export default mongoose.model(
    "Notification",
    notificationSchema
);
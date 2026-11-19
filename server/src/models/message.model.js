import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    message: {
        type: String,
        maxlength: 10000,
        default: "",
    },

    messageType: {
        type: String,
        enum: [
            "text",
            "image",
            "file",
            "system",
        ],
        default: "text",
    },

    attachments: [{
        url: String,
        filename: String,
        type: String,
        size: Number,
    }, ],

    isRead: {
        type: Boolean,
        default: false,
    },

    readAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

messageSchema.index({
    conversationId: 1,
    createdAt: -1,
});

export const Message = mongoose.model(
    "Message",
    messageSchema
);
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, ],

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
        index: true,
    },

    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
        default: null,
    },

    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },

    lastMessageAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

conversationSchema.index({
    participants: 1,
    updatedAt: -1,
});

export default mongoose.model(
    "Conversation",
    conversationSchema
);
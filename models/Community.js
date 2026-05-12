import mongoose from 'mongoose'

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    emoji: { type: String, default: '🌐' },
    description: { type: String, trim: true, maxlength: 200 },
    type: { type: String, enum: ['college', 'interest'], default: 'interest' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    postCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.Community || mongoose.model('Community', CommunitySchema)
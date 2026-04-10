import mongoose from 'mongoose'

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    postCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.Community || mongoose.model('Community', CommunitySchema)
import mongoose, { Schema } from 'mongoose'

const messagesschema = new Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { _id: false });

const filemetadata = new Schema({
    path: { type: String, required: true },
    description: { type: String, required: true }
}, { _id: false });

const projectschema = new Schema({
    name: { type: String, required: true, default: "untitled project" },
    description: { type: String, default: "", },
    files: { type: Schema.Types.Mixed, default: {} },
    messages: { type: [messagesschema], default: [] },
    version: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    published: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "generating", "revising", "completed", "failed"], default: "pending" },
    filesplanned: { type: [filemetadata], default: [] },
    filesgenerated: { type: [String], default: [] },
    currentfile: { type: String, default: null },
    error: { type: String, default: null }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectschema);
export const project = Project;


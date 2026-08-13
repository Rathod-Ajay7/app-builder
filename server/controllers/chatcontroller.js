// post /api/projects/:id/chat

import { Project } from "../models/Project.js";
import { reviseproject } from "../services/ai.js";
import { applyOperations } from "../services/diff.js";

export function buildmanifest(files) {
    const manifest = [];
    for (const [path, entry] of Object.entries(files || {})) {
        manifest.push({ path, hash: entry.hash, size: entry.content?.length || 0 });
    }
    return manifest;
}

export const buildmenifest = buildmanifest;

// send revision prompt and return updated project
export async function chat(req, res) {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "prompt is required" });
        return;
    }
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userID });
    if (!project) {
        res.status(404).json({ error: "project not found" });
        return;
    }

    // set status to revising and save user prompt
    project.status = "revising";
    project.messages.push({ role: "user", content: prompt, timestamp: new Date() });

    await project.save();

    try {
        // build compact manifest(path+hash+size) instead of sending all code
        const manifest = buildmanifest(project.files);

        // include all file contents so the ai can do accurate search/replace
        const relevantfiles = {};
        for (const [path, entry] of Object.entries(project.files || {})) {
            relevantfiles[path] = entry.content;
        }

        // recent messages for context last 4 max 
        const recentMessages = project.messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
        }));

        console.log(`ai revising project ${project._id}: "${prompt.slice(0, 80)}..." ` +
            `(${manifest.length} files, manifest ~${JSON.stringify(manifest).length} chars)`);

        // call ai with manifest+relevant files
        const result = await reviseproject(prompt, manifest, relevantfiles, recentMessages);

        const operations = result.operations || result.oprations || [];

        console.log(`ai got ${operations.length} operations : ${result.description}`);

        // apply operations to file map
        const { files: updatedfiles, applied, errors } = applyOperations(project.files || {}, operations);

        if (errors.length > 0) {
            console.warn(`diff errors applying operations:`, errors);
        }

        // update project with new files, ops and status
        project.files = updatedfiles;
        project.markModified("files");
        project.version = (project.version || 0) + 1;
        project.status = "completed";
        project.messages.push({
            role: "assistant",
            content: (result.description || "revised project") + (errors.length > 0 ? `\n\n process completed with warnings: ${errors.join(", ")}` : ""),
            timestamp: new Date(),
        });

        await project.save();

        // return updated project 
        const filesobj = {};
        for (const [path, entry] of Object.entries(project.files || {})) {
            filesobj[path] = entry.content;
        }

        res.json({
            _id: project._id,
            name: project.name,
            description: project.description,
            files: filesobj,
            messages: project.messages,
            version: project.version,
            status: project.status,
            applied,
            errors,
            aidescription: result.description || "revised project"
        });

    } catch (err) {
        console.error(`AI revision error: ${err.message}`);
        project.status = "completed";
        await project.save();
        res.status(500).json({
            error: err.message || "failed to process revision request"
        });
    }
}
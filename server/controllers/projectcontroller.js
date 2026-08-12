//post /api/projects
//create new project from an ai prompt.

import { Project } from "../models/project.js";
import crypto from "crypto";
import { generateProject } from "../services/ai.js";

function hashContent(content) {
    return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

export async function createproject(req, res) {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: "prompt required" });
        return;
    }
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }

    //create project in db pending status
    const project = await Project.create({
        name: "planning project",
        description: prompt,
        files: {},
        messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: "planning project structure..." },
        ],
        version: 0,
        owner: req.user.userID,
        status: "pending",
        filesplanned: [],
        filesgenerated: [],
        currentfile: null,
        error: null
    });

    //start background generation
    backgroundgenration(project._id.toString(), prompt).catch((err) => {
        console.error(`background AI fatal generation error for project ${project._id}:`, err);
    });

    res.status(201).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: {},
        messages: project.messages,
        version: project.version,
        status: project.status,
        filesplanned: project.filesplanned,
        filesgenerated: project.filesgenerated,
        currentfile: project.currentfile,
        error: project.error,
        createdAt: project.createdAt,
    });
}

//in background generate files and update database live
export async function backgroundgenration(projectID, prompt) {
    try {
        console.log(`background ai starting generation for project ${projectID}`);

        const result = await generateProject(prompt, {
            onPlan: async (plan) => {
                console.log(`background ai plan created for project ${projectID}. planned ${plan.files.length} files.`);
                const filelist = plan.files.map((f) => `- \`${f.path}\` : ${f.description}`).join("\n");

                await Project.findByIdAndUpdate(projectID, {
                    name: plan.projectname || "generated project",
                    status: "generating",
                    filesplanned: plan.files,
                    $push: { messages: { role: "assistant", content: `planned website structure:\n${filelist}`, timestamp: new Date() } },
                });
            },
            onFileStart: async (path) => {
                console.log(`background ai starting file ${path} for project ${projectID}`);
                await Project.findByIdAndUpdate(projectID, {
                    currentfile: path,
                });
            },
            onFileComplete: async (path, code) => {
                console.log(`background ai completed file ${path} for project ${projectID}`);
                const project = await Project.findById(projectID);
                if (project) {
                    project.files = project.files || {};
                    project.files[path] = {
                        content: code,
                        hash: hashContent(code),
                    };
                    project.filesgenerated = [...(project.filesgenerated || []), path];
                    project.messages.push({
                        role: "assistant",
                        content: `created file "${path}"`,
                        timestamp: new Date(),
                    });
                    project.currentfile = null;
                    project.markModified("files");
                    await project.save();
                }
            }
        });

        console.log(`background ai successfully generated project ${projectID}`);
        const project = await Project.findById(projectID);
        if (project) {
            project.status = "completed";
            project.version = 1;
            if (result.description) {
                project.name = result.description;
            }
            project.messages.push({
                role: "assistant",
                content: `website generation is complete! you can view and edit the files.`,
                timestamp: new Date(),
            });
            await project.save();
        }
    } catch (err) {
        console.error(`background generation failed for project ${projectID}`, err);
        await Project.findByIdAndUpdate(projectID, {
            status: "failed",
            error: err.message,
            $push: {
                messages: {
                    role: "assistant",
                    content: `Generation failed: ${err.message}`,
                    timestamp: new Date(),
                },
            },
        });
    }
}

// get /api/projects
export async function listprojects(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    const projects = await Project.find(
        { owner: req.user.userID },
        { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
    ).sort({ updatedAt: -1 });

    res.json(projects);
}

//get /api/projects/:id
export async function getproject(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }

    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userID });

    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
    }
    const filesobj = {};
    for (const [path, entry] of Object.entries(project.files || {})) {
        filesobj[path] = entry?.content;
    }
    res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        version: project.version,
        files: filesobj,
        messages: project.messages,
        published: project.published,
        status: project.status,
        filesplanned: project.filesplanned,
        filesgenerated: project.filesgenerated,
        currentfile: project.currentfile,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    });
}

//delete api/projects/:id
export async function deleteproject(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    const result = await Project.findOneAndDelete({
        _id: req.params.id,
        owner: req.user.userID
    });
    if (!result) {
        res.status(404).json({ error: "project not found" });
        return;
    }
    res.json({ success: true });
}

//put api/projects/:id/files
export async function updateproject(req, res) {
    const { files } = req.body;
    if (!files || typeof files !== "object") {
        res.status(400).json({ error: "files object is required" });
        return;
    }
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }

    const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user.userID,
    });
    if (!project) {
        res.status(404).json({ error: "project not found" });
        return;
    }

    const newfiles = {};
    for (const [path, content] of Object.entries(files)) {
        if (typeof content === "string") {
            newfiles[path] = { content, hash: hashContent(content) };
        }
    }
    project.files = newfiles;
    await project.save();

    const filesobj = {};
    for (const [path, entry] of Object.entries(project.files || {})) {
        filesobj[path] = entry?.content;
    }

    res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        version: project.version,
        files: filesobj,
        messages: project.messages,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    });
}

//post api/projects/:id/publish
export async function publishproject(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }

    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.userID },
        { published: true },
        { returnDocument: "after" }
    );
    if (!project) {
        res.status(404).json({ error: "project not found" });
        return;
    }

    res.json({ success: true });
}

//get api/projects/public/:id
export async function getpublicproject(req, res) {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404).json({ error: "project not found" });
        return;
    }
    if (!project.published) {
        res.status(403).json({ error: "project not published yet" });
        return;
    }
    const filesobj = {};
    for (const [path, entry] of Object.entries(project.files || {})) {
        filesobj[path] = entry?.content;
    }
    res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        version: project.version,
        files: filesobj,
    });
}

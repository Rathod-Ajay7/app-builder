import { Router } from "express";
import { createproject, getproject, listprojects, updateproject, deleteproject, publishproject, getpublicproject } from "../controllers/projectcontroller.js";
import { Authmiddleware } from "../middleware/Authmiddleware.js";
import { chat } from "../controllers/chatcontroller.js";

const projectrouter = Router();

// public route
projectrouter.get("/public/:id", getpublicproject);

projectrouter.use(Authmiddleware);

// protected routes
projectrouter.post("/", createproject);
projectrouter.get("/", listprojects);
projectrouter.get("/:id", getproject);
projectrouter.delete("/:id", deleteproject);
projectrouter.put("/:id/files", updateproject);
projectrouter.post("/:id/publish", publishproject);
projectrouter.post("/:id/chat", chat);

export default projectrouter;

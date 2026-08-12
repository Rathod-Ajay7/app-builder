import { Router } from "express"
import { login, logout, me, register } from "../controllers/Authcontroller.js";
import { Authmiddleware } from "../middleware/Authmiddleware";

const authrouter = Router();

authrouter.post('/register', register);
authrouter.post('/login', login);
authrouter.post('/logout', logout);
authrouter.get('/me', Authmiddleware, me);

export default authrouter;
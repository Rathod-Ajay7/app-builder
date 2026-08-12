import { User } from "../models/user.js";
import jwt from 'jsonwebtoken'

const jwt_screat = process.env.JWT_SECRET || "fallback_secret";
//helper to set cookie
const setsessioncookie = (res, payload) => {
    const token = jwt.sign(payload, jwt_screat, { expiresIn: "30d" });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
    })
}

export async function register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({
            error: "Name, email and password are required"
        })
        return;
    }
    const trimmedemail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: trimmedemail })
    if (existing) {
        res.status(400).json({
            error: "An account with this email already exists"
        })
        return;
    }
    const newUser = await User.create({
        name,
        email: trimmedemail,
        password
    })

    setsessioncookie(res, { userID: newUser._id.toString(), email: newUser.email });

    res.status(201).json({
        user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        }
    })

}

export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            error: "Email and password are required"
        })
        return;
    }

    const foundUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (!foundUser) {
        res.status(401).json({
            error: "Invalid Email or Password"
        })
        return;
    }

    const isvalid = await foundUser.comparepassword(password);
    if (!isvalid) {
        return res.status(401).json({
            error: "Invalid Email or Password"
        })
    }

    setsessioncookie(res, { userID: foundUser._id.toString(), email: foundUser.email });

    res.status(200).json({
        user: {
            _id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
        }
    })
}

export async function logout(_req, res) {

    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    })

    res.json({
        success: true,
    })
}

export async function me(req, res) {
    if (!req.user) {
        res.status(401).json({
            error: "Not Authenticated",
        })
        return;
    }
    const currentUser = await User.findById(req.user.userID).select("-password");
    if (!currentUser) {
        res.status(401).json({
            error: "User not found",
        })
        return;
    }
    res.json({
        user: currentUser
    })
}



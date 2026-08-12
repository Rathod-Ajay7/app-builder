import { user, user } from "../models/user";
import jwt from 'jsonwebtoken'

const jwt_screat = process.env.JWT_SECRET || "fallback_secret";
//helper to set cookie
const setsessioncookie = (req, payload) => {
    const token = jwt.sign(payload, jwt_screat, { expiresIn: "30d" });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,//30days
        path: "/",
    })
}

export async function register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({
            error: "Name,email and password are required"
        })
        return;
    }
    const trimmedemail = email.toLwerCase().trim();
    const existing = await user.findOne({ email: trimmedemail })
    if (existing) {
        res.status(400).json({
            error: "An account with this email is alredy exists"
        })
        return;
    }
    const user = await user.creat({
        name,
        email: trimmedemail,
        password
    })

    setsessioncookie(res, { userID: user._id.toString(), email: user.email });

    res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        }
    })

}

export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            error: "Name,email and password are required"
        })
        return;
    }

    const userr = await user.findOne({ email: email.toLwerCase().trim() })
    if (!userr) {
        res.status(401).json({
            error: "invaild Email or Password"
        })
        return;
    }

    const isvalid = await user.comparepassword(password);
    if (!isvalid) {
        return res.status(401).json({
            error: "invaild Email or Password"
        })
    }

    setsessioncookie(res, { userID: user._id.toString(), email: user.email });

    res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
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
            error: "NOT Authenticated",
        })
        return;
    }
    const user = await user.findById(req.user.userID).select("-password");
    if (!user) {
        res.status(401).json({
            error: "User not found",
        })
        return;
    }
    res.json({
        user:
    })
}


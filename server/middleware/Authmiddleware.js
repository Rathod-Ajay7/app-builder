import jwt from 'jsonwebtoken'

export function Authmiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({
            error: "Acess denied no session token provided."
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next()

    } catch (err) {
        res.status(401).json({
            error: "session expired or invalide.please sign in again",
        })
    }
}       
import jwt from 'jsonwebtoken'

export function Authmiddleware(req, res, next) {
<<<<<<< HEAD
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({
            error: "Acess denied no session token provided."
        })
=======
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({
            error: "Access denied. No session token provided."
        });
        return;
>>>>>>> 9798c4b (backend server with authentication feature)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next()

    } catch (err) {
        res.status(401).json({
<<<<<<< HEAD
            error: "session expired or invalide.please sign in again",
        })
    }
}
=======
            error: "Session expired or invalid. Please sign in again",
        })
    }
}

>>>>>>> 9798c4b (backend server with authentication feature)

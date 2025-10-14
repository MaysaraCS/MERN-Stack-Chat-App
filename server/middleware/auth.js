// middleware to protect routes
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.token;
        if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if(!user) return res.json({success: false, message: "User not found"});
        req.user = user;
        next();
    }catch (error) {
        console.log(error.message);
        res.json({success: false, message: "User not found"});
    }
}
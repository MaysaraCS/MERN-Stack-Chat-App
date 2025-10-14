import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

// sign up a new user 
export const signUp = async (req, res) => {
    try {
        const { email, fullName, password, bio } = req.body;
        if (!email || !fullName || !password || !bio) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);

        // remove password before sending back
        const { password: _p, ...userSafe } = newUser.toObject();

        res.status(201).json({ success: true, userData: userSafe, token, message: "Account created successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing credentials" });
        }

        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);
        const { password: _p, ...userSafe } = userData.toObject();

        res.json({ success: true, userData: userSafe, token, message: "Login successful" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// controller to check if the user is authenticated
export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user });
}

// controller to get all profile details
export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, profilePic } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true }).select('-password');
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio, profilePic: upload.secure_url }, { new: true }).select('-password');
        }
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
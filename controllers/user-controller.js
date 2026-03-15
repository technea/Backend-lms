import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// -----------------------------
// 1️⃣ Register User
// -----------------------------
export const registerUser = async (req, res) => {
    console.log("Register Request Received:", req.body);
    try {
        const { name, email, password, role, age } = req.body;

        // Validation
        if (!name || name.length < 4) {
            return res.status(400).json({ message: "Name must be at least 4 characters long" });
        }
        if (!age || age < 16) {
            return res.status(400).json({ message: "Age must be at least 16" });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Create new user (Hashing will be handled by Schema pre-save hook)
        const newUser = new User({
            name,
            email,
            password,
            role: role || "student",
            age,
            otp,
            otpExpire
        });

        console.log("Attempting to save new user to database...");
        await newUser.save();
        console.log("User saved successfully, OTP generated");

        // Send OTP via Email
        const emailMessage = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #4f46e5;">Welcome to NexLearn!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for registering. Please use the following 6-digit OTP to verify your account:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px;">
                    <h1 style="letter-spacing: 10px; color: #1e293b; margin: 0;">${otp}</h1>
                </div>
                <p style="margin-top: 20px; color: #64748b; font-size: 0.9rem;">This code is valid for 15 minutes only.</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="http://localhost:3001/login" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Login Page</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #94a3b8;">NexLearn LMS Team</p>
            </div>
        `;

        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Account Verification Code - NexLearn',
                message: emailMessage
            });

            res.status(201).json({ 
                success: true,
                message: "Registration successful. Please check your email for the OTP." 
            });
        } catch (emailError) {
            console.error("Email Sending Error:", emailError);
            res.status(201).json({ 
                success: true,
                message: "User registered, but verification email failed. Please try resending OTP." 
            });
        }
    } catch (error) {
        console.error("Registration Error caught in controller:", error);
        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};



// -----------------------------
// 2️⃣ Login User
// -----------------------------
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ 
                message: "Please verify your email first",
                unverified: true 
            });
        }

        // Use the method defined in Schema
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                age: user.age,
                mobile: user.mobile,
                avatar: user.avatar
            }, 
            token, 
            message: "Login successful" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// -----------------------------
// 3️⃣ Get All Users
// -----------------------------
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // hide passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -----------------------------
// 4️⃣ Get Single User
// -----------------------------
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -----------------------------
// -----------------------------
// 5️⃣ Update User
// -----------------------------
export const updateUser = async (req, res) => {
    try {
        const { name, age, email, role, password } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update fields if provided
        if (name) user.name = name;
        if (age) user.age = age;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password) user.password = password; // pre-save hook will hash this
        if (mobile) user.mobile = mobile;

        const updatedUser = await user.save();

        res.json({ 
            message: "User updated successfully", 
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                age: updatedUser.age,
                mobile: updatedUser.mobile,
                avatar: updatedUser.avatar
            } 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// -----------------------------
// Create User (Admin fallback/internal)
// -----------------------------
export const createUser = async (req, res) => {
    try {
        const { name, age, email, role, password } = req.body;
        
        const newUser = new User({ 
            name, 
            age, 
            email, 
            role, 
            password // Schema pre-save hook handles hashing
        });
        
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// -----------------------------
// 6️⃣ Delete User
// -----------------------------
export const deleteUser = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// -----------------------------
// 7️⃣ Change Password (User self-service)
// -----------------------------
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// -----------------------------
// 8️⃣ Forgot Password
// -----------------------------
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found with this email" });

        // Generate reset token (Simple 6-digit code for ease of use)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash it and save to DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expire

        await user.save();

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #4f46e5;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Please use the following 6-digit code to complete the process:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px;">
                    <h1 style="letter-spacing: 10px; color: #1e293b; margin: 0;">${resetToken}</h1>
                </div>
                <p style="margin-top: 20px; color: #64748b; font-size: 0.9rem;">This code is valid for 10 minutes only.</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="http://localhost:3001/login" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Login Page</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #94a3b8;">NexLearn LMS Team</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Code - NexLearn',
                message
            });

            res.json({ 
                success: true, 
                message: "Reset code sent to your email"
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent. Please check your SMTP settings." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -----------------------------
// 9️⃣ Reset Password
// -----------------------------
export const resetPassword = async (req, res) => {
    try {
        const { code, password } = req.body;

        // Hash the code to compare with DB
        const hashedToken = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired reset code" });

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -----------------------------
// 10️⃣ Update Avatar
// -----------------------------
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image" });
        }

        const avatarPath = `/uploads/${req.file.filename}`;
        console.log(`Updating avatar for user ${req.user.id} to ${avatarPath}`);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarPath },
            { new: true, runValidators: false } // Bypass full validation to avoid conflicts
        ).select("-password");

        if (!user) {
            console.log("User not found for avatar update");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Avatar updated successfully in DB");

        res.json({ 
            message: "Profile picture updated successfully", 
            avatar: user.avatar,
            user: user
        });
    } catch (error) {
        console.error("Avatar update error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// -----------------------------
// 11️⃣ Verify OTP
// -----------------------------
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified" });
        }

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Account verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// -----------------------------
// 12️⃣ Resend OTP
// -----------------------------
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 15 * 60 * 1000;

        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();

        const emailMessage = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                <h2 style="color: #4f46e5;">New Verification Code</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>You requested a new verification code. Please use the following 6-digit OTP to verify your account:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px;">
                    <h1 style="letter-spacing: 10px; color: #1e293b; margin: 0;">${otp}</h1>
                </div>
                <p style="margin-top: 20px; color: #64748b; font-size: 0.9rem;">This code is valid for 15 minutes only.</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="http://localhost:3001/login" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Login Page</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #94a3b8;">NexLearn LMS Team</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'New Verification Code - NexLearn',
            message: emailMessage
        });

        res.json({ success: true, message: "New OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
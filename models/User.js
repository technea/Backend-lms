import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        minlength: [4, "Name must be at least 4 characters long"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    role: {
        type: String,
        enum: ["admin", "instructor", "student"],
        default: "student"
    },
    age: {
        type: Number,
        required: [true, "Please enter your age"],
        min: [16, "Age must be at least 16"]
    },
    mobile: {
        type: String,
        default: ""
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    avatar: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpire: Date,
    twoFactorSecret: String,
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Password hashing before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);


export default User;
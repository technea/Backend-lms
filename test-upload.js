import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find any user
    const user = await User.findOne({role: 'instructor'});
    if (!user) { console.log("No user found"); process.exit(1); }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Create a dummy image file
    fs.writeFileSync('dummy.jpg', 'fake image content');
    
    const form = new FormData();
    form.append('avatar', fs.createReadStream('dummy.jpg'));
    
    try {
        const res = await axios.put('http://localhost:5001/api/users/avatar', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error Response:", err.response?.data || err.message);
    }
    
    process.exit(0);
}

run();

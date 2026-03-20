import express from "express"
import Enrollment from "../models/Enrollment.js"
import Course from "../models/Courses.js"
import User from "../models/User.js"

export const getEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find();
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEnrollmentById = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createEnrollment = async (req, res) => {
    try {
        const { course } = req.body;
        
        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ student: req.user.id, course });
        if (existingEnrollment) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        const newEnrollment = new Enrollment({ 
            student: req.user.id, // from protect middleware
            course, 
            progress: 0 
        });
        const savedEnrollment = await newEnrollment.save();
        res.status(201).json(savedEnrollment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id }).populate("course");
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEnrollment = async (req, res) => {
    try {
        const { progress } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);
        
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

        // Security check: Only student who owns enrollment or Admin can update
        if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to update this progress" });
        }

        // Update progress
        const oldProgress = enrollment.progress;
        enrollment.progress = progress;

        // Check if just reached 100% and point addition is needed
        if (progress >= 100 && oldProgress < 100) {
            const course = await Course.findById(enrollment.course);
            if (course && course.points) {
                // Add points to user
                await User.findByIdAndUpdate(enrollment.student, {
                    $inc: { points: course.points }
                });
                console.log(`User ${enrollment.student} earned ${course.points} points for completing ${course.title}`);
            }
        }

        const updatedEnrollment = await enrollment.save();
        res.json({ message: "Enrollment updated successfully", enrollment: updatedEnrollment });
    } catch (error) {
        console.error("Update Enrollment Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const deleteEnrollment = async (req, res) => {
    try {
        const deletedEnrollment = await Enrollment.findByIdAndDelete(req.params.id);
        if (!deletedEnrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.json({ message: "Enrollment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
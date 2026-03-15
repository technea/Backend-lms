import express from "express"
import Enrollment from "../models/Enrollment.js"

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
        const { student, course, progress } = req.body;
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            { student, course, progress },
            { new: true, runValidators: true }
        );
        if (!updatedEnrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.json({ message: "Enrollment updated successfully", enrollment: updatedEnrollment });
    } catch (error) {
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
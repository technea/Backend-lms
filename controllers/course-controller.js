import express from "express"
import Course from "../models/Courses.js"

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFreeCourses = async (req, res) => {
    try {
        // Here we fetch courses that are marked as external and have a price of 0 (or coupons)
        // In a real scenario, this could also call external APIs
        const freeCourses = await Course.find({ 
            $or: [
                { isExternal: true },
                { price: 0 }
            ]
        });
        res.json(freeCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, isYouTube, playlistUrl } = req.body;
        const videoUrl = req.file ? `/uploads/${req.file.filename}` : "";

        const newCourse = new Course({ 
            title, 
            description, 
            category, 
            instructor: req.user.id, 
            price,
            videoUrl,
            isYouTube: isYouTube === 'true' || isYouTube === true,
            playlistUrl
        });
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { title, description, category, instructor, price, isYouTube, playlistUrl } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { title, description, category, instructor, price, isYouTube, playlistUrl },
            { new: true, runValidators: true }
        );
        if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course updated successfully", course: updatedCourse });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

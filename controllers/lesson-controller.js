import Lesson from "../models/Lesson.js";

// Get all lessons for a specific course
export const getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const lessons = await Lesson.find({ course: courseId });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single lesson
export const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new lesson
export const createLesson = async (req, res) => {
    try {
        const { title, content, courseId } = req.body;
        let videoUrl = req.body.videoUrl;

        // If a file is uploaded, use its path
        if (req.file) {
            videoUrl = `/uploads/${req.file.filename}`;
        }

        const newLesson = new Lesson({
            title,
            content,
            videoUrl: videoUrl || "",
            course: courseId
        });
        const savedLesson = await newLesson.save();
        res.status(201).json(savedLesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update lesson
export const updateLesson = async (req, res) => {
    try {
        const { title, content, videoUrl } = req.body;
        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            { title, content, videoUrl },
            { new: true, runValidators: true }
        );
        if (!updatedLesson) return res.status(404).json({ message: "Lesson not found" });
        res.json({ message: "Lesson updated successfully", lesson: updatedLesson });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
    try {
        const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!deletedLesson) return res.status(404).json({ message: "Lesson not found" });
        res.json({ message: "Lesson deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

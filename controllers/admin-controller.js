import User from "../models/User.js";
import Course from "../models/Courses.js";
import Enrollment from "../models/Enrollment.js";

// Endpoint to fetch summary analytics for Admin Dashboard
export const getAdminAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        
        // breakdown by roles
        const students = await User.countDocuments({ role: "student" });
        const instructors = await User.countDocuments({ role: "instructor" });
        const admins = await User.countDocuments({ role: "admin" });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalEnrollments,
                roleBreakdown: {
                    students,
                    instructors,
                    admins
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, "Please enter the course title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter the course description"]
    },
    category: {
        type: String,
        required: [true, "Please enter a course category"],
        default: "General"
    },
    instructor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    videoUrl: {
        type: String,
        default: ""
    },
    isYouTube: {
        type: Boolean,
        default: false
    },
    playlistUrl: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;

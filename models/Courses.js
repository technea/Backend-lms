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
    },
    isExternal: {
        type: Boolean,
        default: false
    },
    externalLink: {
        type: String,
        default: ""
    },
    source: {
        type: String,
        default: "NexLearn" // 'Udemy', 'freeCodeCamp', etc.
    },
    couponCode: {
        type: String,
        default: ""
    },
    thumbnail: {
        type: String,
        default: ""
    },
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;

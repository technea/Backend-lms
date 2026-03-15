import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema({
    title: {
        type: String,
        required: [true, "Lesson title is required"],
        trim: true
    },
    content: {
        type: String,
        required: [true, "Lesson text/content is required"]
    },
    videoUrl: {
        type: String,
        default: ""
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }
}, { timestamps: true });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;

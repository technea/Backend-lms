import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    progress: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Student name is required"],
            trim: true
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Enter a valid email address"
            ]
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [
                /^[0-9]{10}$/,
                "Phone number must contain 10 digits"
            ]
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            enum: [
                "Computer Science",
                "Information Technology",
                "Electronics",
                "Mechanical",
                "Commerce"
            ]
        },

        year: {
            type: Number,
            required: [true, "Year is required"],
            min: [1, "Year must be at least 1"],
            max: [4, "Year cannot exceed 4"]
        }
    },
    {
        timestamps: true
    }
);

const Student =
    mongoose.models.Student ||
    mongoose.model("Student", studentSchema);

export default Student;

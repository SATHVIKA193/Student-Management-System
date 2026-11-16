
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";



// GET: Retrieve one student
export async function GET(request, { params }) {

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid student ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const student = await Student.findById(id);

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error("GET student error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch student" },
            { status: 500 }
        );
    }
}


// PUT: Update an existing student
export async function PUT(request, { params }) {

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid student ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const body = await request.json();

        const { name, email, phone, department, year } = body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !department ||
            year === undefined ||
            year === null ||
            year === ""
        ) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        const student = await Student.findByIdAndUpdate(
            id,
            {
                name,
                email,
                phone,
                department,
                year
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Student updated successfully",
            data: student
        });

    } catch (error) {

        console.error("PUT student error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This email is already registered" },
                { status: 409 }
            );
        }

        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update student" },
            { status: 500 }
        );
    }
}


// DELETE: Remove a student
export async function DELETE(request, { params }) {

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid student ID" },
                { status: 400 }
            );
        }

        await dbConnect();

        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {

        console.error("DELETE student error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete student" },
            { status: 500 }
        );
    }
}

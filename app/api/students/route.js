
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";

// GET: Retrieve all students
export async function GET() {

    try {
        await dbConnect();

        const students = await Student.find().sort({
            createdAt: -1
        });

        return NextResponse.json(
            {
                success: true,
                data: students
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("GET students error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch students"
            },
            { status: 500 }
        );
    }
}


// POST: Add a new student
export async function POST(request) {

    try {
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
                {
                    success: false,
                    message: "All fields are required"
                },
                { status: 400 }
            );
        }

        const student = await Student.create({
            name,
            email,
            phone,
            department,
            year
        });

        return NextResponse.json(
            {
                success: true,
                message: "Student added successfully",
                data: student
            },
            { status: 201 }
        );

    } catch (error) {

        console.error("POST student error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This email is already registered"
                },
                { status: 409 }
            );
        }

        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to add student"
            },
            { status: 500 }
        );
    }
}

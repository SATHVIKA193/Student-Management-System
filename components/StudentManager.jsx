
"use client";

import { useEffect, useState } from "react";
import { validateStudent } from "@/lib/validation";

async function readApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();

    if (!contentType.includes("application/json")) {
        throw new Error(
            `API returned HTML instead of JSON. Status: ${response.status}. Check your API route.`
        );
    }

    let result;

    try {
        result = JSON.parse(responseText);
    } catch {
        throw new Error("Invalid JSON response from API");
    }

    if (!response.ok) {
        throw new Error(result.message || "API request failed");
    }

    return result;
}

export default function StudentManager() {

    // Store student records
    const [students, setStudents] = useState([]);

    // Store form information
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        year: ""
    });

    const [errors, setErrors] = useState({});

    // Store the ID of the student being edited
    const [editingId, setEditingId] = useState(null);

    // Loading and message states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    // Search and filter states
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");

    // 1. Fetch students from MongoDB through API
   async function fetchStudents() {
    try {
        setLoading(true);

        const response = await fetch("/api/students", {
            method: "GET",
            cache: "no-store"
        });

        const result = await readApiResponse(response);

        // Support both direct array and { data: [...] } responses
        const studentList = Array.isArray(result)
            ? result
            : result.data;

        if (!Array.isArray(studentList)) {
            throw new Error("Invalid student list received from API");
        }

        setStudents(studentList);

    } catch (error) {
        console.error("Fetch students error:", error);

        setMessage({
            type: "error",
            text: error.message
        });

    } finally {
        setLoading(false);
    }
}

    // Load students when the component first opens
    useEffect(() => {
        fetchStudents();
    }, []);

    // 2. Handle input changes
    function handleChange(event) {

        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    }

    // 3. Add or Update student
    async function handleSubmit(event) {

        event.preventDefault();

        setMessage({
            type: "",
            text: ""
        });

      // Validate all form fields
    const validationErrors = validateStudent(form);

    setErrors(validationErrors);

    // Stop submission if validation fails
    if (Object.keys(validationErrors).length > 0) {
        return;
    }
    setSaving(true);

        try {

            const url = editingId
                ? `/api/students/${editingId}`
                : "/api/students";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim(),
                    year: Number(form.year)
                })
            });

            const result = await readApiResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Operation failed");
            }

            setMessage({
                type: "success",
                text: result.message || "Student saved successfully"
            });

            // Reset form
            resetForm();

            // Refresh student records
            await fetchStudents();

        } catch (error) {

            setMessage({
                type: "error",
                text: error.message
            });

        } finally {
            setSaving(false);
        }
    }

    // 4. Reset form
    function resetForm() {

        setForm({
            name: "",
            email: "",
            phone: "",
            department: "",
            year: ""
        });
        
        setErrors({});
        setEditingId(null);
    }

    // 5. Edit student
    function handleEdit(student) {

        setForm({
            name: student.name,
            email: student.email,
            phone: student.phone,
            department: student.department,
            year: String(student.year)
        });

        setEditingId(student._id);

        setMessage({
            type: "",
            text: ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // 6. Delete student
    async function handleDelete(id) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setMessage({
                type: "",
                text: ""
            });

            const response = await fetch(`/api/students/${id}`, {
                method: "DELETE"
            });

            const result = await readApiResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Delete failed");
            }

            setMessage({
                type: "success",
                text: result.message
            });

            // If the deleted student was being edited, reset the form
            if (editingId === id) {
                resetForm();
            }

            await fetchStudents();

        } catch (error) {

            setMessage({
                type: "error",
                text: error.message
            });
        }
    }

    // 7. Search and department filtering
    const filteredStudents = students.filter((student) => {

        const matchesName = student.name
            .toLowerCase()
            .includes(search.toLowerCase().trim());

        const matchesDepartment =
            departmentFilter === "All" ||
            student.department === departmentFilter;

        return matchesName && matchesDepartment;
    });

    return (

        <main className="container">

            {/* Dashboard heading */}
            <header className="header">
                <div>
                    <h1>Student Management System</h1>
                    <p>Manage your student information easily.</p>
                </div>
            </header>

            {/* Total student count */}
            <section className="stats">
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <h2>{students.length}</h2>
                </div>
            </section>

            {/* Success and error messages */}
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Student form */}
            <section className="card">

                <h2>
                    {editingId ? "Edit Student" : "Add New Student"}
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Student Name</label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter student name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                maxLength={80}
                            />
                            
                            {errors.name && (
                            <p className="text-red-500 text-sm">
                            {errors.name}
                            </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            {errors.email && (
                            <p className="text-red-500 text-sm">
                            {errors.email}
                            </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="10 digit phone number"
                                value={form.phone}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                maxLength={10}
                                required
                            />
                            {errors.phone && (
                            <p className="text-red-500 text-sm">
                            {errors.phone}
                            </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Department</label>

                            <select
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Department</option>

                                <option value="Computer Science">
                                    Computer Science
                                </option>

                                <option value="Information Technology">
                                    Information Technology
                                </option>

                                <option value="Electronics">
                                    Electronics
                                </option>

                                <option value="Mechanical">
                                    Mechanical
                                </option>

                                <option value="Commerce">
                                    Commerce
                                </option>
                            </select>
                            {errors.department && (
                            <p className="text-red-500 text-sm">
                            {errors.department}
                            </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Academic Year</label>

                            <select
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Year</option>
                                <option value="1">First Year</option>
                                <option value="2">Second Year</option>
                                <option value="3">Third Year</option>
                                <option value="4">Fourth Year</option>
                            </select>
                            {errors.year && (
                            <p className="text-red-500 text-sm">
                            {errors.year}
                            </p>
                            )}
                        </div>

                    </div>

                    <div className="form-actions">

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Please wait..."
                                : editingId
                                    ? "Update Student"
                                    : "Add Student"
                            }
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

            </section>

            {/* Student table */}
            <section className="card">

                <h2>Student Details</h2>

                {/* Search and filter */}
                <div className="filters">

                    <input
                        type="text"
                        placeholder="Search by student name..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <select
                        value={departmentFilter}
                        onChange={(event) =>
                            setDepartmentFilter(event.target.value)
                        }
                    >
                        <option value="All">All Departments</option>
                        <option value="Computer Science">
                            Computer Science
                        </option>
                        <option value="Information Technology">
                            Information Technology
                        </option>
                        <option value="Electronics">
                            Electronics
                        </option>
                        <option value="Mechanical">
                            Mechanical
                        </option>
                        <option value="Commerce">
                            Commerce
                        </option>
                    </select>

                </div>

                {loading ? (

                    <p className="empty">Loading students...</p>

                ) : filteredStudents.length === 0 ? (

                    <p className="empty">
                        {students.length === 0
                            ? "No student records available. Add your first student!"
                            : "No students found matching your search."
                        }
                    </p>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredStudents.map((student) => (

                                    <tr key={student._id}>

                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.phone}</td>
                                        <td>{student.department}</td>
                                        <td>{student.year}</td>

                                        <td className="actions">

                                            <button
                                                type="button"
                                                className="edit-btn"
                                                onClick={() =>
                                                    handleEdit(student)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(student._id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </main>
    );
}

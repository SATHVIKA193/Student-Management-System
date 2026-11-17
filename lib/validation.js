
export function validateStudent(formData) {
    const errors = {};

    const name = formData.name?.trim() || "";
    const email = formData.email?.trim() || "";
    const phone = String(formData.phone ?? "").trim();
    const department = formData.department?.trim() || "";
    const year = String(formData.year ?? "").trim();

    // Name validation
    if (!name) {
        errors.name = "Student name is required";
    } else if (name.length > 80) {
        errors.name = "Name cannot exceed 80 characters";
    } else if (!/^[A-Za-z ]+$/.test(name)) {
        errors.name = "Name must contain only alphabets and spaces";
    }

    // Email validation
    if (!email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address";
    }

    // Phone validation
    if (!phone) {
        errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
        errors.phone = "Phone number must contain exactly 10 digits";
    }

    // Department validation
    const allowedDepartments = [
        "Computer Science",
        "Information Technology",
        "Electronics",
        "Mechanical",
        "Commerce"
    ];

    if (!department) {
        errors.department = "Please select a department";
    } else if (!allowedDepartments.includes(department)) {
        errors.department = "Please select a valid department";
    }

    // Academic year validation
    if (!year) {
        errors.year = "Please select an academic year";
    } else if (!["1", "2", "3", "4"].includes(year)) {
        errors.year = "Academic year must be between 1 and 4";
    }

    return errors;
}

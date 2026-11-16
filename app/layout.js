
import "./globals.css";

export const metadata = {
    title: "Student Management System",
    description: "Manage student records using Next.js and MongoDB"
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}

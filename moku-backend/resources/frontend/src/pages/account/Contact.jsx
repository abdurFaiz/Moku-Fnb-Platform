import React from "react";
import { Link } from "react-router-dom";

export default function Contact() {
    const contacts = [
        { id: 12, name: "John Doe", role: "Software Engineer" },
        { id: 45, name: "Jane Smith", role: "Project Manager" },
        { id: 99, name: "Michael Brown", role: "UI/UX Designer" },
    ];

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-5 text-center">
                📞 Contact List
            </h2>

            <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
                {contacts.map((c) => (
                    <Link
                        key={c.id}
                        to={`/contact/${c.id}`}
                        className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
                    >
                        <div>
                            <h3 className="text-gray-800 font-medium">
                                {c.name}
                            </h3>
                            <p className="text-sm text-gray-500">{c.role}</p>
                        </div>
                        <span className="text-blue-600 text-sm font-medium">
                            View →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

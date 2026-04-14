import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ContactDetail() {
    const { id } = useParams();

    return (
        <div className="max-w-md mx-auto text-center bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                📇 Contact Detail
            </h2>
            <p className="text-gray-500 mb-4">
                This is detail page for contact ID:
            </p>
            <p className="text-3xl font-bold text-blue-600 mb-6">{id}</p>

            <Link
                to="/contact"
                className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
                ← Back to Contacts
            </Link>
        </div>
    );
}

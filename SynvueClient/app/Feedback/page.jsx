"use client";

import { useState } from "react";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: "", email: "", feedback: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Feedback:", formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
          Feedback Form
        </h2>
        {submitted ? (
          <div className="text-center text-green-600 text-xl font-semibold">
            Thank you for your feedback!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-blue-700 font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-blue-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="feedback" className="block text-blue-700 font-medium mb-1">
                Feedback
              </label>
              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
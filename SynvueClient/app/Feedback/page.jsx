"use client";

import { useState } from "react";
import Sidebar from "../_component/Sidebar";
import { FaMailchimp, FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function FeedbackForm() {
  const { user } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mail: "",
    message: "",
    request: "Feedback",
  });

  // Prefill user data
  useState(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.firstName || "",
        mail: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/mailer", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.message === "We will contact you soon!!") {
        setSubmitted(true);
        toast.success("✅ Message sent successfully!");
        setFormData({ name: "", mail: "", message: "", request: "Feedback" });
      } else {
        toast.error("❌ Something went wrong!");
      }
    } catch (error) {
      toast.error(`❌ ${error.message || "Submission failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <main className="flex flex-col items-center justify-center w-full px-4 py-12 md:mt-8">
        <div className="w-full max-w-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 md:p-12 rounded-3xl shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center mb-8">
            Feedback Form
          </h2>

          {submitted ? (
            <div className="text-center text-green-600 text-xl font-semibold">
              🎉 Thank you for your valuable feedback!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-blue-700 font-medium mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="mail"
                  className="block text-blue-700 font-medium mb-1"
                >
                
                  Email
                </label>
                <input
                  type="email"
                  name="mail"
                  value={formData.mail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Feedback Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-blue-700 font-medium mb-1"
                >
                  Bug Report
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center items-center w-full bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-700"
                } text-gray-800 font-semibold py-3 rounded-xl transition-all`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <span>Submit Bug</span>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

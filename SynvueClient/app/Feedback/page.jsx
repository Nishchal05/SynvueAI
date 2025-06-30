"use client";

import { useState } from "react";
import Sidebar from "../_component/Sidebar";
import { FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";
export default function FeedbackForm() {
  const [formData, setFormData] = useState({ name: "", mail: "", message: "", request: "Feedback"});
  const [submitted, setSubmitted] = useState(false);
  const [loading,setloading]=useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
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
      setloading(false);
    }
  };  
  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <main className="flex flex-col items-center justify-center w-full px-4 py-12 md:mt-8">
        <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-3xl shadow-2xl">
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
                <label htmlFor="name" className="block text-blue-700 font-medium mb-1">
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
                <label htmlFor="email" className="block text-blue-700 font-medium mb-1">
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

              {/* Feedback */}
              <div>
                <label htmlFor="feedback" className="block text-blue-700 font-medium mb-1">
                  Your Feedback
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

              {/* Submit Button */}
              <button
                type="submit"
                className="flex justify-center items-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
              {loading ? <FaSpinner className=" animate-spin"/>:<h1>Submit Feedback</h1>}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

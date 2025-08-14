"use client";

import { useState, useEffect } from "react";
import { FaLinkedin, FaInstagram, FaXTwitter, FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Sidebar from "../_component/Sidebar";

export default function ContactPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mail: "",
    message: "",
    request: "Contact",
  });

  // Effect to pre-fill the form with user data if available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.fullName || "",
        mail: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);

  // Handler for form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/mailer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Message sent successfully! We'll be in touch soon.");
        // Reset form after successful submission
        setForm({ name: "", mail: "", message: "", request: "Contact" });
      } else {
        toast.error(result?.error || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Submission failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container with the themed gradient, centering the content
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 font-sans">
    <Sidebar/>
      <div className="w-full max-w-2xl">
        {/* Glassmorphism card effect for a modern look */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg p-8 md:p-12 mt-15">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Get in Touch</h1>
            <p className="text-gray-600 mt-2">We’d love to hear from you!</p>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-white/70 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
              {/* Email Input */}
              <div>
                <label htmlFor="mail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="mail"
                  name="mail"
                  placeholder="john.doe@example.com"
                  value={form.mail}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-white/70 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="How can we help you?"
                value={form.message}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white/70 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center p-3 font-semibold text-white rounded-lg transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Send Message"}
            </button>
          </form>
        </div>

        {/* Social Icons Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-3">Follow us on</p>
          <div className="flex justify-center space-x-6 text-2xl text-gray-700">
            <a href="https://www.linkedin.com/in/nishchal-sundan" target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 transition" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://www.instagram.com/nishchal_sundan20_04/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 transition" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://x.com/Nishchal_Sundan" target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 transition" aria-label="Twitter">
              <FaXTwitter />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

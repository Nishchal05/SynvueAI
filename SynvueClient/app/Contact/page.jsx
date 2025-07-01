"use client";

import { useState, useEffect } from "react";
import { FaLinkedin, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { FaMailBulk, FaSpinner } from "react-icons/fa";
import Sidebar from "../_component/Sidebar";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function ContactPage() {
  const { user } = useUser(); // Correctly destructure
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mail: "",
    message: "",
    request: "Contact",
  });

  // Populate form with user info when loaded
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.firstName || "",
        mail: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("/api/mailer", {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.message === "We will contact you soon!!") {
        toast.success("✅ Message sent successfully!");
        setForm({ name: "", mail: "", message: "", request: "Contact" });
      } else {
        toast.error(result?.error || "❌ Something went wrong!");
      }
    } catch (error) {
      toast.error(`❌ ${error.message || "Submission failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Sidebar />
      <main className="flex flex-col items-center justify-center flex-1 py-10 md:ml-64">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
          {/* Heading */}
          <div className="text-center mb-10">
            <img
              src="/IntervueLogo.png"
              alt="SynvueAI Logo"
              className="mx-auto h-20 mb-4"
            />
            <h1 className="text-4xl font-extrabold text-blue-700">
              Contact SynvueAI
            </h1>
            <p className="text-gray-600 mt-2 text-base">
              We’d love to hear from you!
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 flex flex-col justify-center items-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="bg-gray-100 p-4 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="mail"
                placeholder="Your Email"
                className="bg-gray-100 p-4 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.mail}
                onChange={handleChange}
                required
              />
            </div>
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message"
              className="w-full bg-gray-100 p-4 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className={`flex justify-center items-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"
              } text-white font-semibold px-6 py-3 rounded-xl w-full md:w-1/2 mx-auto transition-all duration-300`}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <span>Send Message</span>
              )}
            </button>
          </form>

          {/* Social Icons */}
          <div className="mt-10 text-center">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">
              Follow us
            </h2>
            <div className="flex justify-center space-x-6 text-2xl text-blue-600">
              <a
                href="https://www.linkedin.com/in/nishchal-sundan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-800 transition"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.instagram.com/nishchal_sundan20_04/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition"
                aria-label="Instagram"
                title="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://x.com/Nishchal_Sundan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition"
                aria-label="Twitter"
                title="Twitter"
              >
                <FaXTwitter />
              </a>
              <a
                href="mailto:synvue@gmail.com"
                className="hover:text-red-600 transition"
                aria-label="Email"
                title="Email"
              >
                <FaMailBulk />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

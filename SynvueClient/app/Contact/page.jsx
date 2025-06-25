"use client";
import { useState } from "react";
import { FaLinkedin, FaInstagram, FaXTwitter } from "react-icons/fa6";
import Sidebar from "../_component/Sidebar";
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can integrate your backend/API call here
    alert("Message sent!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
        <Sidebar/>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <img src="/IntervueLogo.png" alt="SynvueAI" className="mx-auto h-20 mb-4" />
          <h1 className="text-3xl font-bold text-blue-700">Contact SynvueAI</h1>
          <p className="text-gray-600 mt-2">We’d love to hear from you</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="border border-blue-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="border border-blue-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <textarea
            name="message"
            rows={5}
            placeholder="Your Message"
            className="w-full border border-blue-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.message}
            onChange={handleChange}
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Send Message
          </button>
        </form>

        <div className="mt-10 text-center">
          <h2 className="text-lg font-semibold text-blue-600 mb-2">Follow us on</h2>
          <div className="flex justify-center space-x-6 text-2xl text-blue-500">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <FaXTwitter />
            </a>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
